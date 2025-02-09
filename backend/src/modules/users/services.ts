/**
 * All services return data or null and wrapped error message
 * which shows if error was occurred because of data state.
 */


import {
    includeOrExclude,
    dewrapRow,
    buildInsertQuery,
    buildDeleteQuery,
    buildUpdateQuery,
    buildSelectQuery,
    isDatabaseError, processSQLError
} from '../../utils/dbUtils';
import { User, UserIdentifier, protectedFields } from './types';
import { Pagination, ServiceResponse } from "../../utils/types";


export const getUser = async (identifier: UserIdentifier): Promise<ServiceResponse> => {
    try {
        const [result] = await buildSelectQuery({tableName: 'users', where: identifier});
        if (Array.isArray(result) && result.length) {   // To shut up TS
            return {result: result[0] as User, error: null};
        }
        return {
            result: null,
            error: 'Searched user does not exist.',
        };
    } catch (error: any) {
        return processSQLError(error);
    }
};


/*
* Idk why, bt I thought it would be a good mechanic to make lazy articles deletion for lower db pressure.
* But now I understand it can potentially cause troubles with articles which can be seen after
* user has page loaded fast, or make registration slover.
* I created then a DB trigger for articles deletion on is_active = false action, but borrow creation is still here.
*/
export const createOrBorrowUser = async (user: User): Promise<ServiceResponse> => {
    try {
        const [existingUsers] = await buildSelectQuery({
            tableName: 'users',
            where: {email: user.email},
        });

        const existingUser = dewrapRow(existingUsers);
        const safeUser = includeOrExclude(user, protectedFields, false);

        if (existingUser) {
            if (!existingUser.is_active) {
                const [result] = await buildUpdateQuery('users', safeUser, {id: existingUser.id});
                return {
                    result: dewrapRow(result),
                    error: null,
                };
            }
            return {
                result: null,
                error: 'User with same uniqueness identifiers already exists.',
            };
        }
        const [result] = await buildInsertQuery('users', safeUser);
        return {
            result: dewrapRow(result),
            error: null
        };
    } catch (error: any) {
        return processSQLError(error);
    }
};


export const updateUser = async (
    user: Record<string, any>, identifier: UserIdentifier
): Promise<ServiceResponse> => {
    try {
        const safeUser = includeOrExclude(user, protectedFields, false);
        const [updateResult] = await buildUpdateQuery('users', safeUser, identifier);

        return (updateResult as any).affectedRows > 0
            ? {result: dewrapRow(updateResult), error: null}
            : {result: null, error: 'Requested user not found.'};
    } catch (error: any) {
        return processSQLError(error);
    }
};


export const deleteUser = async (
    identifier: UserIdentifier, isLogicDeletion: boolean
): Promise<ServiceResponse> => {
    try {
        let deleteResult;
        if (isLogicDeletion) {
            [deleteResult] = await buildUpdateQuery('users', {is_active: false}, identifier);
        } else {
            [deleteResult] = await buildDeleteQuery('users', identifier);
        }
        return (deleteResult as any).affectedRows > 0
            ? {result: null, error: null}
            : {result: null, error: 'User not found'};
    } catch (error: any) {
        return processSQLError(error);
    }
};


export const fetchUsers = async (
    paginate: Pagination
): Promise<ServiceResponse> => {
    try {
        const {page = 1, limit = 10} = paginate;
        const offset = (page - 1) * limit;
        const [users] = await buildSelectQuery({tableName: 'users', limit, offset});
        return {
            result: users,
            error: null
        };
    } catch (error: any) {
        return processSQLError(error);
    }
};
