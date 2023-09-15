<script setup>
import { useSwipe } from '@vueuse/core'
const props = defineProps({
  label: {
    type: String,
    default: null,
  },
  menuItems: {
    type: Object,
    default: null,
    required: true,
  },
})
const visibleBottom = ref(false)
const selectedItem = ref('Download')
//swipe setup
const contentRef = ref(null)
const { direction, lengthY } = useSwipe(contentRef, {
  onSwipe() {
    if (direction.value === 'down' && lengthY.value < -5) {
      visibleBottom.value = false
      //emit('swipe-down')
    }
  },
  passive: true,
})

const openMenu = () => {
  visibleBottom.value = true
}

defineExpose({ openMenu })
</script>

<template>
  <div class="dropup-menu">
    <Sidebar
      v-model:visible="visibleBottom"
      class="dropup-menu"
      position="bottom"
      :showCloseIcon="false"
    >
      <template #header></template>
      <template #default>
        <div ref="contentRef" class="content-base">
          <i class="pi pi-minus" @click="visibleBottom = false" />
          <h3 v-if="props.label" class="p-submenu-header-replace">
            {{ props.label }}
          </h3>
          <Menu :model="menuItems" @click="visibleBottom = false" />
          <!-- <Menu :model="menuItems" /> -->
          <!-- <Listbox
            v-model="selectedItem"
            :options="menuItems"
            optionLabel="label"
            class="w-full"
          /> -->
          <slot name="end"></slot>
        </div>
      </template>
    </Sidebar>
  </div>
</template>

<style lang="scss">
.dropup-menu {
  background: var(--background4) !important;
  border-radius: 28px 28px 0px 0px;
  //overflow: hidden;
  color: #ffffff !important;
  height: unset !important;
  .p-sidebar-header,
  .p-submenu-header {
    display: none !important;
  }
  .p-sidebar-content {
    padding: 0;
    border-radius: 28px 28px 0px 0px;
    -webkit-box-shadow: 0 -20px 50px 0 rgba(0, 0, 0, 1);
    box-shadow: 0 -20px 50px 0 rgba(0, 0, 0, 1);
    .content-base {
      padding: 5px 20px calc($bottomMenuHeight + $playerHeight) 20px;
      .p-submenu-header-replace {
        background: transparent;
        color: #ffffff !important;
        font-weight: var(--font-weight-700);
        font-size: 1.625rem;
        font-family: var(--font-family-header);
        margin-bottom: 20px;
        padding-left: 0.5rem;
      }
      .pi-minus {
        font-size: 30px;
        text-align: center;
        width: 100%;
        opacity: 30%;
      }
      .p-menu {
        border: none;
        background: transparent;
        width: unset;
        .p-menuitem {
          .p-menuitem-content {
            padding: 0.5rem 0;
          }
          .p-menuitem-icon:before {
            color: #ffffff !important;
          }
          .p-menuitem-content,
          .p-menuitem-text,
          .p-menuitem-link {
            color: #ffffff !important;
            font-weight: var(--font-weight-600);
            font-size: 0.938rem;
          }
          .p-menuitem-link {
            //justify-content: space-between;
            //flex-direction: row-reverse;
          }
        }
      }
    }
  }
}
</style>
