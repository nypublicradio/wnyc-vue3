import { useIsNetworkConnected, useGlobalToast, } from "~/composables/states"
export default defineNuxtPlugin(nuxtApp => {
    const config = useRuntimeConfig()
    if (config.public.NUXT_SSR === "false") {
        const router = nuxtApp.$router
        const isNetworkConnected = useIsNetworkConnected()
        const globalToast = useGlobalToast()
        router.beforeEach((to, from) => {
            // Perform pre-navigation checks
            // allow navigation when online, or leaving the index page
            if (isNetworkConnected.value || from.path === '/') {
                return true // Continue with navigation
            } else if (to.path === '/saved') {
                return true // continue with navigation to saved page only
            } else {
                globalToast.value = {
                    severity: "error",
                    summary: "No internet connection detected. Please try again later.",
                    life: 6000,
                    closable: true,
                }
                return false // Abort navigation
            }
        })

        router.onError(error => {
            console.error('Router error:', error)
        })
    }
})