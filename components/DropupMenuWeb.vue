<script setup>
const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  label: {
    type: String,
    default: null,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  startOpen: {
    type: Boolean,
    default: false,
  },
  checkMark: {
    type: Boolean,
    default: false,
  },
  initSelectedData: {
    type: String,
    default: null,
  },
  blockClick: {
    type: Boolean,
    default: false,
  },
  contentClass: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["change", "swipe-down"])
const popover = ref(null)

// 2way binding to the currentUserProfile on the parent prop v-model
const vModel = defineModel({ type: [String, Object, Number] })

// clicks the popover to close it
const closeMenu = () => {
  popover.value?.hide()
}

// handles the menu item click
const onMenuUpdate = async (event) => {
  vModel.value = event.id
  event.command && event.command()
  closeMenu()
  await nextTick()
  emit("change", event)
}

// handles keyboard navigation for menu items
const onKeyDown = (event, item) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault()
    onMenuUpdate(item)
  }
}

//toggles the popover
const toggleMenu = (event) => {
  popover.value?.toggle(event)
}

// toggles the popover on click wrapper
const toggleMenuClick = (event) => {
  if (props.blockClick) return
  toggleMenu(event)
}

onMounted(() => {
  if (props.startOpen) {
    popover.value?.show()
  }
  // set initial selection if data exists
  if (props.initSelectedData) {
    vModel.value = props.initSelectedData
  }
})

onUnmounted(() => {
  if (popover.value) {
    closeMenu()
  }
})

defineExpose({
  closeMenu,
  toggleMenu,
})
</script>
<template>
  <div class="dropup-panel-holder">
    <div class="ans" @click="toggleMenuClick">
      <slot name="customButton" label="">
        <div class="ans">
          {{ vModel }}
        </div>
      </slot>
    </div>
    <ClientOnly>
      <Popover ref="popover">
        <div
          class="p-menu-list"
          :class="props.contentClass"
          role="menu"
          aria-label="Menu options"
        >
          <div class="p-menu-item">
            <div
              v-for="(item, index) in options"
              :key="item.label"
              class="style-mode-dark item p-menu-item-content relative"
              @click="onMenuUpdate(item)"
              @keydown="onKeyDown($event, item)"
              tabindex="0"
              :autofocus="index === 0"
              role="menuitem"
              :aria-label="item.label"
              :class="[
                {
                  selected:
                    item.id ===
                      (typeof vModel === 'object' ? vModel.id : vModel) &&
                    props.checkMark,
                },
              ]"
            >
              <div :key="item.label" class="flex align-items-center options">
                <VImage
                  v-if="item.image"
                  :src="item.image"
                  alt="item.label"
                  class="mr-3 flex-none"
                  style="width: 40px; height: 40px"
                  :srcset="[2]"
                />
                <i v-if="item.icon" class="mr-3" :class="item.icon"></i>
                <component
                  class="mr-3 custom-icon"
                  :active="item.active ?? false"
                  v-if="item.customIcon"
                  :is="item.customIcon"
                />
                <div class="option-holder flex flex-column">
                  <div class="option pointer-events-none">{{ item.label }}</div>
                  <div
                    v-if="props.showTitle"
                    class="text-sm pointer-events-none"
                  >
                    {{ item.title }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Popover>
    </ClientOnly>
  </div>
</template>

<style lang="scss" scoped>
.dropup-panel-holder {
  .ans {
    @include font-config($type-paragraph1);
  }
}
</style>

<style lang="scss">
.p-menu-item-content {
  &.selected .options {
    &:after {
      font-family: primeicons;
      content: "\e909";
      position: relative;
      margin-left: 20px;
      width: 1rem;
      height: 1rem;
      color: var(--surface-950);
    }
  }
  .custom-icon,
  .pi {
    width: 24px !important;
    height: 24px !important;
    font-size: 24px !important;
  }
}
</style>
