import { NextFunction, Request, Response } from "express";
import { LayeredRequest } from "./middleware_wrap";


export type Controller = (
    req: LayeredRequest,
    res: Response<any, Record<string, any>>,
    next: NextFunction
) => Promise<void>;


export interface ServiceResponse {
    result: any;
    error: string | null;
    isServerError?: boolean; // Applied only if error is not null
};


export type Pagination = {
    page: number;
    limit: number
};

export type ErrorAdvice = string;

export type Validator = (validated: any) => ErrorAdvice | null;

export type ValidatorsChain = Validator[];

export type SchemaValidator = Record<string, ValidatorsChain | Validator>;
