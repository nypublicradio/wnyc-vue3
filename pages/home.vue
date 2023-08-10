<script setup>
//import { useCurrentUser, useCurrentUserProfile } from '~/composables/states'

// const currentUser = useCurrentUser()
// const currentUserProfile = useCurrentUserProfile()

definePageMeta({
  layout: 'default',
  layoutTransition: {
    name: 'login',
  },
  middleware: 'check-auth',
})
useHead({
  bodyAttrs: {
    class: 'show-header',
  },
})
</script>

<template>
  <div>
    <!-- <ClientOnly>
        <div class="mt-4 container">
          <h3 class="mb-4">Current User:</h3>
          <p class="mb-4">{{ currentUser }}</p>
          <h3 class="mb-4">User Profile Data:</h3>
          <p class="mb-4">{{ currentUserProfile }}</p>
        </div>
      </ClientOnly> -->

    <LiveFeature />
    <!-- <div class="grid gap-3">
        <div class="col-fixed ad300 hidden lg:block">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
        <div class="col-12 ad300 lg:hidden">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
      </div> -->

    <section>
      <h2 class="font-bold font-meta mt-4">Top stories from Gothamist</h2>
      <TopStories class="pt-2" />
    </section>
  </div>
</template>
