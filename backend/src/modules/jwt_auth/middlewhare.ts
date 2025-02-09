import { Request, Response, NextFunction } from 'express';
import { buildSelectQuery } from '../../utils/dbUtils';
import jwt from 'jsonwebtoken';
import { APIError } from "../../utils/api_errors";
import { getUser } from '../users/services';
import { JWTClaims } from "./types";
import JWT_SECRET from "./index";


export const buildAuthorizeLayer = (namespace: string) => async (
    req: Request, res: Response, next: NextFunction
) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        next(new APIError('Token in "Authorization" header is not provided.'));
        return;
    }

    const invalidTokenErr = new APIError('Provided token is invalid or expired.');

    let decoded;
    try {
        decoded = jwt.verify(token, JWT_SECRET) as JWTClaims;
    } catch (error) {
        next(invalidTokenErr);
        return;
    }

    const [tokensSelect] = await buildSelectQuery({
        tableName: 'revoked_tokens',
        where: {jti: decoded.jti}
    });
    if ((tokensSelect as any).length > 0) {
        next(invalidTokenErr);
        return;
    }

    const user = getUser({id: decoded.user_id});
    if (!user) {
        next(new APIError('User with given credentials does not exist.'));
        return;
    }

    (req as any)[namespace] = {user: user}
    next();
};
