export default defineNuxtRouteMiddleware(async (to, from) => {
    console.log('to', to)
    console.log('from', from)
    if (from.fullPath === to.fullPath) {
        console.log('The page was accessed directly')
    } else {
        console.log('The page was routed from another page')
    }
})
