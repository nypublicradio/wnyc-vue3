export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook('vue:error', (..._args) => {
        console.log('vue:error = ', _args)
        // if (process.client) {
        //   console.log(..._args)
        // }
    })
    nuxtApp.hook('app:error', (..._args) => {
        console.log('app:error = ', _args)
        // if (process.client) {
        //   console.log(..._args)
        // }
    })
    nuxtApp.vueApp.config.errorHandler = (..._args) => {
        console.log('global error handler = ', _args)
        // if (process.client) {
        //   console.log(..._args)
        // }
    }
})
