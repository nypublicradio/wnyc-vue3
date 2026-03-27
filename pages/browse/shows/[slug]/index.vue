<script setup>
import { checkIsFavorited, slugify, getFirstSentence } from "~/utilities/helpers"
import { useIsApp } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()
const sectionAnchorData = ref([
  //  { label: "Most Recent", id: "most-recent" },
])

const {
  data: show,
  status,
  error,
} = await useFetch(
  `${config.public.BFF_URL}/api/pages/wagtail/${route.params.slug}`,
  {
    onResponse(res) {
      sectionAnchorData.value = res.response._data.inPageNavigation.map(
        (item) => {
          return {
            label: item.value.linkText,
            id: slugify(item.value.targetId || item.value.linkText),
          }
        }
      )
    },
  }
)

const isApp = useIsApp()

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

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

const title = `${show.value?.title} | WNYC`
})
const description = getFirstSentence(show.value?.summary)

useHead({
  title,
})
useSeoMeta({
  title,
  description,
})
</script>


<template>
  <div class="shows-page pb-7" :class="{ 'is-app': isApp }">
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
      <FetchError v-if="error" />
    </section>
    <template v-if="!error">
      <!-- <pre>{{ show }}</pre> -->
      <ShowHeader :show="show" />

      <story-htlAd
        class="md:hidden mt-4 mb-3"
        layout="rectangle"
        slotClass="htlad-wnyc_homepage_rectangle"
        fineprint="WNYC is funded by sponsors and member donations"
      />
      <!-- JUMP LINKS -->
      <section v-if="sectionAnchorData" class="hidden md:block">
        <div class="grid">
          <div class="col-fixed hidden xxl:block w-20rem"></div>
          <div class="col pr-2 lg:pr-4">
            <div
              class="flex flex-wrap justify-content-start align-items-center gap-3 my-5"
            >
              <template v-if="status === 'success'">
                <Button
                  v-for="i in sectionAnchorData"
                  :key="i.id"
                  :label="i.label"
                  severity="secondary"
                  class="px-3 md:px-3 lg:px-4"
                  @click="scrollToSection(i.id)"
                />
              </template>
              <template v-else>
                <Skeleton
                  v-for="i in 3"
                  :key="`jump-link-${i}`"
                  height="2rem"
                  width="8rem"
                  borderRadius="1.75rem"
                  class="w-7rem md:w-8rem lg:w-11rem"
                />
              </template>
            </div>
          </div>
          <!-- <div class="col-fixed hidden lg:block w-20rem"></div> -->
        </div>
      </section>

      <section class="pb-4">
        <!-- <pre class="text-lg">{{ show }}</pre> -->
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
            <div v-if="!isApp">
              <div class="block lg:hidden mt-8">
                <ShowSummary :show="show" />
              </div>
            </div>
          </div>
          <div class="col-fixed hidden lg:block w-20rem">
            <ShowSummary :show="show" />
          </div>
        </div>
      </section>
      <BackToTopButton />
    </template>
  </div>
</template>
