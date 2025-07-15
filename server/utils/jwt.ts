import jwt from 'jsonwebtoken';
import { createError, getHeader } from 'h3';

export interface JWTPayload {
    userId: string;
    email: string;
    exp?: number;
    iat?: number;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: Omit<JWTPayload, 'exp' | 'iat'>): string {
    const config = useRuntimeConfig();
    const secret = config.jwtSecret as string;
    const expiresIn = config.jwtExpiresIn as string;

    return jwt.sign(payload, secret, {
        expiresIn,
    } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload {
    const config = useRuntimeConfig();
    const secret = config.jwtSecret as string;

    try {
        const decoded = jwt.verify(token, secret,
            {
                algorithms: ['HS256'], // Ensure the algorithm matches your signing method
                issuer: 'wnyc-vue3-app' // Verify issuer matches
            }
        ) as jwt.JwtPayload;
        return {
            userId: decoded.userId as string,
            email: decoded.email as string,
            exp: decoded.exp,
            iat: decoded.iat,
        };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Token expired',
            });
        }

        if (error.name === 'JsonWebTokenError') {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Invalid token',
            });
        }

        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Token verification failed',
        });
    }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string {
    if (!authHeader) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'No authorization header provided',
        });
    }

    if (!authHeader.startsWith('Bearer ')) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: 'Invalid authorization header format. Expected: Bearer <token>',
        });
    }

    return authHeader.substring(7);
}

/**
 * Middleware to verify JWT authentication
 */
export function requireAuth(event: any): JWTPayload {
    const authHeader = getHeader(event, 'authorization');
    const token = extractTokenFromHeader(authHeader);
    return verifyToken(token);
}
