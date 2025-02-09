import { QueryResult, FieldPacket } from 'mysql2';
import formatString from './format_string';
import db from '../db/connection';
import logger from "../logger";


/**
 * Simple utils for simple requests.
 * ! DANGER: USE CAREFULLY WITH RECEIVED OBJECTS (use allowMasked for protection)!
 */


type FieldsData = Record<string, any>;

type BuildQuery = Promise<[QueryResult, FieldPacket[]]>;

const missingFieldsErr = 'Not enough fields in {clauseName} clause to perform {queryType} query on {table}.';

type ClauseData = [string, any[]];


export const includeOrExclude = (
    obj: FieldsData,
    keys: string[],
    include: boolean = true,
): FieldsData => {
    return Object.fromEntries(
        Object.entries(obj).filter(([key]) => {
            const shouldInclude = keys.includes(key);
            return include ? shouldInclude : !shouldInclude;
        })
    );
};


const buildClause = (
    data: FieldsData,
    joiner: string,
    table: string,
    queryType: string,
    clauseName: string
): ClauseData => {
    const keys = Object.keys(data).filter(
        key => data[key] !== undefined && data[key] !== null
    );

    if (keys.length === 0) {
        throw new Error(formatString({
            template: missingFieldsErr,
            named: {table, queryType, clauseName},
        }));
    }

    const clause = keys.map(key => `${key} = ?`).join(joiner);
    const clauseValues = keys.map(key => data[key]);

    return [clause, clauseValues];
};


export const buildInsertQuery = (
    tableName: string,
    data: FieldsData
): BuildQuery => {
    const [columnsClause, columnsValues] = buildClause(data, ', ', tableName, 'INSERT', 'VALUES');
    const placeholders = columnsValues.map(() => "?").join(", ");

    const sql = `INSERT INTO ${tableName} (${columnsClause}) VALUES (${placeholders}) RETURNING *;`;

    return db.execute(sql, columnsValues);
};


export const buildUpdateQuery = (
    tableName: string,
    data: FieldsData,
    where: FieldsData,
    whereJoiner: string = 'AND'
): BuildQuery => {
    const [setClause, setValues] = buildClause(data, ', ', tableName, 'UPDATE', 'SET');
    const [whereClause, whereValues] = buildClause(where, ` ${whereJoiner} `, tableName, 'UPDATE', 'WHERE');

    const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${whereClause} RETURNING *;`;

    return db.execute(sql, [...setValues, ...whereValues]);
}


export const buildDeleteQuery = (
    tableName: string,
    where: FieldsData,
    whereJoiner: string = 'AND'
): BuildQuery => {
    const [whereClause, whereValues] = buildClause(where, ` ${whereJoiner} `, tableName, 'DELETE', 'WHERE');

    const sql = `DELETE FROM ${tableName} WHERE ${whereClause}`;

    return db.execute(sql, whereValues);
};


interface SelectQueryProps {
    tableName: string;
    columns?: string[] | string;
    where?: FieldsData;
    whereJoiner?: string;
    limit?: number;
    offset?: number;
};

export const buildSelectQuery = ({
    tableName,
    columns= '*',
    where = {},
    whereJoiner = 'AND',
    limit,
    offset
}: SelectQueryProps): BuildQuery => {
    const columnsClause = Array.isArray(columns)
        ? columns.join(', ')
        : '*'

    let whereClause = '';
    let whereValues: any[] = [];

    if (Object.keys(where).length > 0) {
        const [clause, values] = buildClause(where, ` ${whereJoiner} `, tableName, 'SELECT', 'WHERE');
        whereClause = `WHERE ${clause}`;
        whereValues = values;
    }

    let sql = `SELECT ${columnsClause} FROM ${tableName} ${whereClause}`;

    if (limit !== undefined) {
        sql += ' LIMIT ?';
        whereValues.push(limit);
    }
    if (offset !== undefined) {
        sql += ' OFFSET ?';
        whereValues.push(offset);
    }

    return db.execute(sql, whereValues);
};


export const isDatabaseError = (error: any): boolean => {
    const dbErrorCodes = [
        'ER_ACCESS_DENIED_ERROR',  // Authentication error
        'ER_BAD_DB_ERROR',         // Database does not exist
        'ER_CON_COUNT_ERROR',      // Too many connections
        'ER_LOCK_WAIT_TIMEOUT',    // Lock wait timeout exceeded
        'ER_PARSE_ERROR',          // SQL syntax error
        'ER_SYNTAX_ERROR',         // General SQL syntax error
        'ER_UNKNOWN_ERROR',        // Unknown database error
        'ER_DUP_ENTRY',            // Duplicate entry (e.g., unique constraint violation)
        'ER_NO_REFERENCED_ROW',    // Foreign key constraint fails
        'ER_NO_REFERENCED_ROW_2',  // Foreign key constraint fails (alternative code)
        'ER_ROW_IS_REFERENCED',    // Foreign key constraint prevents delete
        'ER_ROW_IS_REFERENCED_2',  // Foreign key constraint prevents delete (alternative)
        'ER_TABLE_EXISTS_ERROR',   // Table already exists
        'ER_BAD_FIELD_ERROR',      // Column does not exist
        'ER_DATA_TOO_LONG',        // Data too long for column
        'ER_WRONG_VALUE_COUNT_ON_ROW', // Incorrect number of values in row
        'ECONNREFUSED',            // Database connection refused
        'ETIMEDOUT',               // Connection timeout
    ];

    return dbErrorCodes.includes(error.code);
};


export const processSQLError = (error: any): any => {
    const isServiceErr = isDatabaseError(error);
    if (isServiceErr) {
        logger.error(error);
    }
    return {
        result: null,
        error: isServiceErr ? 'Internal Server Error.' : error.message,
        isServiceErr
    };
};


export const dewrapRow = (result: any): any => (result as any)?.[0];
