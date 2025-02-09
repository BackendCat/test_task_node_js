import { buildInsertQuery, buildSelectQuery, processSQLError } from "../../utils/dbUtils";
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import JWT_SECRET from './index';
import { JWTClaims } from './types';
import { getUser } from '../users/services';
import { generateAccessToken, generateRefreshToken } from './utils';
import { ServiceResponse } from "../../utils/types";


export const isTokenRevoked = async (jti: string): Promise<ServiceResponse> => {
    try {
        const [result] = await buildSelectQuery({
            tableName: 'revoked_tokens',
            where: {jti},
        });
        return {result: (result as any).length > 0, error: null};
    } catch (error: any) {
        return processSQLError(error);
    }
};


export const revokeToken = async (
    jti: string, userId: number
): Promise<ServiceResponse> => {
    try {
        const [result] = await buildInsertQuery('revoked_tokens', {jti, user_id: userId});
        return {
            result: null,
            error: (result as any).affectedRows === 0 ? 'Error revoking token.' : null
        };
    } catch (error: any) {
        return processSQLError(error);
    }
};


export const updateAccessToken = async (refreshToken: string): Promise<ServiceResponse> => {
    try {
        const decoded = jwt.verify(refreshToken, JWT_SECRET) as JWTClaims;

        const user = await getUser({id: decoded.user_id});
        const isRevokedResponse = await isTokenRevoked(decoded.jti);

        if (!user || isRevokedResponse.result) {
            return {result: null, error:  user  ? 'User not found.' : 'Refresh token has been revoked.'};
        }

        const newAccessToken = generateAccessToken(user.result, decoded.jti);
        return {result: newAccessToken, error: null};
    } catch (error: any) {
        return processSQLError(error);
    }
};


const generateTokens = async (userId: number): Promise<ServiceResponse> => {
    const jti = uuidv4();

    const accessToken = generateAccessToken(userId, jti);
    const refreshToken = generateRefreshToken(userId, jti);

    return {result: {access: accessToken, refresh: refreshToken}, error: null};
};

