<script setup>
import {
  trackClickEvent,
  getUserFallBackImage,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const personName = ref(null)
const pageTitle = ref(null)
const personSlug = route.params.slug
//const newPageData = ref(null)
const { data: pagedata, pending, error } = useFetch(
  `${config.public.BFF_URL}/api/people/publisher/${personSlug}`
)

watch(pagedata, (val) => {
  if (val) {
    personName.value = pagedata?.value.name
    pageTitle.value = `Articles by ${personName.value} | Gothamist`
    // set fallback image based on dark or light mode
    if (pagedata.value && !pagedata.value.photoID) {
      pagedata.value.photoID = getUserFallBackImage()
    }
    //newPageData.value = pagedata.value
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

useHead({
  title: pageTitle.value,
})
useServerHead({
  meta: [{ property: "og:title", content: pageTitle.value }],
})

// handle route back
const routeBack = () => {
  trackClickEvent("People", "People page", "route back")
  router.go(-1)
}
</script>

<template>
  <section class="person-page">
    <Html lang="en">
      <Head>
        <Title
          >{{ personName }} | WNYC | New York Public Radio, Podcasts, Live Streaming
          Radio, News</Title
        >
        <Meta
          name="og:title"
          :content="`${personName} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
        <Meta
          name="twitter:title"
          :content="`${personName}}] | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
      </Head>
    </Html>
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
      <div v-if="!pending && pagedata !== null" class="content">
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
                    show.featured?.headers.brand.logoImage || getEpisodeFallBackImage()
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
