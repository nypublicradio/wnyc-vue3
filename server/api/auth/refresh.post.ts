import { defineEventHandler, readBody, createError } from 'h3';
import { createClient } from '@supabase/supabase-js';
import { generateToken } from '../../utils/jwt';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();

    // Initialize Supabase client
    const supabase = createClient(
        config.public.supabaseUrl,
        config.public.supabaseKey
    );

    const body = await readBody(event);
    const { refreshToken } = body;

    if (!refreshToken) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Refresh token is required',
        });
    }

    try {
        // Refresh session with Supabase
        const { data, error } = await supabase.auth.refreshSession({
            refresh_token: refreshToken,
        });

        if (error) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: error.message,
            });
        }

        if (!data.user) {
            throw createError({
                statusCode: 401,
                statusMessage: 'Unauthorized',
                message: 'Session refresh failed',
            });
        }

        // Generate new JWT token
        const token = generateToken({
            userId: data.user.id,
            email: data.user.email!,
        });

        return {
            success: true,
            token,
            user: {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata,
            },
        };
    } catch (error) {
        // Re-throw H3 errors
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Token refresh failed',
        });
    }
});