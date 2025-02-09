import { Request, Response, NextFunction } from 'express';
import { APIError } from '../../utils/api_errors';
import { generateTokens, revokeToken, updateAccessToken } from './services';
import { buildSelectQuery } from '../../utils/dbUtils';
import bcrypt from 'bcrypt';
import { comparePassword } from './utils';  // Импортируем вспомогательную функцию для сравнения пароля

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Ищем пользователя в базе данных по email
        const [existingUsers] = await buildSelectQuery({
            tableName: 'users',
            where: { email },
        });

        if (existingUsers.length === 0) {
            return next(new APIError('User with this email not found.'));
        }

        const user = existingUsers[0];

        // Сравниваем переданный пароль с хэшом пароля из базы данных
        const isPasswordCorrect = await comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            return next(new APIError('Invalid password.'));
        }

        // Генерируем токены
        const { access, refresh } = await generateTokens(user.id);

        // Отправляем их в ответ
        res.status(200).json({
            access,
            refresh,
        });
    } catch (error) {
        next(new APIError('Error during registration.'));
    }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Ищем пользователя в базе данных по email
        const [existingUsers] = await buildSelectQuery({
            tableName: 'users',
            where: { email },
        });

        if (existingUsers.length === 0) {
            return next(new APIError('Invalid email or password.'));
        }

        const user = existingUsers[0];

        // Сравниваем переданный пароль с хэшом пароля из базы данных
        const isPasswordCorrect = await comparePassword(password, user.password);
        if (!isPasswordCorrect) {
            return next(new APIError('Invalid email or password.'));
        }

        // Генерируем токены
        const { access, refresh } = await generateTokens(user.id);

        // Отправляем их в ответ
        res.status(200).json({
            access,
            refresh,
        });
    } catch (error) {
        next(new APIError('Error logging in.'));
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new APIError('Token not provided.'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JWTClaims;
        const jti = decoded.jti;
        const userId = decoded.user_id;

        // Отзываем токен, чтобы его больше нельзя было использовать
        const revokeResponse = await revokeToken(jti, userId);
        if (revokeResponse.error) {
            return next(new APIError('Error revoking token.'));
        }

        res.status(200).json({
            message: 'Logged out successfully',
        });
    } catch (error) {
        next(new APIError('Error logging out.'));
    }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        const accessTokenResponse = await updateAccessToken(refreshToken);
        if (accessTokenResponse.error) {
            return next(new APIError(accessTokenResponse.error));
        }

        res.status(200).json({ access: accessTokenResponse.result });
    } catch (error) {
        next(new APIError('Error refreshing access token.'));
    }
};

export const verify = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return next(new APIError('Token not provided.'));
        }

        jwt.verify(token, process.env.JWT_SECRET as string);

        res.status(200).json({
            message: 'Token is valid',
        });
    } catch (error) {
        next(new APIError('Invalid or expired token.'));
    }
};
