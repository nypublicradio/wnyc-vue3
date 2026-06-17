import { computed, readonly } from 'vue'
import { Preferences } from "@capacitor/preferences"
import { useIsNativeApp } from "~/composables/states"

// ─────────────────────────────────────────────────────────────────────────────
// useAuth — Central authentication composable
//
// This is the SINGLE source of truth for all auth operations:
//   1. OAuth callback handling (web + native, implicit + PKCE flows)
//   2. JWT token management (BFF session-to-jwt, refresh, verify)
//   3. Authenticated API calls with auto-refresh
//   4. Platform-aware redirect URL generation
//
// Auth flow overview:
//   Login initiated (VLoginWithProvider/Email) →
//   Redirect to provider →
//   Callback received (confirm.vue on web, deep link on native) →
//   handleOAuthCallback() →
//   Supabase session established + JWT generated →
//   getAndSetUserProfile() →
//   Navigate to /home
// ─────────────────────────────────────────────────────────────────────────────

interface User {
    id: string
    email: string
    user_metadata?: any
}

interface AuthResponse {
    success: boolean
    token: string
    user: User
}

export const useAuth = () => {
    // Use useState instead of module-level refs for SSR-safe global state
    const authToken = useState<string | null>('authToken', () => null)
    const currentUser = useState<User | null>('authCurrentUser', () => null)
    const refreshTokenValue = useState<string | null>('refreshTokenValue', () => null)
    const isAuthenticated = computed(() => Boolean(authToken.value) && Boolean(currentUser.value))

    // Token refresh interval ID
    let tokenRefreshIntervalId: ReturnType<typeof setInterval> | null = null

    // Initialize from Preferences on client side
    const initializeAuth = async () => {
        if (import.meta.client) {
            const stored = await Preferences.get({ key: 'auth_token' })
            if (stored.value) {
                authToken.value = stored.value
            }

            const storedUser = await Preferences.get({ key: 'auth_user' })
            if (storedUser.value) {
                try {
                    currentUser.value = JSON.parse(storedUser.value)
                } catch (error) {
                    console.error('Failed to parse stored user data:', error)
                    await Preferences.remove({ key: 'auth_user' })
                }
            }

            const storedRefreshToken = await Preferences.get({ key: 'refresh_token' })
            if (storedRefreshToken.value) {
                refreshTokenValue.value = storedRefreshToken.value
            }
        }
    }

    // Initialize auth state
    if (import.meta.client) {
        initializeAuth().catch((error) => {
            console.error('Failed to initialize auth:', error)
        })
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Platform helpers
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Returns the correct OAuth redirect URL for the current platform.
     * - Native: uses the custom URL scheme (wnycalpha:// for demo, wnyc:// for prod)
     * - Web: uses the configured supabaseAuthSignInRedirectTo value
     */
    const getOAuthRedirectUrl = (): string => {
        const config = useRuntimeConfig()
        const isNativeApp = useIsNativeApp()

        if (isNativeApp.value) {
            return `${config.public.NATIVE_URL_SCHEME}://confirm`
        }

        return config.public.supabaseAuthSignInRedirectTo || `${window.location.origin}/confirm`
    }

    /**
     * Initialize authentication from Supabase session
     * Generates JWT from Supabase session and sets auth state
     */
    const initializeFromSupabaseSession = async (): Promise<boolean> => {
        const supabase = useSupabaseClient()
        const config = useRuntimeConfig()
        const { data: sessionData } = await supabase.auth.getSession()

        if (!sessionData?.session) return false

        try {
            const jwtResponse = await $fetch(`${config.public.BFF_URL}/api/auth/session-to-jwt`, {
                method: "POST",
                body: {
                    access_token: sessionData.session.access_token,
                    refresh_token: sessionData.session.refresh_token,
                },
            })

            if (jwtResponse.success && jwtResponse.token) {
                await setAuthState(
                    jwtResponse.token,
                    jwtResponse.user,
                    sessionData.session.refresh_token
                )
                return true
            }
        } catch (error) {
            console.error("Failed to generate JWT:", error)
        }

        return false
    }

    // ─────────────────────────────────────────────────────────────────────────
    // OAuth callback handling (THE single entry point for all OAuth returns)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Handle an OAuth callback URL. Works for both web and native platforms,
     * and supports both implicit flow (#access_token=...) and PKCE (?code=...).
     *
     * This method:
     *   1. Parses the callback URL for tokens or auth code
     *   2. Establishes a Supabase session
     *   3. Converts the Supabase session to a custom JWT via BFF
     *   4. Persists the JWT in auth state
     *
     * @returns true if auth was successful, false otherwise
     */
    const handleOAuthCallback = async (url: string): Promise<boolean> => {
        const supabase = useSupabaseClient()
        const urlObj = new URL(url)

        // Try implicit flow first: tokens in the hash fragment (#access_token=...&refresh_token=...)
        const hashParams = new URLSearchParams(urlObj.hash.substring(1))
        const accessToken = hashParams.get("access_token")
        const hashRefreshToken = hashParams.get("refresh_token")

        if (accessToken && hashRefreshToken) {
            try {
                await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: hashRefreshToken,
                })
            } catch (error) {
                console.error("Failed to set session from implicit flow tokens:", error)
                return false
            }
        } else {
            // Try PKCE flow: code as a query param (?code=...)
            const code = urlObj.searchParams.get("code")
            if (code) {
                try {
                    const cleanCode = code.replace("#", "")
                    await supabase.auth.exchangeCodeForSession(cleanCode)
                } catch (error) {
                    console.error("Failed to exchange code for session:", error)
                    return false
                }
            }
        }

        // Session is now established in Supabase — convert to our JWT
        return await initializeFromSupabaseSession()
    }

    // ─────────────────────────────────────────────────────────────────────────
    // JWT state management
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Set authentication state and fetch membership info
     */
    const setAuthState = async (token: string, user: User, refreshToken?: string) => {
        authToken.value = token
        currentUser.value = user

        if (refreshToken) {
            refreshTokenValue.value = refreshToken
        }

        if (import.meta.client) {
            await Preferences.set({ key: 'auth_token', value: token })
            await Preferences.set({ key: 'auth_user', value: JSON.stringify(user) })
            if (refreshToken) {
                await Preferences.set({ key: 'refresh_token', value: refreshToken })
            }
        }
    }

    /**
     * Logout and clear authentication state
     */
    const logout = async () => {
        authToken.value = null
        currentUser.value = null
        refreshTokenValue.value = null

        if (import.meta.client) {
            await Preferences.remove({ key: 'auth_token' })
            await Preferences.remove({ key: 'auth_user' })
            await Preferences.remove({ key: 'refresh_token' })
        }
    }

    /**
     * Verify current token
     */
    const verifyToken = async (): Promise<boolean> => {
        if (!authToken.value) return false

        try {
            const config = useRuntimeConfig()
            await $fetch(`${config.public.BFF_URL}/api/auth/verify`, {
                headers: {
                    Authorization: `Bearer ${authToken.value}`,
                },
            })
            return true
        } catch (error) {
            console.error('Token verification failed:', error)
            await logout()
            return false
        }
    }

    /**
     * Refresh token using Supabase refresh token
     */
    const refreshToken = async (refreshToken: string): Promise<boolean> => {
        try {
            const config = useRuntimeConfig()
            const data = await $fetch(`${config.public.BFF_URL}/api/auth/refresh`, {
                method: 'POST',
                body: { refreshToken },
            }) as AuthResponse

            if (data.success && data.token) {
                authToken.value = data.token
                currentUser.value = data.user

                if (import.meta.client) {
                    await Preferences.set({ key: 'auth_token', value: data.token })
                    await Preferences.set({ key: 'auth_user', value: JSON.stringify(data.user) })
                }

                return true
            }

            return false
        } catch (error: any) {
            if (error?.statusCode === 401) {
                console.warn('Token refresh failed - session expired. Please log in again.')
            } else {
                console.error('Token refresh failed:', error)
            }
            return false
        }
    }

    /**
     * Make authenticated API calls with automatic token refresh
     */
    const authenticatedFetch = async (url: string, options: any = {}): Promise<any> => {
        if (!authToken.value) {
            throw new Error('No authentication token available')
        }

        const headers = {
            ...options.headers,
            Authorization: `Bearer ${authToken.value}`,
        }

        try {
            return await $fetch(url, {
                ...options,
                headers,
            })
        } catch (error: any) {
            if (error.statusCode === 401 && refreshTokenValue.value) {
                const refreshSuccess = await refreshToken(refreshTokenValue.value)

                if (refreshSuccess && authToken.value) {
                    return await $fetch(url, {
                        ...options,
                        headers: {
                            ...options.headers,
                            Authorization: `Bearer ${authToken.value}`,
                        },
                    })
                } else {
                    await logout()
                    throw new Error('Authentication required')
                }
            } else if (error.statusCode === 401) {
                // No refresh token available, logout immediately
                await logout()
                throw new Error('Authentication required')
            }
            throw error
        }
    }

    /**
     * Check if token is about to expire and refresh it proactively
     */
    const checkTokenExpiry = async (): Promise<void> => {
        if (!authToken.value || !refreshTokenValue.value) return

        try {
            // Decode the JWT to check expiration (without verification)
            let payload
            try {
                const base64Url = authToken.value.split('.')[1]
                if (!base64Url) throw new Error('Invalid JWT format')
                payload = JSON.parse(atob(base64Url))
            } catch (decodeError) {
                console.error('Failed to decode JWT payload:', decodeError)
                await logout()
                return
            }
            const currentTime = Math.floor(Date.now() / 1000)
            const timeUntilExpiry = payload.exp - currentTime

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry < 300 && refreshTokenValue.value) { // 5 minutes
                const refreshSuccessful = await refreshToken(refreshTokenValue.value)
                // If refresh fails, stop the interval to prevent repeated errors
                if (!refreshSuccessful && tokenRefreshIntervalId) {
                    clearInterval(tokenRefreshIntervalId)
                    tokenRefreshIntervalId = null
                    console.warn('Token refresh failed - stopping auto-refresh. Please log in again.')
                }
            }
        } catch (error) {
            // Stop the interval on error
            if (tokenRefreshIntervalId) {
                clearInterval(tokenRefreshIntervalId)
                tokenRefreshIntervalId = null
            }
            await logout()
        }
    }

    /**
     * Start automatic token refresh checking
     * Checks token expiry every 2 minutes and refreshes token proactively.
     */
    const startTokenRefreshTimer = () => {
        if (import.meta.client) {
            // Clear any existing interval to avoid duplicates
            if (tokenRefreshIntervalId !== null) {
                clearInterval(tokenRefreshIntervalId)
            }
            // Check token expiry every 2 minutes
            tokenRefreshIntervalId = setInterval(() => {
                checkTokenExpiry().catch(() => {
                    // Silently handle errors as they're already logged in checkTokenExpiry
                })
            }, 2 * 60 * 1000)
        }
    }
    /**
     * Manually trigger token refresh
     */
    const triggerTokenRefresh = async (): Promise<boolean> => {
        if (!refreshTokenValue.value) {
            return false
        }

        try {
            return await refreshToken(refreshTokenValue.value)
        } catch (error) {
            return false
        }
    }

    // Start the token refresh timer on client side
    if (import.meta.client) {
        startTokenRefreshTimer()
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
        initializeFromSupabaseSession,
        handleOAuthCallback,
        getOAuthRedirectUrl,
    }
}