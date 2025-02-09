import fs from 'fs';
import path from 'path';
import winston from 'winston';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';


/**
 * Https requests are loggen on debyg level.
 * During development logs are saved in files only.
*/


dotenv.config();


const logDir: string = process.env.LOG_DIR || './logs';
const logLevel: string = process.env.LOG_LEVEL || 'info';
const isDev: boolean = process.env.NODE_ENV === 'development';


if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}


const logFormat = winston.format.printf(({ timestamp, level, message }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});


const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
    ),
    transports: [
        ...(isDev
            ? [new winston.transports.Console(
                {format: winston.format.combine(winston.format.colorize(), logFormat)}
            )]
            : []),
        new winston.transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
        new winston.transports.File({ filename: path.join(logDir, 'info.log'), level: 'info' }),
    ],
});


export const httpLogger = logLevel === 'debug'
    ? morgan('combined', { stream: fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' }) })
    : (req: Request, res: Response, next: NextFunction) => next();  // Plug if not debug


export default logger;
