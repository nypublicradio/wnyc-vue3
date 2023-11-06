<script setup lang="ts">
import VPerson from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue'
import { trackClickEvent } from '~/utilities/helpers'
//import { StaffPage } from '../../composables/types/Page'
//import { ArticlePage } from '~/composables/types/Page'

const route = useRoute()
const config = useRuntimeConfig()

const staffSlug = route.params.staffSlug
// const curatedStaffPage = await findPage(`staff/${staffSlug}`).then(
//   ({ data }) => data?.value && (normalizeFindPageResponse(data) as StaffPage)
// )

const initialStoryCount = ref(12)
const loadMoreStoryCount = ref(12)
const loadMoreContainer = ref('#articleList')

const initialArticles = (await findArticlePages({
  author_slug: staffSlug,
  limit: initialStoryCount.value,
  offset: 0,
}).then(({ data }) => ({
  articles: data,
  count: data.value && Number(data.value.meta.totalCount),
}))) as { articles: ArticlePage[]; count: number }

console.log('initialArticles = ', initialArticles)

const articleTotal = ref(initialArticles.count)
const articles = ref(initialArticles.articles)
if (!articleTotal.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Page Not Found',
    fatal: true,
  })
}

const loadMoreArticles = async () => {
  const newArticles = await useLoadMoreArticles({
    author_slug: staffSlug,
    limit: loadMoreStoryCount.value,
    offset: articles.value.length,
  })
  articles.value.push(...newArticles)
  await nextTick()
  if (newArticles.length) {
    ;(
      [
        ...document.querySelectorAll(
          `${loadMoreContainer.value} .v-card .card-title-link`
        ),
      ].slice(-newArticles.length)[0] as HTMLElement
    ).focus()
  }
}

// find a match of the slug in the articles' authors array and return the matched author's data
const authorProfileData = articles.value[1]?.authors.find((author) => {
  return author.slug === staffSlug ? author : false
})

// formats the name of the author by manipulating the slug. This is used when authorProfileData returns no data
const getAuthorNameFromSlug = () => {
  let splitStr =
    typeof staffSlug === 'string' && staffSlug.toLowerCase().split('-')
  for (let i = 0; i < splitStr.length; i++) {
    splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1)
  }
  //return splitStr.join(' ')
  return splitStr
}

onMounted(() => {
  //$analytics.sendPageView({ page_type: 'staff_page' })
})

const authorName = authorProfileData?.name || getAuthorNameFromSlug()
const pageTitle = `Articles by ${authorName} | Gothamist`
useHead({
  title: pageTitle,
})
useServerHead({
  meta: [{ property: 'og:title', content: pageTitle }],
})

const routeBack = () => {
  navigateTo('/home')
}

console.log('authorProfileData = ', authorProfileData)
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
              v-if="authorProfileData"
              :profileData="authorProfileData"
              class="mb-4"
            />
            <div class="h5" v-else>{{ getAuthorNameFromSlug() }}</div>
          </div>
          <div class="col-fixed col-fixed-width-330 hidden xl:block"></div>
        </div>
        <div id="articleList" class="grid gutter-x-30">
          <div v-if="articles" class="col staff-articles">
            <div v-for="(article, index) in articles" :key="article?.uuid">
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
          v-if="articles.length < articleTotal"
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
