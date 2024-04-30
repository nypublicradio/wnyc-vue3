<script setup>
import { ref, watch } from "vue"
import { useBottomMenuState } from "~/composables/states"
import HomeIcon from "./icons/HomeIcon.vue"
import LiveIcon from "./icons/LiveIcon.vue"
import BrowseIcon from "./icons/BrowseIcon.vue"
import StarIcon from "./icons/StarIcon.vue"
import { trackClickEvent, capitalizeFirstLetter } from "~/utilities/helpers"
const { $gsap } = useNuxtApp()
const route = useRoute()

const bottomMenuState = useBottomMenuState()
const options = ref([
  { icon: markRaw(HomeIcon), value: "home", slug: "/home" },
  { icon: markRaw(LiveIcon), value: "live", slug: "/live" },
  { icon: markRaw(BrowseIcon), value: "browse", slug: "/browse" },
  { icon: markRaw(StarIcon), value: "saved", slug: "/saved" },
])

// if another trigger changes the route, update the bottom menu state
watch(
  () => route.path,
  (e) => {
    bottomMenuState.value = { value: null }
    options.value.forEach((item) => {
      //console.log('item =', item.value, 'route =', e)
      if (e.includes(item.value)) bottomMenuState.value = { value: item.value }
      //if (e === 'index') bottomMenuState.value = { value: 'home' }
    })
  },
  { immediate: true }
)
// handle bottom menu click to set active and track the event
const menuClick = (item) => {
  trackClickEvent("Click Tracking - Bottom Menu", "Bottom Menu", item.slug)
  bottomMenuState.value = { value: item.value }
}
onMounted(() => {
  // initial animation to catched users eye.
  $gsap.from(".bottom-menu", { delay: 1.5, y: 60, duration: 0.5 })
})
</script>

<template>
  <div class="bottom-menu">
    <div class="buttons-holder">
      <template v-for="item in options" :key="item.slug">
        <NuxtLink :to="item.slug" class="link w-full" prefetch>
          <Button
            @click="menuClick(item)"
            class="w-full"
            :aria-label="`${item.value} menu button`"
          >
            <div class="item">
              <component :is="item.icon" :active="bottomMenuState.value == item.value">
              </component>
              {{ capitalizeFirstLetter(item.value) }}
            </div>
          </Button>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>

<style lang="scss">
.bottom-menu {
  background-color: var(--bottom-menu-bg-color);
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1001;
  width: 100vw;
  padding-bottom: env(safe-area-inset-bottom);
  .buttons-holder {
    height: var(--bottom-menu-height);
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
    .link {
      text-decoration: none;
      .p-button {
        border-radius: 0 !important;
        background-color: rgba(0, 0, 0, 0);
        color: #ffffff;
        border-color: rgba(0, 0, 0, 0);
        border: none;
        opacity: 0.6;
        text-align: center;
        box-shadow: none;
        flex-grow: 1;
        justify-content: center;
        text-decoration: none;
        .o-icon {
          flex: none;
          width: 28px;
          height: 28px;
          fill: var(--bottom-menu-icon-color);
        }
        .item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 12px;
          line-height: 15px;
          font-weight: var(--font-weight-500);
          font-family: var(--font-family-header);
          text-decoration: none;
        }
      }
      &.router-link-active {
        .p-button {
          opacity: 1;
        }
      }
    }
  }
}
</style>
