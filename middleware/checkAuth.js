import { getAndSetUserProfile } from '~/utilities/helpers'
export default defineNuxtRouteMiddleware(async () => {
    getAndSetUserProfile()
})