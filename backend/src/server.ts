import http, { IncomingMessage, ServerResponse } from 'http';
import app from './app';
import logger from './logger';
import loadBasicConfig from './config';


loadBasicConfig();


const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);


const server = http.createServer(
    (req: IncomingMessage, res: ServerResponse) => app(req, res)
);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


function normalizePort(val: string): string | number | false {
    const port = parseInt(val, 10);
    if (isNaN(port)) return val;
    if (port >= 0) return port;
    return false;
}


function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;

    const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

    switch (error.code) {
        case 'EACCES':
            logger.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            logger.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}


function onListening(): void {
    const addr = server.address();
    if (addr === null) {
        logger.error('Server address is null');
        return;
    }
    const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
    logger.info(`Listening on ${bind}`);
}
