/**
 * All controllers don't have errors catching there because
 * all errors ahe handled on service layer(s).
 * They also do not contain simple checks for authorization because they
 * are already performed by custom jwt middleware (see jwt_auth module).
 */


import { Response, NextFunction } from 'express';
import { validateAdmin, validateUserFields } from './validators';
import { Roles } from "./types";
import { createOrBorrowUser, deleteUser, fetchUsers, getUser, updateUser } from '../users/services';
import { APIErrorForbidden, APIErrorWithValidation, forwardServiceError } from "../../utils/api_errors";
import { Layers, LayeredRequest } from "../../utils/middleware_wrap";
import { hashPassword } from "./crypt";


const passwordHashWrapper = (data: Record<string, any>) => ({
    ...data,
    ...(data.password
        ? {password: hashPassword(data.password)}
        : {})
});


export const createUserController = async (
    req: LayeredRequest, res: Response, next: NextFunction
): Promise<void> => {
    const hasErrors = validateUserFields(req.body, next, false)
    if (hasErrors) return;

    const data = passwordHashWrapper(req.body);

    const serviceResponse = await createOrBorrowUser(req.body);
    if (!forwardServiceError(serviceResponse, next)) {
        res.status(200).json({user: serviceResponse.result});
    }
};


export const deleteSelfUserController = async (
    req: LayeredRequest, res: Response, next: NextFunction
): Promise<void> => {
    const user = req[Layers.authMiddleware].user;
    const serviceResponse = await deleteUser({id: user.id}, true);
    if (!forwardServiceError(serviceResponse, next)) {
        res.status(200).json({});
    }
};


export const updateSelfUserController = async (
    req: LayeredRequest, res: Response, next: NextFunction
): Promise<void> => {
    const hasErrors = validateUserFields(req.body, next, true)
    if (hasErrors) return;

    const data = passwordHashWrapper(req.body);

    const user = req[Layers.authMiddleware].user;
    const serviceResponse = await updateUser(data, {id: user.id});
    if (!forwardServiceError(serviceResponse, next)) {
        res.status(200).json({user: serviceResponse.result});
    }
};


export const changeUserRoleController = async (
    req: LayeredRequest, res: Response, next: NextFunction
) => {
    const {user_id, new_role} = req.body;
    if (!user_id && !new_role) {
        next(new APIErrorWithValidation('Required fields user_id and new_role are not provided.'));
        return;
    }

    if (!validateAdmin(req, next)) return;

    const serviceResponse = await updateUser({role: new_role}, {id: user_id});
    if (!forwardServiceError(serviceResponse, next)) {
        return res.status(200).json({
            message: 'User role updated successfully',
            result: serviceResponse.result
        });
    }
};

export const getUsersController = async (
    req: LayeredRequest, res: Response, next: NextFunction
) => {
    if (!validateAdmin(req, next)) return;

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const serviceResponse = await fetchUsers({page, limit});
    if (!forwardServiceError(serviceResponse, next)) {
        return res.status(200).json({users: serviceResponse.result});
    }
};

