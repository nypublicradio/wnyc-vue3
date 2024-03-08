//import { useMembershipStatus } from "~~/composables/states"

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  //const membershipStatus = useMembershipStatus()

  window.dataLayer = window.dataLayer || []
  // init gtag function
  function gtag(...args) { dataLayer.push(arguments) }
  gtag('js', new Date())
  gtag('set', 'send_page_view', false)
  gtag('config', config.public.GA_MEASUREMENT_ID)

  // event to use when sending gtag events
  const sendEvent = (name: string, params: Record<string, string>) => {
    gtag('event', name, params)
  }
  // gtag even for reporting on page views
  const sendPageView = (params: Record<string, string>) => {
    const currentUser = useCurrentUser()
    sendEvent('page_view', {
      page_location: document.location.href,
      page_title: document.title,
      user_id: currentUser.value?.id,
      //NYPRMember: membershipStatus.value,
      ...params
    })
  }
  return {
    provide: {
      analytics: {
        sendEvent,
        sendPageView
      }
    }
  }
})