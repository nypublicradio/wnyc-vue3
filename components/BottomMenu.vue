<script setup>
import { ref, watch, onMounted } from 'vue'
import { useBottomMenuState } from '~/composables/states'
import HomeIcon from './icons/HomeIcon.vue'
import LiveIcon from './icons/LiveIcon.vue'
import BrowseIcon from './icons/BrowseIcon.vue'
import StarIcon from './icons/StarIcon.vue'

const route = useRoute()

const options = ref([
  { icon: markRaw(HomeIcon), value: 'home', slug: '/' },
  { icon: markRaw(LiveIcon), value: 'live', slug: '/live' },
  { icon: markRaw(BrowseIcon), value: 'browse', slug: '/browse' },
  { icon: markRaw(StarIcon), value: 'saved', slug: '/saved' },
])
const bottomMenuState = useBottomMenuState()

const menuClick = (e) => {
  navigateTo(e.value.slug)
}

// if another trigger changes the route, update the bottom menu state
watch(route, (e) => {
  options.value.map((item) => {
    if (e.name === item.value) bottomMenuState.value = { value: item.value }
    if (e.name === 'index') bottomMenuState.value = { value: 'home' }
  })
})
</script>

<template>
  <div class="bottom-menu" data-style-mode="dark">
    <SelectButton
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
          <p>{{ slotProps.option.value }}</p>
        </div>
      </template>
    </SelectButton>
  </div>
</template>

<style lang="scss">
.bottom-menu {
  background-color: var(--night-500);
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 10000;
  width: 100%;

  .p-selectbutton {
    height: var(--bottom-menu-height);
    width: 100%;
    display: flex;
    justify-content: space-around;
    .p-button {
      border-radius: 0 !important;
      font-size: 13px;
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
      }
    }
  }
}
</style>
