<script setup>
import { mediaTypes } from "~/composables/globals"

const props = defineProps({
  table: {
    type: String,
    default: "favorited",
  },
  typeFilter: {
    type: [String, Array],
    default: null,
  },
  excludeFilter: {
    type: [String, Array],
    default: null,
  },
  isSaveHistory: {
    type: Boolean,
    default: true,
  },
  headerTitle: {
    type: String,
    default: null,
  },
})

// if user is logged in, get all their favorited shows
const client = useSupabaseClient()
const savedItems = ref(null)
const user = useCurrentUser()
const pending = ref(true)
const fetchError = ref(null)

// determines what component to load based on the item type
const loadComponent = async (item) => {
  const componentName = computed(() => {
    switch (item.type) {
      case mediaTypes.SHOW:
        return "ShowItem"
      case mediaTypes.EPISODE:
      case mediaTypes.SEGMENT:
      case mediaTypes.NPR_EPISODE:
      case mediaTypes.STORY:
      case mediaTypes.ARTICLE_PAGE:
      case mediaTypes.ARTICLE:
      case mediaTypes.NPR_ARTICLE:
      case mediaTypes.SIMPLECAST:
      case mediaTypes.LIVE:
        return "MediaCard"
      default:
        return "MediaCard"
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

const getFilteredItemsData = computed(async () => {
  pending.value = true
  let typeFilterCondition = ""
  if (Array.isArray(props.typeFilter)) {
    typeFilterCondition = props.typeFilter.map((filter) => `type.eq.${filter}`).join(",")
  } else {
    typeFilterCondition = `type.eq.${props.typeFilter}`
  }

  const query = await client
    .from(props.table)
    .select("*")
    .eq("uid", user.value.id)
    .or(typeFilterCondition)
    .neq("type", props.excludeFilter ?? null)
    .order("created_at", { ascending: false })
  pending.value = false
  return query
})

// retrieve item data
const getItemsData = async () => {
  if (user.value) {
    pending.value = true
    const { data, error } = props.typeFilter
      ? await getFilteredItemsData.value
      : await client
          .from(props.table)
          .select("*")
          .eq("uid", user.value.id)
          .neq("type", props.excludeFilter ?? null)
          .order("created_at", { ascending: false })
    if (data?.length > 0) {
      savedItems.value = await Promise.all(
        data.map(async (item) => {
          const component = await loadComponent(item)
          return { ...item, data: item, component }
        })
      )
    } else {
      savedItems.value = null
    }
    pending.value = false
    fetchError.value = error
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

onBeforeUnmount(() => {
  savedItems.value = null
  pending.value = false
  fetchError.value = null
})

watch(
  () => props.typeFilter,
  () => {
    getItemsData()
  }
)
</script>

<template>
  <div v-if="!pending">
    <div v-if="savedItems">
      <h2 v-if="headerTitle" class="mb-4 mt-3">{{ headerTitle }}</h2>
      <div class="flex flex-column gap-5">
        <div v-for="(item, index) in savedItems" :key="index">
          <component
            :is="item.component"
            :data="item.data"
            :saved="true"
            @onDeleteFavorite="getItemsData"
            :class="item.type"
            :menu="true"
            is-horizontal
            imgCol="w-7rem h-7rem"
            :size="{ xs: [112, 112] }"
            :showBg="false"
            :showBgMobile="false"
          />
          <slot name="recent-episodes" :show="item" />
        </div>
      </div>
    </div>
    <slot v-if="!savedItems && !pending" name="empty" />
    <FetchError v-if="fetchError" @on-click="getItemsData" />
  </div>
  <div v-else class="grid gap-3">
    <skeleton-media-card
      v-for="index in 10"
      :key="`skeleton-2-${index}`"
      class="col-12"
      is-horizontal
      :showBg="false"
      :showBgMobile="false"
      imgCol="w-7rem"
      :size="{ xs: [112, 112] }"
    />
  </div>
</template>
