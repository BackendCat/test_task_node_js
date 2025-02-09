/**
 * All middleware should be applied here.
 */

import { buildAuthorizeLayer } from '../modules/jwt_auth/middlewhare';
import { NextFunction, Request, Response } from "express";
import { Controller } from "./types";


export enum Layers {
    authMiddleware = 'AUTH_MIDDLEWARE',
};

export type LayeredRequest = Request & {
    [K in Layers]: Record<string, any>;
};



const withMiddleware = (controller: Controller): Controller[] => {
    return [
        buildAuthorizeLayer(Layers.authMiddleware),
        controller
    ];
};


export default withMiddleware;