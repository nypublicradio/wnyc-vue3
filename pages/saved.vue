<script setup>
import { useSelectedSavedTab, useIsDarkMode } from "~/composables/states"
import { getSavedMenuItems } from "~/composables/globals"
import FollowedShows from "~/components/saved/FollowedShows.vue"
import Favorites from "~/components/saved/Favorites.vue"
import Downloads from "~/components/saved/Downloads.vue"
import History from "~/components/saved/History.vue"

useHead({
  title:
    "Saved | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "Saved | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "Saved | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
  bodyAttrs: {
    class: "grey-bg",
  },
})

const route = useRoute()
const router = useRouter()
const routeSlug = ref(route.query.slug)

const user = useCurrentUser()
const savedMenuItems = ref(getSavedMenuItems())
const selectedSavedTab = useSelectedSavedTab()
const selectedMenuItem = ref(savedMenuItems.value[selectedSavedTab.value])
const isDarkMode = useIsDarkMode()

// function to scroll to the selected item
const scrollToActiveItem = () => {
  const selectedItem = document.getElementsByClassName("selected")
  if (selectedItem[0]) {
    selectedItem[0].scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    })
  }
}

// function to handle when a menu item is clicked
const selectMenuItem = async (menuItem, index) => {
  try {
    selectedMenuItem.value = menuItem
    selectedSavedTab.value = index
    await nextTick()
    // update the route query with the selected slug
    await router.replace({
      query: { ...router.currentRoute.value.query, slug: menuItem.value },
    })
    // scroll to the active item
    await nextTick()
    scrollToActiveItem()
  } catch (error) {
    console.error("Error in selectMenuItem:", error)
  }
}

const savedComponentMap = {
  FollowedShows,
  Favorites,
  Downloads,
  History,
}

// Create a computed to get the current component to avoid recreating it
const currentComponent = computed(() => {
  return savedComponentMap[selectedMenuItem.value.value]
})

const handleStyleMode = computed(() => {
  return isDarkMode.value ? "dark" : "light"
})
const handleBgColor = computed(() => {
  return isDarkMode.value ? "none" : "#ffffff"
})

// watcher for triggering a play of the live stream from a route variable
watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    try {
      // checking if the slug is in the query
      if (newQuery.slug) {
        routeSlug.value = newQuery.slug
        savedMenuItems.value.forEach((item, index) => {
          if (item.value === newQuery.slug) {
            // Use direct assignment instead of calling selectMenuItem to avoid recursion
            selectedMenuItem.value = item
            selectedSavedTab.value = index
          }
        })
      }
    } catch (error) {
      console.error("Error in route watcher:", error)
    }
  },
  { immediate: true }
)

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Saved",
    page_type: "saved_tab",
    content_group: "app_tab",
  })
  // scroll to active item
  setTimeout(() => {
    scrollToActiveItem()
  }, 20)
})
</script>

<template>
  <div class="saved-page thinContent">
    <section class="flex align-items-center justify-content-between md:py-5">
      <h1>Saved</h1>
    </section>
    <div v-if="user">
      <HorizontalScrollFeature class="items-holder mb-3" :data="savedMenuItems">
        <div
          v-for="(item, index) in savedMenuItems"
          class="item-holder item"
          :class="[{ selected: selectedMenuItem.value === item.value }]"
          :key="item.label"
        >
          <div class="relative btn-holder">
            <Button
              class="item-btn text-sm white-space-nowrap btn"
              :label="item.label"
              :aria-label="`${item.label} button`"
              @click="selectMenuItem(item, index)"
              :severity="
                selectedMenuItem.value === item.value ? 'primary' : 'secondary'
              "
            />
          </div>
        </div>
        <!-- </div> -->
      </HorizontalScrollFeature>

      <div class="current-component">
        <component :is="currentComponent" />
      </div>
    </div>
    <div v-else>
      <AccountPromptSideBar
        :styleMode="handleStyleMode"
        :bgColor="handleBgColor"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.saved-page {
  min-height: 95vh;
  .items-holder {
    .item-holder {
      .item-btn {
        min-width: 160px;
      }

      &.selected .item-btn {
        background-color: var(--p-red-500);
        color: #ffffff;
      }
    }
  }
}
</style>
