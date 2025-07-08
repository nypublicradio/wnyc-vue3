<script setup>
import { trackClickEvent, goToStoryPage, getUserFallBackImage } from "~/utilities/helpers"
import { useIntersectionObserver } from "@vueuse/core"
import { useGlobalToast } from "~/composables/states"

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const authorName = ref(null)
const pageTitle = ref(null)
const staffSlug = route.params.slug
const newPageData = ref(null)
const { data: pagedata, pending, error } = useFetch(
  `${config.public.BFF_URL}/api/staff/wagtail/${staffSlug}`
)

watch(pagedata, (val) => {
  if (val) {
    authorName.value = `${pagedata.value?.authorData[0]?.firstName} ${pagedata.value?.authorData[0]?.lastName}`
    pageTitle.value = `Articles by ${authorName.value} | Gothamist`
    // set fallback image based on dark or light mode
    if (pagedata.value && !pagedata.value.authorData.photoID) {
      pagedata.value.authorData.photoID = getUserFallBackImage()
    }
    newPageData.value = pagedata.value
  }
})
watch(
  pagedata,
  () => {
    // send GA page view
    const { $analytics } = useNuxtApp()
    $analytics.sendPageView({
      page_title: authorName.value,
      page_type: "author_page",
      content_group: "app_tab",
    })
  },
  { once: true }
)

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

useHead({
  title: pageTitle.value,
})
useServerHead({
  meta: [{ property: "og:title", content: pageTitle.value }],
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
          :content="`${authorName} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
        <Meta
          name="twitter:title"
          :content="`${authorName} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
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
        <div id="articleList">
          <div v-if="pagedata?.articles.length > 0" class="staff-articles grid">
            <div
              v-for="(article, index) in newPageData?.articles"
              :key="article?.uuid"
              class="col-12 md:col-6 xl:col-4 mb-3"
            >
              <MediaCard
                :data="article"
                :index="index"
                showPlayButton
                is-horizontal
                imgCol="w-7rem"
                :size="[1, 1]"
                :showBg="false"
                :showBgMobile="false"
                @on-click="goToStoryPage(article, { src: article.cmsSource })"
              />
            </div>
          </div>
          <p v-else class="col">No articles available</p>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
      </div>
      <div v-else>
        <skeleton-staff-page class="mt-5" />
        <hr class="my-4" />
        <div class="grid">
          <!-- <skeleton-episode-item v-for="i in 10" :key="`sk1-${i}`" class="mb-5" /> -->
          <skeleton-media-card
            v-for="i in 9"
            :key="`sk1-${i}`"
            showPlayButton
            is-horizontal
            imgCol="w-7rem"
            :size="[1, 1]"
            :showBg="false"
            :showBgMobile="false"
            class="mb-5 col-12 md:col-6 xl:col-4"
          />
        </div>
      </div>
      <div v-if="pendingMore" class="grid">
        <!-- <skeleton-episode-item v-for="i in 10" :key="`sk1-${i}`" class="mb-5" /> -->
        <skeleton-media-card
          v-for="i in 9"
          :key="`sk2-${i}`"
          showPlayButton
          is-horizontal
          imgCol="w-7rem"
          :size="[1, 1]"
          :showBg="false"
          :showBgMobile="false"
          class="mb-5 col-12 md:col-6 xl:col-4"
        />
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
    background: var(--p-text-color);
  }
}
</style>
