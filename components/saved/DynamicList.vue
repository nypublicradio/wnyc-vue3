<script setup>
const props = defineProps({
  table: {
    type: String,
    default: "favorited",
  },
  typeFilter: {
    type: String,
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
        return "EpisodeItem"
      case "story":
        return "StoryItem"
      case "live":
        return "LiveItem"
      default:
        return "ShowItem"
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

const getItemsData = async () => {
  if (user.value) {
    const { data, error } = props.typeFilter
      ? await client
          .from(props.table)
          .select("*")
          .eq("uid", user.value.id)
          .or(`type.eq.${props.typeFilter}`)
      : await client.from(props.table).select("*").eq("uid", user.value.id)

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
      console.log("favorited items error", error)
    }
  }
}

watch(
  user,
  async () => {
    getItemsData()
  },
  { immediate: true }
)
</script>

<template>
  <div v-if="savedItems" class="flex flex-column gap-4">
    <component
      v-for="(item, index) in savedItems"
      :key="index"
      :is="item.component"
      :data="item.data"
      @onDeleteFavorite="getItemsData"
      @onClick="navigateTo(item.route_href)"
    />
  </div>
  <slot v-else />
</template>

<style lanf="scss" scoped></style>
