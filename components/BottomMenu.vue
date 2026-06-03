<script setup>
import { useBottomMenuState, useIsNetworkConnected } from "~/composables/states"
import { trackClickEvent, capitalizeFirstLetter } from "~/utilities/helpers"
import { appMenuOptions as options } from "~/composables/globals"
import HomeIcon from "~/components/icons/HomeIcon.vue"
import LiveIcon from "~/components/icons/LiveIcon.vue"
import BrowseIcon from "~/components/icons/BrowseIcon.vue"
import StarIcon from "~/components/icons/StarIcon.vue"

const iconComponentMap = {
  HomeIcon,
  LiveIcon,
  BrowseIcon,
  StarIcon,
}
// get the bottom icon component based on the name
const getIconComponent = (iconName) => iconComponentMap[iconName]

const route = useRoute()

const bottomMenuState = useBottomMenuState()
const isNetworkConnected = useIsNetworkConnected()

// if another trigger changes the route, update the bottom menu state
watch(
  () => route.path,
  (e) => {
    bottomMenuState.value = { value: null }
    options.forEach((item) => {
      if (e.includes(item.value)) bottomMenuState.value = { value: item.value }
    })
  },
  { immediate: true }
)
// handle bottom menu click to set active and track the event
const menuClick = (item) => {
  trackClickEvent("Click Tracking - Bottom Menu", "Bottom Menu", item.slug)
  bottomMenuState.value = { value: item.value }
}
</script>

<template>
  <div class="bottom-menu">
    <div class="buttons-holder">
      <template v-for="item in options" :key="item.slug">
        <NuxtLink
          :to="`${item.slug}${
            !isNetworkConnected && item.slug === '/saved'
              ? '?slug=Downloads'
              : ''
          }`"
          class="link w-full"
          prefetch
        >
          <Button
            @click="menuClick(item)"
            class="w-full"
            :aria-label="`${item.value} menu button`"
          >
            <div class="item">
              <component
                :is="getIconComponent(item.icon)"
                :active="bottomMenuState.value?.value === item.value"
              >
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
@keyframes liftBottomMenu {
  0%,
  66% {
    transform: translateY(
      calc(var(--bottom-menu-height) + env(safe-area-inset-bottom))
    );
  }
  100% {
    transform: translateY(0);
  }
}
.bottom-menu {
  background-color: var(--solid-dark-bg-color);
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 1001;
  width: 100%;
  padding-bottom: env(safe-area-inset-bottom);
  animation: liftBottomMenu 1.5s ease-out;
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
          font-size: var(--font-size-4);
          line-height: var(--font-size-5);
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
