<script setup>
import VPerson from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue'
//import { trackClickEvent } from '~/utilities/helpers'
//import { StaffPage } from '../../composables/types/Page'
//import { ArticlePage } from '~/composables/types/Page'

const route = useRoute()
const config = useRuntimeConfig()

const staffSlug = route.params.slug

const { data: pagedata } = await useFetch(
  `${config.public.BFF_URL}/api/staff/wagtail/${staffSlug}`
)

//console.log('pagedata = ', pagedata)
console.log('articles = ', pagedata.value.articles[0])

const initialStoryCount = ref(12)
const loadMoreStoryCount = ref(12)
const loadMoreContainer = ref('#articleList')

const loadMoreArticles = async () => {}

const authorName = `${pagedata.value.authorData[0]?.firstName} ${pagedata.value.authorData[0]?.lastName}`

const pageTitle = `Articles by ${authorName} | Gothamist`

useHead({
  title: pageTitle,
})
useServerHead({
  meta: [{ property: 'og:title', content: pageTitle }],
})

const routeBack = () => {
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
      <div class="content mt-4">
        <div class="grid gutter-x-30">
          <div class="col-12">
            <h1 class="sr-only">{{ authorName }}</h1>
            <h2>Articles by {{ authorName }}</h2>
            <hr class="black mt-3 md:mt-6 mb-2" />
          </div>
          <div class="col mb-6">
            <VPerson
              v-if="pagedata.authorData"
              :profileData="pagedata.authorData[0]"
              onStaffPage
              class="mb-4"
            />
            <div class="h5" v-else>{{ authorName }}</div>
          </div>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
        <div id="articleList" class="grid gutter-x-30">
          <div v-if="pagedata.articles.length > 0" class="col staff-articles">
            <div
              v-for="(article, index) in pagedata.articles"
              :key="article?.uuid"
            >
              <Story :article="article" :index="index" />
              <hr class="mb-5" />
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
}
</style>
