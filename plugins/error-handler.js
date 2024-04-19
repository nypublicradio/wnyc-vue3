export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:error', (error) => {

        window.location.replace('/home')
    })
})