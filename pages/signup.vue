<script setup>
import { memberCenterLink } from "~/composables/globals"
import { trackClickEvent } from "~/utilities/helpers"
useHead({
  bodyAttrs: {
    class: "no-bottom-padding",
  },
})
definePageMeta({
  middleware: ["check-logged-in"],
  pageTransition: false, // Disable page transition
})

useHead({
  title:
    "Sign up | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "Sign up | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "Sign up | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
})
onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Sign up",
    page_type: "signup_page",
    content_group: "signup",
  })
})

const trackMemberCenter = () => {
  trackClickEvent(
    "Click Tracking - sign up page Member Center link",
    "Sign up page",
    "Member Center"
  )
}
</script>

<template>
  <div class="signup-page">
    <section class="grid m-auto pb-0 lg:pr-0 pt-0">
      <Signup isRoute class="col-12 lg:col-6">
        <template #header-bottom>
          <div class="mt-3">
            Manage donations
            <VFlexibleLink
              :to="memberCenterLink"
              aria-label="Member Center"
              @flexible-link-click="trackMemberCenter"
            >
              Member Center
            </VFlexibleLink>
          </div>
        </template>
      </Signup>
      <LoginSignupSideContent class="hidden col-6 lg:flex" />
    </section>
  </div>
</template>
