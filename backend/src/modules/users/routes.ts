import express from 'express';
import {
    createUserController,
    deleteSelfUserController,
    updateSelfUserController,
    changeUserRoleController,
    getUsersController,
} from './controllers'
import middleware_wrap from "../../utils/middleware_wrap";

const userRoutes = express.Router();


// ! Note: make more convenient applying
userRoutes.post('/create',         createUserController);
userRoutes.post('/delete',         ...middleware_wrap(deleteSelfUserController));
userRoutes.post('/update_profile', ...middleware_wrap(updateSelfUserController));

// Admins only:
userRoutes.post('/change_user_role', ...middleware_wrap(changeUserRoleController));
userRoutes.post('/users_list/',      ...middleware_wrap(getUsersController));  // Query params used


export default userRoutes;
