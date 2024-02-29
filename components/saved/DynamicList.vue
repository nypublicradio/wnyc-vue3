<script setup>
import { mediaTypes } from "~/composables/globals"
import { goToEpisodePage, goToStoryPage, goToShowPage } from "~/utilities/helpers"

const props = defineProps({
  table: {
    type: String,
    default: "favorited",
  },
  typeFilter: {
    type: [String, Array],
    default: null,
  },
})

// if user is logged in, get all their favorited shows
const client = useSupabaseClient()
const savedItems = ref(null)
const user = useCurrentUser()

const loadComponent = async (item) => {
  const componentName = computed(() => {
    switch (item.type) {
      case "show":
        return "ShowItem"
      case "episode":
      case "segment":
        return "EpisodeItem"
      case "story":
      case "article_page":
      case "article":
        return item.audio ? "EpisodeItem" : "StoryItem"
      case "live":
        return "LiveItem"
      default:
        return "EpisodeItem"
    }
  })

  return markRaw(
    await defineAsyncComponent({
      loader: () => import(`~/components/${componentName.value}.vue`),
      onError: (err) => {
        console.error(`Failed to load component ${componentName.value}: ${err.message}`)
      },
    })
  )
}

const getFilteredItemsData = computed(() => {
  let typeFilterCondition = ""
  if (Array.isArray(props.typeFilter)) {
    typeFilterCondition = props.typeFilter.map((filter) => `type.eq.${filter}`).join(",")
  } else {
    typeFilterCondition = `type.eq.${props.typeFilter}`
  }

  const query = client
    .from(props.table)
    .select("*")
    .eq("uid", user.value.id)
    .or(typeFilterCondition)
    .order("created_at", { ascending: false })

  return query
})

const getItemsData = async () => {
  if (user.value) {
    const { data, error } = props.typeFilter
      ? await getFilteredItemsData.value
      : await client
          .from(props.table)
          .select("*")
          .eq("uid", user.value.id)
          .order("created_at", { ascending: false })

    if (data?.length > 0) {
      savedItems.value = await Promise.all(
        data.map(async (item) => {
          const component = await loadComponent(item)
          savedItems.value = null
          return { ...item, data: item, component }
        })
      )
    } else {
      savedItems.value = null
    }
    if (error) {
      console.error("favorited items error", error)
    }
  }
}

watch(
  user,
  async () => {
    await getItemsData()
  },
  { immediate: true }
)
watch(
  () => props.typeFilter,
  () => {
    getItemsData()
  }
)

const handleDynamicNavigation = (item) => {
  switch (item.type) {
    case mediaTypes.EPISODES:
    case mediaTypes.SEGMENT:
      goToEpisodePage(item, null, false)
      break
    case mediaTypes.STORY:
    case mediaTypes.ARTICLE:
    case mediaTypes.ARTICLE_PAGE:
      item.audio
        ? goToEpisodePage(item, null, false)
        : goToStoryPage(item, { src: item.cmsSource }, false)
      break
    case mediaTypes.SHOW:
      goToShowPage(item)
      break
    default:
      goToEpisodePage(item, null, false)
  }
}
</script>

<template>
  <div v-if="savedItems" class="flex flex-column gap-4">
    <component
      v-for="(item, index) in savedItems"
      :key="index"
      :is="item.component"
      :data="item.data"
      :saved="true"
      @onDeleteFavorite="getItemsData"
      @onClick="handleDynamicNavigation(item)"
    />
  </div>
  <slot v-else />
</template>
