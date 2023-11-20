<script setup>
const props = defineProps({
  table: {
    type: String,
    default: "favorited",
  },
  type: {
    type: String,
    default: "show",
  },
})

// if user is logged in, get all their favorited shows
const config = useRuntimeConfig()
const client = useSupabaseClient()
const savedItems = ref(null)
const user = useCurrentUser()

const loadData = async (item) => {
  console.log("item = ", item)
  const { data: res } = await useFetch(
    `${config.public.BFF_URL}/api/show/${item.slug}`
  )
  return res.value.show
}

const getItemsData = async () => {
  if (user.value) {
    const { data, error } = await client
      .from(props.table)
      .select("*")
      .eq("uid", user.value.id)
      .or(`type.eq.${props.type}`)

    if (data?.length > 0) {
      savedItems.value = await Promise.all(
        data.map(async (item) => {
          const component = await loadComponent(item)
          const itemData = await loadData(item)
          savedItems.value = null
          return { ...item, data: itemData, component }
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

const loadComponent = async (item) => {
  const componentName = computed(() => {
    switch (item.type) {
      case "show":
        return "ShowItem"
      case "episode":
        return "EpisodeItem"
      case "story":
        return "StoryItem"
      default:
        return "ShowItem"
    }
  })

  return await defineAsyncComponent({
    loader: () => import(`~/components/${componentName.value}.vue`),
    onError: (err) => {
      console.error(`Failed to load component ${componentName.value}: ${err.message}`)
    },
  })
}
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
