import express, { Application, Request, Response, NextFunction } from 'express';
import logger, { httpLogger } from './logger';
import { APIError } from "./utils/api_errors";
import userRoutes from './modules/users/routes';
import JWTRoutes from './modules/jwt_auth/routes';
import ArticleRoutes from './modules/arcticles/routes';


const app: Application = express();
app.use(httpLogger);
app.use(express.json());
app.use(errLoggerHandler);
app.use(errorsHandler);

app.use('/users', userRoutes);
app.use('/jwt_auth', JWTRoutes);
app.use('/articles', ArticleRoutes);


function errLoggerHandler(
    err: Error, req: Request, res: Response, next: NextFunction
): void {
    if (res.statusCode === 500 || process.env.NODE_ENV === 'debug') {
        logger.error(err.message);
    }
    next(err);
}


const errMessages: Record<number, string> = {
    400: 'Bad request.',
    401: 'Authentication credentials were not provided.',
    403: 'You do not have permission to perform this action.',
    404: 'Not found.',
    405: 'Method not allowed.',
    500: 'A server error occurred.',
};


function errorsHandler(
    err: APIError, req: Request, res: Response, next: NextFunction
): void {
    const code = err.code || 500;
    const details = err.details || errMessages[code] || errMessages[500];

    res.status(code).json({
        code: code,
        details: details,
    });
}

export default app;
