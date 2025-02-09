// For conventional namings:
export interface JWTClaims {
    jti: string;
    iat: number;
    exp: number;
    user_id: number;
    is_admin: boolean;
};