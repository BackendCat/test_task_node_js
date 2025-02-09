/**
 * ! Note place it to the .env
 */


import jwt from 'jsonwebtoken';
import JWT_SECRET from './index';


export const generateAccessToken = (userId: number, jti: string): string => {
    return jwt.sign(
        { user_id: userId, jti },
        JWT_SECRET,
        { expiresIn: '15m' }
    );
};

export const generateRefreshToken = (userId: number, jti: string): string => {
    return jwt.sign(
        { user_id: userId, jti },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};
