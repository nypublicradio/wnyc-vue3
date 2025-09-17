import { ref, computed, readonly } from 'vue';
import { Preferences } from "@capacitor/preferences"
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
const isAuthenticated = computed(() => Boolean(authToken.value) && Boolean(currentUser.value));

export const useAuth = () => {
    // Initialize from Preferences on client side
    const initializeAuth = async () => {
        if (import.meta.client) {
            const stored = await Preferences.get({ key: 'auth_token' });
            if (stored.value) {
                authToken.value = stored.value;
            }

            const storedUser = await Preferences.get({ key: 'auth_user' });
            if (storedUser.value) {
                try {
                    currentUser.value = JSON.parse(storedUser.value);
                } catch (error) {
                    console.error('Failed to parse stored user data:', error);
                    await Preferences.remove({ key: 'auth_user' });
                }
            }

            const storedRefreshToken = await Preferences.get({ key: 'refresh_token' });
            if (storedRefreshToken.value) {
                refreshTokenValue.value = storedRefreshToken.value;
            }
        }
    };

    // Initialize auth state
    if (import.meta.client) {
        initializeAuth();
    }

    /**
     * Set authentication state (used by confirm page)
     */
    const setAuthState = async (token: string, user: User, refreshToken?: string) => {
        authToken.value = token;
        currentUser.value = user;

        if (refreshToken) {
            refreshTokenValue.value = refreshToken;
        }

        if (import.meta.client) {
            await Preferences.set({ key: 'auth_token', value: token });
            await Preferences.set({ key: 'auth_user', value: JSON.stringify(user) });
            if (refreshToken) {
                await Preferences.set({ key: 'refresh_token', value: refreshToken });
            }
        }
    };

    /**
     * Logout and clear authentication state
     */
    const logout = async () => {
        authToken.value = null;
        currentUser.value = null;
        refreshTokenValue.value = null;

        if (import.meta.client) {
            await Preferences.remove({ key: 'auth_token' });
            await Preferences.remove({ key: 'auth_user' });
            await Preferences.remove({ key: 'refresh_token' });
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

                if (import.meta.client) {
                    await Preferences.set({ key: 'auth_token', value: data.token });
                    await Preferences.set({ key: 'auth_user', value: JSON.stringify(data.user) });
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
                    await logout();
                    throw new Error('Authentication required');
                }
            } else if (error.statusCode === 401) {
                // No refresh token available, logout immediately
                await logout();
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
            let payload;
            try {
                const base64Url = authToken.value.split('.')[1];
                if (!base64Url) throw new Error('Invalid JWT format');
                payload = JSON.parse(atob(base64Url));
            } catch (decodeError) {
                console.error('Failed to decode JWT payload:', decodeError);
                await logout();
                return;
            }
            const currentTime = Math.floor(Date.now() / 1000);
            const timeUntilExpiry = payload.exp - currentTime;

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 300) { // 5 minutes
                await refreshToken(refreshTokenValue.value);
            }
        } catch (error) {
            await logout();
        }
    };

    /**
     * Start automatic token refresh checking
     */
    let tokenRefreshIntervalId: ReturnType<typeof setInterval> | null = null;

    /**
     * Start automatic token refresh checking
     * Checks token expiry every 2 minutes and refreshes token proactively.
     */
    const startTokenRefreshTimer = () => {
        if (import.meta.client) {
            // Clear any existing interval to avoid duplicates
            if (tokenRefreshIntervalId !== null) {
                clearInterval(tokenRefreshIntervalId);
            }
            // Check token expiry every 2 minutes
            tokenRefreshIntervalId = setInterval(() => {
                checkTokenExpiry().catch(() => {
                    // Silently handle errors as they're already logged in checkTokenExpiry
                });
            }, 2 * 60 * 1000);
        }
    };
    /**
     * Manually trigger token refresh
     */
    const triggerTokenRefresh = async (): Promise<boolean> => {
        if (!refreshTokenValue.value) {
            return false;
        }

        try {
            return await refreshToken(refreshTokenValue.value);
        } catch (error) {
            return false;
        }
    };

    // Start the token refresh timer on client side
    if (import.meta.client) {
        startTokenRefreshTimer();
    }

    return {
        // State
        authToken: readonly(authToken),
        currentUser: readonly(currentUser),
        refreshTokenValue: readonly(refreshTokenValue),
        isAuthenticated,

        // Methods
        initializeAuth,
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
