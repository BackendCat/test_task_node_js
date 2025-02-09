import { Router } from 'express';
import middleware_wrap from '../../utils/middleware_wrap';
import {
    register,
    login,
    logout,
    refresh,
    verify,
} from './controllers';

const JWTRoutes = Router();


JWTRoutes.post('/register', register); // Requires a created account
JWTRoutes.post('/login',    login);
JWTRoutes.post('/logout', ...middleware_wrap(logout));
JWTRoutes.post('/refresh',...middleware_wrap(refresh));
JWTRoutes.post('/verify', ...middleware_wrap(verify));



export default JWTRoutes;
