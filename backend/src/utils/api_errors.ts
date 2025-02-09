/**
 * Some classes I was so missing after moving from Django.
 * Needed to perform standardised errors responsing.
 */

import { ValidationAdvices } from "./validators";
import { ServiceResponse } from "./types";
import { NextFunction } from "express";


export interface APIErrorInterface {
    details: string;
};


export class APIError extends Error implements APIErrorInterface {
    name: string;
    details: string;

    constructor(details: string) {
        super(details);
        this.name = this.constructor.name;
        this.details = details;

        Error.captureStackTrace(this, this.constructor);
    }
};


export interface APIValidationError extends APIError {
    validationErrors?: ValidationAdvices;
};


export class APIErrorWithValidation extends APIError implements APIValidationError {
    validationErrors?: ValidationAdvices;

    constructor(
        details: string,
        validationErrors?: ValidationAdvices
    ) {
        super(details);
        this.validationErrors = validationErrors;
    }
};


export class APIErrorUnauthorized extends APIError {
    constructor(details: string) {
        super(details);
    }
};


export class APIErrorForbidden extends APIError {
    constructor(details: string) {
        super(details);
    }
};


export const forwardServiceError = (
    serviceResponse: ServiceResponse, next: NextFunction
): boolean => {
    if (serviceResponse.error) {
        const code = serviceResponse.isServerError ? 500 : 400;
        next(new APIError(serviceResponse.error));
    }
    return Boolean(serviceResponse.isServerError);
};
