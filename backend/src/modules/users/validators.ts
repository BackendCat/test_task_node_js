/**
 * Shared validators for frontend and backend.
 * They return value only ON error, otherwise - null.
 */


import {
    ErrorAdvice,
    getOneFromValidator,
    SchemaValidator, validateSchema,
    validators
} from "../../utils/validators";
const {lenIs255, isString, isBool} = validators;
import { Roles, User } from "./types";
import { APIErrorForbidden, APIErrorWithValidation } from "../../utils/api_errors";
import { NextFunction } from "express";
import { LayeredRequest, Layers } from "../../utils/middleware_wrap";


export const validateEmail = (email: string): ErrorAdvice | null => {
    const mailReg = new RegExp(
        '^[^\\s@]+@' +
        '[^\\s@]+' +
        '\\.[^\\s@]+$'
    );
    return mailReg.test(email)
        ? null
        : "Введите корректное значение почты.";
};


export const validateNumber = (phone: string): ErrorAdvice | null => {
    phone = phone.replace(/\D/g, "");
    const phoneReg = new RegExp(
        "^(\\d{1,3})" +
        "(\\d{3})" +
        "(\\d{7})$"
    );
    return phoneReg.test(phone)
        ? null
        : "Введите корректное значение номера телефона.";
};


// Length [8, 32] characters, letters of both cases, one digit, and one special character
export const validatePassword = (password: string): ErrorAdvice | null => {
    if (password.length < 8)
        return "Пароль должен содержать минимум 8 символов.";

    if (password.length > 32)
        return "Пароль должен быть короче 32 символов.";

    if (!(/[a-zа-я]/.test(password) && /[A-ZА-Я]/.test(password)))
        return "Пароль должен содержать буквы обоих регистров.";

    if (!/\d/.test(password))
        return "Пароль должен содержать хотя бы одну цифру.";

    if (!/[!@#$%^&*(),.?":{}|/\\_<>]/.test(password))
        return "Пароль должен содержать хотя бы один спецсимвол.";

    return null;
};


export const validateAdmin = (
    req: LayeredRequest, next: NextFunction
): boolean => {
    const currentUser = req[Layers.authMiddleware]?.user;
    const isAdmin = currentUser?.role === Roles.admin;
    if (isAdmin) {
        next(new APIErrorForbidden('Forbidden: Only administrators can perform this action'));
    }
    return !isAdmin;
};


const str255 = [isString, lenIs255];
export const UserSchemaValidator: SchemaValidator = {
    email: [...str255, validateEmail],
    password: [...str255, validatePassword],
    first_name: str255,
    second_name: str255,
    last_name: str255,
    role: getOneFromValidator(Roles),
    is_active: isBool,
    last_seen: Date, // No really need to check, it's operated by db
};


export const validateUserFields = (
    user: User, next: NextFunction, allowSkip: boolean
): boolean => {
    const validationErrors = validateSchema(user, UserSchemaValidator, allowSkip);

    const hasErrors = Object.values(validationErrors).some(error => error !== null);
    if (hasErrors) {
        next(new APIErrorWithValidation('Validation errors occurred.', validationErrors));
    }
    return hasErrors;
};
