<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import { useFallbackImages } from "~/composables/useFallbackImages"

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const { getEpisodeFallBackImage, getUserFallBackImage } = useFallbackImages()
const pageFetchResult = useFetchWrapper(
  () => `${config.public.BFF_URL}/api/people/publisher/${route.params.slug}`,
  {
    key: `publisher-people-page-${route.params.slug}`,
  }
)

if (import.meta.server) {
  await pageFetchResult
}

const {
  data: pagedata,
  status,
  error,
} = pageFetchResult

const personName = computed(() => pagedata.value?.name || '')

watch(pagedata, (val) => {
  if (val) {
    // set fallback image based on dark or light mode
    if (pagedata.value && !pagedata.value.photoID) {
      pagedata.value.photoID = getUserFallBackImage()
    }
  }
})

watch(
  pagedata,
  () => {
    // send GA page view
    const { $analytics } = useNuxtApp()
    $analytics.sendPageView({
      page_title: personName.value,
      page_type: "people_page",
      content_group: "app_tab",
    })
  },
  { once: true }
)

useHead(() => ({
  title: `${personName.value} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`,
  meta: [
    {
      name: "og:title",
      content: `${personName.value} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`,
    },
    {
      name: "twitter:title",
      content: `${personName.value} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`,
    },
  ],
}))

// handle route back
const routeBack = () => {
  trackClickEvent("People", "People page", "route back")
  router.go(-1)
}
</script>

<template>
  <section class="person-page">
    <div>
      <Button
        class="back-btn text-color -ml-3"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="routeBack"
        label="Back"
      />

      <FetchError
        v-if="error"
        msg="An error occured while loading this persons profile."
      />
      <div v-if="status === 'success' && pagedata !== null" class="content">
        <div class="grid mt-4">
          <div class="col-12">
            <VPerson
              v-if="pagedata"
              :profileData="pagedata"
              class="html-formatting"
              :showBio="false"
              onStaffPage
            />
            <div class="h5" v-else>{{ personName }}</div>
            <h3 class="mt-3 mb-2" v-if="pagedata.shows.length">Shows</h3>
            <div class="flex flex-column gap-3">
              <NuxtLink
                v-for="show in pagedata.shows"
                :key="show.slug"
                raw
                :to="`/browse/shows/${show.slug}`"
                class="flex gap-1 align-items-center"
              >
                <VImage
                  :src="
                    show.featured?.headers.brand.logoImage ||
                    getEpisodeFallBackImage()
                  "
                  :alt="`${show.title} show image`"
                  :width="20"
                  :height="20"
                  class="flex-none"
                  :ratio="[1, 1]"
                />
                <p class="m-0">{{ show.title }}</p>
              </NuxtLink>
            </div>
            <HtmlConvert
              v-if="pagedata.biography"
              :htmlContent="pagedata.biography"
              class="mt-4"
              :key="`biography-${pagedata.id || route.params.slug}`"
            />
          </div>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
      </div>
      <div v-else>
        <skeleton-people-page />
        <div class="text-center">LOADING</div>
      </div>
    </div>
    <BackToTopButton />
  </section>
</template>

<style lang="scss">
.person-page {
  hr {
    background: var(--p-text-color);
  }
}
</style>
