import { getAndSetUserProfile } from '~/utilities/helpers'
export default defineNuxtRouteMiddleware(() => {
    getAndSetUserProfile()
})