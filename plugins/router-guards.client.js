import { useIsNetworkConnected, useGlobalToast, } from "~/composables/states"
export default defineNuxtPlugin(nuxtApp => {
    const router = nuxtApp.$router
    const isNetworkConnected = useIsNetworkConnected()
    const globalToast = useGlobalToast()
    router.beforeEach((to, from, next) => {
        // Perform pre-navigation checks
        // check network connection and go next() if on the index page
        if (isNetworkConnected.value || from.path === '/') {
            next() // Continue with navigation
        } else if (to.path === '/saved') {
            next() // continue with navigation to saved page only
        } else {
            globalToast.value = {
                severity: "error",
                summary: "No internet connection detected. Please try again later.",
                life: 6000,
                closable: true,
            }
            //globalToast.value = null
            next(new Error('Navigation aborted')) // Abort navigation with an error
        }
    })

    router.onError(error => {
        console.error('Router error:', error)
    })
})