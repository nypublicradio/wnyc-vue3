<script setup>
import { useSelectedSavedTab, useIsDarkMode } from "~/composables/states"
import { getSavedMenuItems } from "~/composables/globals"

const user = useCurrentUser()
const savedMenuItems = ref(getSavedMenuItems())
const selectedSavedTab = useSelectedSavedTab()
const selectedMenuItem = ref(savedMenuItems.value[selectedSavedTab.value])
const isDarkMode = useIsDarkMode()

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

const selectMenuItem = async (menuItem, index) => {
  selectedMenuItem.value = menuItem
  selectedSavedTab.value = index
  await nextTick()
  scrollToActiveItem()
}

const loadComponent = (componentName) => {
  return defineAsyncComponent({
    loader: () => import(`~/components/saved/${componentName}.vue`),
    onError: (err) => {
      console.error(`Failed to load component ${componentName}: ${err.message}`)
    },
  })
}

const handleStyleMode = computed(async () => {
  await nextTick()
  return isDarkMode.value ? "dark" : "light"
})
const handleBgColor = computed(async () => {
  await nextTick()
  return isDarkMode.value ? "none" : "#ffffff"
})

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
  <div class="saved-page">
    <Html lang="en">
      <Head>
        <Title
          >Saved | WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="Saved | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="Saved | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
    <section class="flex align-items-center justify-content-between">
      <h1>Saved</h1>
      <!-- <Button
        class="-mr-3 text-sm"
        label="Add"
        text
        plain
        icon="pi pi-plus"
        iconPos="right"
        size="large"
      ></Button> -->
    </section>
    <div v-if="user">
      <HorizontalScrollFeature class="items-holder my-3">
        <div class="flex w-full">
          <div
            v-for="(item, index) in savedMenuItems"
            class="item-holder"
            :class="[{ selected: selectedMenuItem.value === item.value }]"
            :key="item.label"
          >
            <div class="relative item-btn-holder">
              <Button
                class="item-btn text-sm white-space-nowrap"
                :label="item.label"
                :aria-label="`${item.label} button`"
                @click="selectMenuItem(item, index)"
                :severity="
                  selectedMenuItem.value === item.value ? 'primary' : 'secondary'
                "
              />
            </div>
          </div>
        </div>
      </HorizontalScrollFeature>

      <div v-for="item in savedMenuItems" :key="item.value">
        <div v-if="item.value === selectedMenuItem.value">
          <component :is="loadComponent(item.value)" />
        </div>
      </div>
    </div>
    <AccountPromptSideBar v-else :styleMode="handleStyleMode" :bgColor="handleBgColor" />
  </div>
</template>

<style lang="scss" scoped>
.saved-page {
  .items-holder {
    .item-holder {
      .item-btn {
        min-width: 130px;
        margin-left: 1rem;
        &:first-child {
          margin-left: 1.25rem;
        }
      }
      &.selected .item-btn {
        background-color: var(--red);
        color: #ffffff;
      }
      &:first-child {
        @include media(">=md") {
          margin-left: calc(((100% - 768px) / 2) + 40px);
        }
      }
    }
  }
}
</style>

<style lang="scss">
.saved-page {
  .horizontal-scroll-feature .scroll {
    padding-left: 0 !important;
  }
}
</style>
