import { ref, computed } from 'vue';

interface User {
    id: string;
    email: string;
    user_metadata?: any;
}

interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

// Global state for authentication
const authToken = ref<string | null>(null);
const currentUser = ref<User | null>(null);
const isAuthenticated = computed(() => !!authToken.value && !!currentUser.value);

export const useAuth = () => {
    // Initialize from localStorage on client side
    if (process.client) {
        const stored = localStorage.getItem('auth_token');
        if (stored) {
            authToken.value = stored;
        }

        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
            try {
                currentUser.value = JSON.parse(storedUser);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                localStorage.removeItem('auth_user');
            }
        }
    }

    /**
     * Set authentication state (used by confirm page)
     */
    const setAuthState = (token: string, user: User) => {
        authToken.value = token;
        currentUser.value = user;

        if (process.client) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
        }
    };

    /**
     * Logout and clear authentication state
     */
    const logout = () => {
        authToken.value = null;
        currentUser.value = null;

        if (process.client) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
        }
    };

    /**
     * Verify current token
     */
    const verifyToken = async (): Promise<boolean> => {
        if (!authToken.value) return false;

        try {
            await $fetch('/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${authToken.value}`,
                },
            });
            return true;
        } catch (error) {
            console.error('Token verification failed:', error);
            logout();
            return false;
        }
    };

    /**
     * Refresh token using Supabase refresh token
     */
    const refreshToken = async (refreshToken: string): Promise<boolean> => {
        try {
            const data = await $fetch('/api/auth/refresh', {
                method: 'POST',
                body: { refreshToken },
            }) as AuthResponse;

            if (data.success && data.token) {
                authToken.value = data.token;
                currentUser.value = data.user;

                if (process.client) {
                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('auth_user', JSON.stringify(data.user));
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Token refresh failed:', error);
            logout();
            return false;
        }
    };

    /**
     * Make authenticated API calls
     */
    const authenticatedFetch = async (url: string, options: any = {}): Promise<any> => {
        if (!authToken.value) {
            throw new Error('No authentication token available');
        }

        const headers = {
            ...options.headers,
            Authorization: `Bearer ${authToken.value}`,
        };

        try {
            return await $fetch(url, {
                ...options,
                headers,
            });
        } catch (error: any) {
            // If token is expired or invalid, try to refresh or logout
            if (error.statusCode === 401) {
                logout();
                throw new Error('Authentication required');
            }
            throw error;
        }
    };

    return {
        // State
        authToken: readonly(authToken),
        currentUser: readonly(currentUser),
        isAuthenticated,

        // Methods
        setAuthState,
        logout,
        verifyToken,
        refreshToken,
        authenticatedFetch,
    };
};
