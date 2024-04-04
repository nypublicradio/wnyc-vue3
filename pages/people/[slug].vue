<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import VPerson from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue"
import { trackClickEvent, goToStoryPage } from "~/utilities/helpers"
//import { useIntersectionObserver } from "@vueuse/core"
//import { useGlobalToast } from "~/composables/states"
//import { trackClickEvent } from '~/utilities/helpers'
//import { StaffPage } from '../../composables/types/Page'
//import { ArticlePage } from '~/composables/types/Page'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const personSlug = route.params.slug
//const newPageData = ref(null)
const { data: pagedata, pending, error, refresh } = await useFetch(
  `${config.public.BFF_URL}/api/people/publisher/${personSlug}`
)
//newPageData.value = pagedata.value

//const pendingMore = ref(false)
//const loadMoreRefVisible = ref(false)
//const loadMoreRef = ref(null)
//const isInitialObserver = ref(true)
// const { stop } = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
//   // so it does not trigger on initial load and before we have data
//   if (!isInitialObserver.value && newPageData.value) {
//     loadMoreRefVisible.value = isIntersecting
//   } else {
//     isInitialObserver.value = false
//   }
// })

// clean up the useIntersectionObserver
// onUnmounted(() => {
//   stop()
// })

//let offset = 0

// load more articles by the author, triggered by the lazy load observer
// const loadMore = async () => {
//   pendingMore.value = true
//   try {
//     const additionalPageData = await $fetch(
//       `${
//         config.public.BFF_URL
//       }/api/people/publisher/${personSlug}?offset=${(offset += 10)}`
//     )
//     pendingMore.value = false
//     newPageData.value.articles = [
//       ...newPageData.value.articles,
//       ...additionalPageData.articles,
//     ]
//     trackClickEvent("Event Tracking - load more articles", "Shows Page", personSlug)
//   } catch (e) {
//     const globalToast = useGlobalToast()
//     globalToast.value = {
//       severity: "error",
//       summary:
//         "Sorry. We are having trouble loading more articles. Please try again later.",
//       life: null,
//       closable: true,
//     }
//     console.error("error = ", e)
//   }
// }
console.log("pagedata", pagedata.value)
const PersonName = pagedata?.name

const pageTitle = `Articles by ${PersonName} | Gothamist`

useHead({
  title: pageTitle,
})
useServerHead({
  meta: [{ property: "og:title", content: pageTitle }],
})

const routeBack = () => {
  trackClickEvent("People", "People page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
}

// watch(loadMoreRefVisible, (val) => {
//   if (val) {
//     loadMore()
//   }
// })

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: PersonName,
    page_type: "people_page",
    content_group: "app_tab",
  })
})
</script>

<template>
  <section class="person-page">
    <Html lang="en">
      <Head>
        <Title
          >{{ PersonName }} | WNYC | New York Public Radio, Podcasts, Live Streaming
          Radio, News</Title
        >
        <Meta
          name="og:title"
          content="{{ PersonName }} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="{{ PersonName }} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
    <div>
      <Button
        class="back-btn text-color -ml-4"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="routeBack"
        label="Back"
      />
      <FetchError v-if="error || pagedata === undefined" @on-click="refresh" />
      <div v-if="!pending" class="content">
        <div class="grid">
          <div class="col-12">
            <hr class="my-4" />
            <!-- <pre>{{ pagedata.authorData }}</pre> -->
            <VPerson
              v-if="pagedata"
              :profileData="pagedata"
              class="html-formatting"
              onStaffPage
            >
              <template #slot-above-bio>
                <h3 class="mt-2 mb-2">Shows</h3>
                <div class="flex flex-column gap-2">
                  <NuxtLink
                    v-for="show in pagedata.shows"
                    raw
                    :to="`/browse/shows/${show.slug}`"
                    class="flex gap-1 align-items-center"
                  >
                    <VImage
                      :src="show.featured.headers.brand.logoImage.template"
                      :alt="`${show.title} show image`"
                      :width="20"
                      :height="20"
                      :sizes="[2]"
                      class="flex-none"
                      :ratio="[1, 1]"
                      style="height: 20px; width: 20px"
                    />
                    <p class="m-0">{{ show.title }}</p>
                  </NuxtLink>
                </div>
              </template>
            </VPerson>
            <div class="h5" v-else>{{ PersonName }}</div>
            <hr class="my-4" />
          </div>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
      </div>
    </div>
    <BackToTopButton />
  </section>
</template>

<style lang="scss">
.person-page {
  hr {
    background: var(--text-color);
  }
}
</style>
