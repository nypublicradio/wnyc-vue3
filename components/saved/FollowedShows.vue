<script setup>
// if user is logged in, get all their favorited shows
const client = useSupabaseClient()
const favoritedShows = ref(null)
const user = useCurrentUser()

watch(
  user,
  async () => {
    if (user.value) {
      const { data, error } = await client
        .from("favorited")
        .select("*")
        .eq("uid", user.value.id)
        .eq("media_type", "show")
      if (data?.length > 0) {
        favoritedShows.value = data
      }
      if (error) {
        console.log("favorited items error", error)
      }
    }
  },
  { immediate: true }
)

const loadComponent = (show) => {
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
  return defineAsyncComponent({
    loader: () => import(`~/components/${componentName.value}.vue`),
    onError: (err) => {
      console.error(`Failed to load component ${componentName.value}: ${err.message}`)
    },
  })
}
</script>

<template>
  <section class="followed-shows">
    <div v-if="favoritedShows">
      <!-- <h2 class="mb-4">Followed shows:</h2> -->
      <div v-for="(show, index) in favoritedShows" :key="index">
        <pre class="text-xs">{{ show }}</pre>
        <component :is="loadComponent(show)" :show="show" />
      </div>
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
