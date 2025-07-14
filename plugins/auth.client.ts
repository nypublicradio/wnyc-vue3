export default defineNuxtPlugin(async () => {
    // Only run on client-side
    if (process.server) return;

    const { useAuth } = await import('~/composables/useAuth');
    const { verifyToken, isAuthenticated } = useAuth();

    // Verify token on app initialization
    if (isAuthenticated.value) {
        try {
            await verifyToken();
        } catch (error) {
            console.warn('Token verification failed during app initialization:', error);
        }
    }
});
