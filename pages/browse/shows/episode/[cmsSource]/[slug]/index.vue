<script setup>
import { useToast } from "primevue/usetoast"
import { togglePlayEpisode } from "~/utilities/helpers"
import { useTopStories } from "~/composables/useTopStories"
import { redirects, isolateSlug } from "~/utilities/show-slug-lookup-table"
const { getFilteredTopStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const {
  data: episode,
  status,
  error,
} = useFetch(
  () =>
    `${config.public.BFF_URL}/api/v2/show/episode/${route.params.cmsSource}/${route.params.slug}`,
  {
    key: `index-episode-${route.params.cmsSource}-${route.params.slug}`,
    onResponse({ response }) {
      const res = response._data
      $analytics.sendPageView({
        page_title: res.title,
        page_type: "episode_page",
        content_group: "on_demand_episode",
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res.publicationDate,
        article_updated_date: res.updatedDate
          ? res.updatedDate
          : res.publicationDate,
        article_title: res.title,
      })

      // check route param autoplay exists and if so, play the first segment
      if (route.query.autoplay === "true") {
        togglePlayEpisode(res.audio[0])
        // remove the autoplay query param
        router.replace({ query: { ...route.query, autoplay: null } })
      }
    },
    onResponseError() {
      toast.add({
        severity: "error",
        summary:
          "We are having a problem loading this episode. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)
const episodeData = computed(() => episode.value)
const showId = computed(
  () => episodeData.value?.showSlug || episodeData.value?.showId || null
)
const { data: fetchedShowInfo } = useLazyFetch(() =>
  showId.value
    ? `${config.public.BFF_URL}/api/v2/show/${showId.value}?slugOnly=true`
    : null
)
// finds the show slug from the headers links with the item type of show, then checks the show-slug-lookup-table for a redirect
const getUpdatedShowSlug = () => {
  const showSlug = episodeData.value?.headers?.links?.find(
    (link) => link.itemType === "show"
  )?.slug

  const redirect = redirects.find(
    (redirect) => isolateSlug(redirect.from) === showSlug
  )

  return redirect ? isolateSlug(redirect.to) : null
}
// if we do have a showId (simplecast), we can use it to fetch the show info
// otherwise (old favorited publisher), we can use the show slug from the episode data
// but we also have to use the show-slug-lookup-table to get the correct show slug
const showInfo = computed(() => {
  if (showId.value) {
    return fetchedShowInfo.value
  }
  return {
    show: {
      slug: getUpdatedShowSlug() || episodeData.value?.show?.slug,
    },
  }
})

const { data: show, status: showStatus } = useLazyFetch(() =>
  showInfo.value?.show?.slug
    ? `${config.public.BFF_URL}/api/pages/wagtail/${showInfo.value?.show?.slug}?showOnly=true`
    : null
)

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  {
    label: show.value?.title,
    route: `/browse/shows/${show.value?.meta?.slug}`,
  },
  { label: episodeData.value?.title },
])
</script>

<template>
  <div class="episode-page">
    <Html lang="en">
      <Head>
        <Title>{{ episodeData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${episodeData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${episodeData?.title} | WNYC`" />
      </Head>
    </Html>
    <FetchError v-if="error" />
    <template v-else>
      <section class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </section>
      <EpisodeTemplate
        :pending="status !== 'success'"
        :episodeData="episodeData"
        :show="show"
        :showPending="showStatus !== 'success'"
      >
        <template #bottom>
          <Divider class="mt-8 mb-5" />
          <h2 class="mb-3">Top Stories From Gothamist</h2>
          <TopStories :articles="getFilteredTopStories(episodeData)" />
        </template>
      </EpisodeTemplate>

      <BackToTopButton />
    </template>
  </div>
</template>

<style lang="scss">
.episode-page {
  min-height: 100vh;
}
.episode-page .segment-list .beforeHack {
  &::before {
    content: "";
    display: block;
    height: 0px;
  }
}

.episode-page .html-convert {
  p {
    line-height: 1.8em;
  }
}
</style>
