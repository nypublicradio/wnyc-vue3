<script setup>
import { useCurrentUser, useCurrentUserProfile } from '~/composables/states'

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()

definePageMeta({
  layout: 'default',
  middleware: 'check-auth',
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
    <!-- <StreamSwitcher /> -->
    <!-- <div class="grid gap-3">
        <div class="col">
          <MainPlayer />
        </div>
        <div class="col-fixed ad300 hidden lg:block">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
        <div class="col-12 ad300 lg:hidden">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
      </div> -->

    <!-- <section>
      <OnTodaysShow />
    </section>
    <section>
      <h2 class="font-bold font-meta mb-2">Top stories from Gothamist</h2>
      <TopStories class="pt-6" />
    </section> -->
    <section>
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page <br />Home
      Page <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />Home Page <br />Home Page <br />Home Page <br />Home Page
      <br />
    </section>
  </div>
</template>
