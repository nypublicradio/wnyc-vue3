<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import VPerson from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue"
import { trackClickEvent } from "~/utilities/helpers"

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const personSlug = route.params.slug
//const newPageData = ref(null)
const { data: pagedata, pending, error, refresh } = await useFetch(
  `${config.public.BFF_URL}/api/people/publisher/${personSlug}`
)

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
  router.go(-1)
}

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
        <div class="grid mt-4">
          <div class="col-12">
            <VPerson
              v-if="pagedata"
              :profileData="pagedata"
              class="html-formatting"
              onStaffPage
            >
              <template #slot-above-bio>
                <h3 class="mt-3 mb-2" v-if="pagedata.shows.length">Shows</h3>
                <div class="flex flex-column gap-3">
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
                    />
                    <p class="m-0">{{ show.title }}</p>
                  </NuxtLink>
                </div>
              </template>
            </VPerson>
            <div class="h5" v-else>{{ PersonName }}</div>
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
