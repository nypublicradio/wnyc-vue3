<script setup>
// const currentUser = useCurrentUser()
// const currentUserProfile = useCurrentUserProfile()

// console.log('home currentUser = ', currentUser.value)
// console.log('home currentUserProfile = ', currentUserProfile.value)
const config = useRuntimeConfig();
const { data: pagedata } = await useFetch(`${ config.public['BFF_URL'] }/api/homepage`);
const topStories = pagedata.value.top_stories;
const bucketItems = pagedata.value.middle_bucket;

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
      <h2 class="mt-4 mb-2">Latest News Updates</h2>
      <LatestNewsUpdates class="pt-2" />
    </section>
    <section>
      <h2 class="mb-2">Top stories from Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>
    <section>
      <h2>Featured from WNYC</h2>
    </section>
    <WNYCFeatured :bucketItems="bucketItems" />
  </div>
</template>
