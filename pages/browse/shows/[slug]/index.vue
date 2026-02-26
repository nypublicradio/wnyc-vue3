<script setup>
import { useIntersectionObserver } from "@vueuse/core"
import {
  checkIsFavorited,
  trackClickEvent,
  dynamicNavigation,
  slugify,
} from "~/utilities/helpers"
import { useGlobalToast, useIsApp } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()
const sectionAnchorData = ref([
  //  { label: "Most Recent", id: "most-recent" },
])

const {
  data: show,
  status,
  error,
} = useFetch(
  `${config.public.BFF_URL}/api/pages/wagtail/${route.params.slug}`,
  {
    onResponse(res) {
      sectionAnchorData.value = res.response._data.inPageNavigation.map(
        (item) => {
          return {
            label: item.value.linkText,
            id: slugify(item.value.targetId),
          }
        }
      )
    },
  }
)

const page = ref(null)
const episodes = ref([])
let maxPages = null

const showSlug = computed(() => show.value?.meta?.slug)

const isApp = useIsApp()

const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)

const { stop } = useIntersectionObserver(
  loadMoreRef,
  ([{ isIntersecting }]) => {
    // so it does not trigger on initial load and before we have data
    if (!isInitialObserver.value && episodes.value) {
      loadMoreRefVisible.value = isIntersecting
    } else {
      isInitialObserver.value = false
    }
  }
)

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// navigate to the episodes page
const handleViewAll = () => {
  if (showSlug.value) {
    navigateTo(`${showSlug.value}/episodes`)
  }
}

// scrolls to the selected section from the jump link buttons
const scrollToSection = (sectionId, behavior = "smooth", offset = 90) => {
  const element = document.getElementById(sectionId)

  if (element) {
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior,
    })
  }
}

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  { label: show.value?.title },
])

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Browse Shows",
    page_type: "browse_shows_page",
    content_group: "app_tab",
  })
})

// clean up the useIntersectionObserver
onUnmounted(() => {
  stop()
})
</script>

<template>
  <div class="shows-page pb-7" :class="{ 'is-app': isApp }">
    <Html lang="en">
      <Head>
        <Title
          >{{ show?.show?.title }} | WNYC | New York Public Radio, Podcasts,
          Live Streaming Radio, News</Title
        >
        <Meta
          name="og:title"
          :content="`${show?.show?.title} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
        <Meta
          name="twitter:title"
          :content="`${show?.show?.title} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
      <FetchError v-if="error" />
    </section>
    <!-- <pre>{{ show }}</pre> -->
    <ShowHeader :show="show" />
    <!-- JUMP LINKS -->
    <div
      class="hidden md:flex flex-wrap justify-content-center align-items-center gap-3 my-5 px-3"
    >
      <template v-if="status === 'success'">
        <Button
          v-for="i in sectionAnchorData"
          :key="i.id"
          :label="i.label"
          severity="secondary"
          class="px-3 md:px-4 lg:px-6"
          @click="scrollToSection(i.id)"
        />
      </template>
      <template v-else>
        <Skeleton
          v-for="i in 5"
          :key="`jump-link-${i}`"
          height="2rem"
          width="8rem"
          borderRadius="1.75rem"
          class="w-7rem md:w-8rem lg:w-11rem"
        />
      </template>
    </div>
    <section class="py-4">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div v-if="status === 'success'" class="flex flex-column gap-5">
            <VStreamfield :streamfieldBlocks="show?.body" />
          </div>
          <div v-if="status !== 'success'">
            <div
              class="flex justify-content-between align-items-center mb-5 mt-2"
            >
              <Skeleton height="18px" width="80px" borderRadius="4px" />
              <Skeleton height="18px" width="80px" borderRadius="4px" />
            </div>
            <skeleton-media-card
              v-for="i in 10"
              :key="`sk1-${i}`"
              is-horizontal
              imgCol="w-7rem md:w-10rem"
              :size="[1, 1]"
              :showBg="false"
              :showBgMobile="false"
              showTease
              class="mb-6 mt-5"
            />
          </div>
          <WnycLoader
            v-if="page < maxPages && isApp"
            ref="loadMoreRef"
            spinner
            size="40px"
            class="mt-8 flex justify-content-center"
          />
          <Button
            v-if="!isApp"
            label="View All"
            severity="secondary"
            class="block mx-auto mt-6 px-5"
            @click="handleViewAll"
          />

          <div v-if="!isApp">
            <div class="block lg:hidden mt-8">
              <ShowSummary :show="show" />
            </div>
            <!-- <pre class="text-xs"> {{ show }}</pre> -->
          </div>
        </div>
        <div class="col-fixed hidden lg:block w-20rem">
          <ShowSummary :show="show" />
        </div>
      </div>
    </section>
    <BackToTopButton />
  </div>
</template>

