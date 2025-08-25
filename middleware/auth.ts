import { useAuth } from '~/composables/useAuth';

export default defineNuxtRouteMiddleware((): ReturnType<typeof navigateTo> | undefined => {
    const { isAuthenticated } = useAuth();

    // If not authenticated, redirect to login
    if (!isAuthenticated.value) {
        return navigateTo('/login');
    }

    return undefined;
});
