<script setup>
import { ref, watch } from "vue"
import { useBottomMenuState } from "~/composables/states"
import HomeIcon from "./icons/HomeIcon.vue"
import LiveIcon from "./icons/LiveIcon.vue"
import BrowseIcon from "./icons/BrowseIcon.vue"
import StarIcon from "./icons/StarIcon.vue"
import { trackClickEvent, capitalizeFirstLetter } from "~/utilities/helpers"

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
</script>

<template>
  <div class="bottom-menu" data-style-mode="dark">
    <div class="buttons-holder">
      <NuxtLink v-for="item in options" :to="item.slug" class="w-full" prefetch>
        <Button @click="menuClick(item)" class="w-full">
          <div class="item">
            <component :is="item.icon" :active="bottomMenuState.value == item.value">
            </component>
            {{ capitalizeFirstLetter(item.value) }}
          </div>
        </Button>
      </NuxtLink>
    </div>
    <!-- <SelectButton
      v-model="bottomMenuState"
      :options="options"
      option-label="value"
      data-key="value"
      aria-labelledby="custom"
      unselectable
      @change="menuClick"
    >
      <template #option="slotProps">
        <div class="item">
          <component
            :is="slotProps.option.icon"
            :active="bottomMenuState.value == slotProps.option.value"
          ></component>
          {{ capitalizeFirstLetter(slotProps.option.value) }}
        </div>
      </template>
    </SelectButton> -->
  </div>
</template>

<style lang="scss">
.bottom-menu {
  background-color: var(--night-500);
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10000;
  width: 100vw;
  padding-bottom: env(safe-area-inset-bottom);

  .buttons-holder {
    height: var(--bottom-menu-height);
    width: 100%;
    display: flex;
    justify-content: space-around;
    align-items: center;
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
      &:not(.p-disabled):not(.p-highlight):hover {
        background: rgba(0, 0, 0, 0);
        border-color: none;
        color: #ffffff;
      }
      &.p-highlight {
        opacity: 1;
        background: rgba(0, 0, 0, 0);
        border-color: unset;
        pointer-events: none;
      }
      .o-icon {
        flex: none;
        width: 28px;
        height: 28px;
      }
      .item {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;
        line-height: 15px;
        font-weight: var(--font-weight-500);
        font-family: var(--font-family-header);
      }
    }
  }
}
</style>
