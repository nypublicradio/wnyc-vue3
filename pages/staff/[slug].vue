<script setup>
import VPerson from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue"
import { trackClickEvent, goToStoryPage, getUserFallBackImage } from "~/utilities/helpers"
import { useIntersectionObserver } from "@vueuse/core"
import { useGlobalToast } from "~/composables/states"

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const staffSlug = route.params.slug
const newPageData = ref(null)
const { data: pagedata, pending, error, refresh } = await useFetch(
  `${config.public.BFF_URL}/api/staff/wagtail/${staffSlug}`
)

// set fallback image based on dark or light mode
if (!pagedata.value.authorData.photoID) {
  pagedata.value.authorData.photoID = getUserFallBackImage()
}
newPageData.value = pagedata.value

const pendingMore = ref(false)
const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)
const { stop } = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  // so it does not trigger on initial load and before we have data
  if (!isInitialObserver.value && newPageData.value) {
    loadMoreRefVisible.value = isIntersecting
  } else {
    isInitialObserver.value = false
  }
})

// clean up the useIntersectionObserver
onUnmounted(() => {
  stop()
})

let offset = 0

// load more articles by the author, triggered by the lazy load observer
const loadMore = async () => {
  pendingMore.value = true
  try {
    const additionalPageData = await $fetch(
      `${config.public.BFF_URL}/api/staff/wagtail/${staffSlug}?offset=${(offset += 10)}`
    )
    pendingMore.value = false
    newPageData.value.articles = [
      ...newPageData.value.articles,
      ...additionalPageData.articles,
    ]
    trackClickEvent("Event Tracking - load more articles", "Shows Page", staffSlug)
  } catch (e) {
    const globalToast = useGlobalToast()
    globalToast.value = {
      severity: "error",
      summary:
        "Sorry. We are having trouble loading more articles. Please try again later.",
      life: null,
      closable: true,
    }
    console.error("error = ", e)
  }
}
const authorName = `${pagedata.value?.authorData[0]?.firstName} ${pagedata.value?.authorData[0]?.lastName}`

const pageTitle = `Articles by ${authorName} | Gothamist`

useHead({
  title: pageTitle,
})
useServerHead({
  meta: [{ property: "og:title", content: pageTitle }],
})

const routeBack = () => {
  trackClickEvent("Staff", "Staff page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
}

watch(loadMoreRefVisible, (val) => {
  if (val) {
    loadMore()
  }
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: authorName,
    page_type: "author_page",
    content_group: "app_tab",
  })
})
</script>

<template>
  <section class="staff-page">
    <Html lang="en">
      <Head>
        <Title
          >{{ authorName }} | WNYC | New York Public Radio, Podcasts, Live Streaming
          Radio, News</Title
        >
        <Meta
          name="og:title"
          content="{{ authorName }} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="{{ authorName }} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
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
        <div class="grid mt-4">
          <div class="col-12">
            <!-- <pre>{{ pagedata.authorData }}</pre> -->
            <VPerson
              v-if="pagedata?.authorData"
              :profileData="pagedata.authorData[0]"
              class="html-formatting"
              onStaffPage
            />
            <div class="h5" v-else>{{ authorName }}</div>
            <hr class="my-4" />
          </div>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
        <div id="articleList" class="grid">
          <div v-if="pagedata?.articles.length > 0" class="col staff-articles">
            <div
              v-for="(article, index) in newPageData?.articles"
              :key="article?.uuid"
              class="mb-5"
            >
              <StoryItem
                :data="article"
                :index="index"
                @on-click="goToStoryPage(article, { src: article.cmsSource })"
              />
            </div>
          </div>
          <p v-else class="col">No articles available</p>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
      </div>
      <div v-else class="text-center">LOADING</div>
      <div v-if="pendingMore">
        <skeleton-episode-item v-for="i in 10" :key="`sk1-${i}`" class="mb-5" />
      </div>
      <WnycLoader
        ref="loadMoreRef"
        v-if="pagedata?.articles.length < pagedata?.count"
        spinner
        size="40px"
        class="mt-8"
      />
    </div>
    <BackToTopButton />
  </section>
</template>

<style lang="scss">
.staff-page {
  hr {
    background: var(--text-color);
  }
}
</style>
