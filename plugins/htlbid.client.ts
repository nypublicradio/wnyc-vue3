export default defineNuxtPlugin(() => {
    const { HTL_JS } = useRuntimeConfig().public
    if (!HTL_JS) return

    // Defer the ad stack (htlbid -> GPT/pubads) until after hydration when the main
    // thread is idle, keeping it off the critical path. onNuxtReady wraps requestIdleCallback.
    onNuxtReady(() => {
        const script = document.createElement("script")
        script.src = HTL_JS
        script.async = true
        document.head.appendChild(script)
    })
})
