<script setup>
import BrowseItem from "~/components/BrowseItem.vue"
import { deleteFavorite } from "~/utilities/helpers"
// if user is logged in, get all their favorited shows
const config = useRuntimeConfig()
const client = useSupabaseClient()
const favoritedShows = ref(null)
const user = useCurrentUser()

const loadData = async (show) => {
  console.log("show = ", show)
  const { data: res } = await useFetch(
    `${config.public.BFF_URL}/api/show/${show.media_slug}`
  )
  return res.value.show
}

const getData = async () => {
  if (user.value) {
    const { data, error } = await client
      .from("favorited")
      .select("*")
      .eq("uid", user.value.id)
      .eq("media_type", "show")
    if (data?.length > 0) {
      console.log("getting data")
      favoritedShows.value = await Promise.all(
        data.map(async (show) => {
          const component = await loadComponent(show)
          const showData = await loadData(show)
          favoritedShows.value = null
          return { ...show, data: showData, component }
        })
      )
    } else {
      favoritedShows.value = null
    }
    if (error) {
      console.log("favorited items error", error)
    }
  }
}

watch(
  user,
  async () => {
    getData()
  },
  { immediate: true }
)

const loadComponent = async (show) => {
  const componentName = computed(() => {
    switch (show.media_type) {
      case "show":
        return "BrowseItem"
      case "episode":
        return "EpisodeItem"
      case "story":
        return "StoryItem"
      default:
        return "BrowseItem"
    }
  })

  return await defineAsyncComponent({
    loader: () => import(`~/components/${componentName.value}.vue`),
    onError: (err) => {
      console.error(`Failed to load component ${componentName.value}: ${err.message}`)
    },
  })
}

const onDeleteFavorite = async () => {
  getData()
}
</script>

<template>
  <section class="followed-shows">
    <div v-if="favoritedShows" class="flex flex-column gap-4">
      <component
        v-for="(show, index) in favoritedShows"
        :key="index"
        :is="show.component"
        :data="show.data"
        @onDeleteFavorite="onDeleteFavorite"
        @onClick="navigateTo(show.route_href)"
      />
    </div>
    <div v-else class="empty flex flex-column gap-3 text-center mt-8">
      <h2>Followed shows will appear here!</h2>
      <div class="max-w-15rem m-auto">
        <p class="line-height-3">
          Use the <strong>follow</strong> button
          <FollowIcon class="w-2rem -mb-2" />
        </p>
        <p class="line-height-3">
          to follow your favorite shows — the latest episodes will appear here.
        </p>
      </div>
      <Button
        label="Browse Shows"
        link
        class="underline"
        size="small"
        @click="navigateTo('/browse')"
      />
    </div>

    <div class="up-to-date flex flex-column gap-3 text-center mt-8">
      <h2>You're up to date!</h2>
      <img src="/face.svg" alt="happy face illustration" class="w-6rem m-auto my-4" />
      <p class="px-4">
        It feels great to be informed...<br />
        check back tomorrow for the latest.
      </p>

      <Button
        label="Listen to the live stream"
        link
        class="underline"
        size="small"
        @click="navigateTo('/live')"
      />
    </div>
  </section>
</template>

<style lang="scss" scoped>
.followed-shows {
}
</style>
