import { ref, computed, readonly } from 'vue';

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
const refreshTokenValue = ref<string | null>(null);
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

        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (storedRefreshToken) {
            refreshTokenValue.value = storedRefreshToken;
        }
    }

    /**
     * Set authentication state (used by confirm page)
     */
    const setAuthState = (token: string, user: User, refreshToken?: string) => {
        authToken.value = token;
        currentUser.value = user;

        if (refreshToken) {
            refreshTokenValue.value = refreshToken;
        }

        if (process.client) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('auth_user', JSON.stringify(user));
            if (refreshToken) {
                localStorage.setItem('refresh_token', refreshToken);
            }
        }
    };

    /**
     * Logout and clear authentication state
     */
    const logout = () => {
        authToken.value = null;
        currentUser.value = null;
        refreshTokenValue.value = null;

        if (process.client) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('refresh_token');
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
            return false;
        }
    };

    /**
     * Make authenticated API calls with automatic token refresh
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
            // If token is expired or invalid, try to refresh automatically
            if (error.statusCode === 401 && refreshTokenValue.value) {
                console.log('Token expired, attempting automatic refresh...');

                const refreshSuccess = await refreshToken(refreshTokenValue.value);

                if (refreshSuccess && authToken.value) {
                    // Retry the original request with the new token
                    console.log('Token refreshed successfully, retrying request...');
                    return await $fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${authToken.value}`,
                        },
                    });
                } else {
                    // Refresh failed, logout user
                    console.log('Token refresh failed, logging out user');
                    logout();
                    throw new Error('Authentication required');
                }
            } else if (error.statusCode === 401) {
                // No refresh token available, logout immediately
                logout();
                throw new Error('Authentication required');
            }
            throw error;
        }
    };

    /**
     * Check if token is about to expire and refresh it proactively
     */
    const checkTokenExpiry = async (): Promise<void> => {
        if (!authToken.value || !refreshTokenValue.value) return;

        try {
            // Decode the JWT to check expiration (without verification)
            const payload = JSON.parse(atob(authToken.value.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - currentTime;

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 300) {
                console.log('Token expires soon, refreshing proactively...');
                await refreshToken(refreshTokenValue.value);
            }
        } catch (error) {
            console.error('Error checking token expiry:', error);
        }
    };

    /**
     * Start automatic token refresh checking
     */
    const startTokenRefreshTimer = () => {
        if (process.client) {
            // Check token expiry every 2 minutes
            setInterval(checkTokenExpiry, 2 * 60 * 1000);
        }
    };

    /**
     * Manually trigger token refresh
     */
    const triggerTokenRefresh = async (): Promise<boolean> => {
        if (!refreshTokenValue.value) {
            console.warn('No refresh token available');
            return false;
        }

        try {
            return await refreshToken(refreshTokenValue.value);
        } catch (error) {
            console.error('Manual token refresh failed:', error);
            return false;
        }
    };

    // Start the token refresh timer on client side
    if (process.client) {
        startTokenRefreshTimer();
    }

    return {
        // State
        authToken: readonly(authToken),
        currentUser: readonly(currentUser),
        refreshTokenValue: readonly(refreshTokenValue),
        isAuthenticated,

        // Methods
        setAuthState,
        logout,
        verifyToken,
        refreshToken,
        authenticatedFetch,
        checkTokenExpiry,
        startTokenRefreshTimer,
        triggerTokenRefresh,
    };
};
