<script setup>
import VPerson from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue'
import { trackClickEvent } from '~/utilities/helpers'
//import { trackClickEvent } from '~/utilities/helpers'
//import { StaffPage } from '../../composables/types/Page'
//import { ArticlePage } from '~/composables/types/Page'

const route = useRoute()
const config = useRuntimeConfig()

const staffSlug = route.params.slug
const newPageData = ref(null)
const { data: pagedata } = await useFetch(
  `${config.public.BFF_URL}/api/staff/wagtail/${staffSlug}`
)
newPageData.value = pagedata.value

let offset = 0

const loadMoreArticles = async () => {
  const { data: additionalPageData } = await useFetch(
    `${
      config.public.BFF_URL
    }/api/staff/wagtail/${staffSlug}?offset=${(offset += 10)}`
  )

  newPageData.value.articles = [
    ...newPageData.value.articles,
    ...additionalPageData.value.articles,
  ]
}

const authorName = `${pagedata.value.authorData[0]?.firstName} ${pagedata.value.authorData[0]?.lastName}`

const pageTitle = `Articles by ${authorName} | Gothamist`

useHead({
  title: pageTitle,
})
useServerHead({
  meta: [{ property: 'og:title', content: pageTitle }],
})

const routeBack = () => {
  trackClickEvent('Staff', 'Staff page', 'route back')
  const history = window.history.state.back ?? '/home'
  navigateTo(history)
}
</script>

<template>
  <section class="staff-page">
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
      <div class="content">
        <div class="grid">
          <div class="col-12">
            <hr class="my-4" />
            <!-- <pre>{{ pagedata.authorData }}</pre> -->
            <VPerson
              v-if="pagedata.authorData"
              :profileData="pagedata.authorData[0]"
              class="text-sm"
              onStaffPage
            />
            <div class="h5" v-else>{{ authorName }}</div>
            <hr class="my-4" />
          </div>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
        <div id="articleList" class="grid">
          <div v-if="pagedata.articles.length > 0" class="col staff-articles">
            <div
              v-for="(article, index) in newPageData.articles"
              :key="article?.uuid"
              class="mb-4"
            >
              <Story :article="article" :index="index" />
            </div>
          </div>
          <p v-else class="col">No articles available</p>
          <div class="col-fixed col-fixed-width-330 hidden xl:block">
            <!-- <HtlAd
              layout="rectangle"
              slot="htl-gothamist_interior_midpage_1"
              fineprint="Gothamist is funded by sponsors and member donations"
            /> -->
          </div>
        </div>
        <div class="block xl:hidden mb-4">
          <!-- <HtlAd
            layout="rectangle"
            slot="htl-gothamist_interior_midpage_2"
            fineprint="Gothamist is funded by sponsors and member donations"
          /> -->
        </div>
        <Button
          v-if="pagedata.articles.length < pagedata.count"
          class="p-button-rounded"
          label="Load More"
          @click="loadMoreArticles"
        >
        </Button>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.staff-page {
  hr {
    background: var(--text-color);
  }
}
</style>
