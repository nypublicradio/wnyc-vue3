<script setup>
import { useSavedMenuItems } from '~/composables/globals.ts'
// import FollowedShows from '~/components/saved/FollowedShows.vue'
// import Favorites from '~/components/saved/Favorites.vue'
// import Downloads from '~/components/saved/Downloads.vue'
// import RecentlyPlayed from '~/components/saved/Favorites.vue'

const savedMenuItems = useSavedMenuItems()

const selectedMenuItem = ref(savedMenuItems.value[0])

const scrollToActiveItem = () => {
  const selectedItem = document.getElementsByClassName('selected')
  if (selectedItem[0]) {
    //console.log('scrolling')
    selectedItem[0].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'start',
    })
  }
}

const selectMenuItem = async (menuItem) => {
  selectedMenuItem.value = menuItem
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
</script>

<template>
  <div class="saved-page">
    <section class="flex align-items-center justify-content-between">
      <h1>Saved</h1>
      <Button
        class="-mr-3 text-sm"
        label="Add"
        text
        plain
        icon="pi pi-plus"
        iconPos="right"
        size="large"
      ></Button>
    </section>
    <HorizontalScrollFeature class="items-holder mt-3">
      <div class="flex">
        <div
          v-for="item in savedMenuItems"
          class="item-holder"
          :class="[{ selected: selectedMenuItem.value === item.value }]"
          :key="item.label"
        >
          <div class="relative item-btn-holder">
            <Button
              class="item-btn text-sm white-space-nowrap"
              :label="item.label"
              @click="selectMenuItem(item)"
              severity="secondary"
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
</template>

<style lang="scss" scoped>
.saved-page {
  .items-holder {
    .item-holder {
      .item-btn {
        margin-left: 1rem;
        &:first-child {
          margin-left: 1.25rem;
        }
      }
      &.selected .item-btn {
        background-color: var(--red);
        color: #ffffff;
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
