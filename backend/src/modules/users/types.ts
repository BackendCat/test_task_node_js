/**
 * Types for users module.
 * ! Make strings lengths are synchronized with db schema.
 */


import { AtLeastOneFrom } from '../../utils/ts_helpers';
import { validateEmail, validatePassword } from './validators';


export enum Roles {
    user = 'user',
    author='author',
    admin = 'admin',
};

export interface User {
    id?: number;
    email: string;
    password: string;
    first_name: string;
    second_name: string;
    last_name: string;
    role: Roles;
    is_active: boolean;
    last_seen: Date;
};

export const protectedFields = [
    'id',
    'role',
    'last_seen',
    'is_active',
]

export type UserIdentifier = AtLeastOneFrom<{
    id?: number;
    email?: string;
}, 'id' | 'email'>;
