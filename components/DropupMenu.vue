<script setup>
import { useSwipe } from "@vueuse/core"
const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  optionLabel: {
    type: String,
    default: "label",
  },
  label: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select",
  },
  width: {
    type: String,
    default: "40px",
  },
  height: {
    type: String,
    default: "40px",
  },
  startOpen: {
    type: Boolean,
    default: false,
  },
  checkMark: {
    type: Boolean,
    default: false,
  },
  blockClick: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["change", "swipe-down"])

const drawerRef = ref(null)
const panel = ref(null)
// to match the total height of the shadow that is being applied to the panel
const shadowHeight = 70

let touchstartY = 0
let touchendY = 0
let touchPrevY = 0
let touchCurrentY = 0
let touchstartTime = 0
let touchendTime = 0
const swipeThreshold = 0.5
let distanceThreshold = 125
const distanceThresholdDivider = 2.2
let isDraggingDown = false

const visibleBottom = ref(false)

// 2way binding to the currentUserProfile on the parent prop v-model
const vModel = defineModel()

// prevents the body from scrolling when the dropdown is open
function preventScrollOnTouch(event) {
  event.preventDefault()
}
// remove touch listener to the body
const removeBodyTouch = () => {
  document.body.removeEventListener("touchmove", preventScrollOnTouch, {
    passive: false,
  })
}

// clicks the dropdown again to close it
const closeMenu = () => {
  drawerRef.value.hide()
  removeBodyTouch()
}

// brings teh panel back up to the top
const reopenPanel = () => {
  panel.value.classList.add("release")
  panel.value.style.bottom = "0px"
}

// when the dropdown is opened, set the panel ref
const setPanel = async () => {
  await nextTick()
  panel.value = document.getElementById("dropup-panel")
  // removes class to the css animation so the drag will be 1:1 with the finger
  panel.value.classList.remove("release")
  document.body.addEventListener("touchmove", preventScrollOnTouch, {
    passive: false,
  })
  //sets distanceThreshold based on the height of the panel
  distanceThreshold = panel.value.offsetHeight / distanceThresholdDivider
}

// when the dropdown is closed, unset the panel ref and removes body prevent touch scroll
const unsetPanel = () => {
  panel.value = null
  removeBodyTouch()
}

// swipe setup
const swipe = useSwipe(panel, {
  passive: true,
  threshold: 1,
  onSwipeStart() {
    // removes class to the css animation so the drag will be 1:1 with the finger
    panel.value.classList.remove("release")

    touchstartY = swipe.lengthY.value
    touchstartTime = new Date().getTime()
  },
  onSwipe() {
    touchCurrentY = swipe.lengthY.value
    // so it does not drag higher than the height of the panel
    if (touchCurrentY < 0) {
      panel.value.style.bottom = `${touchCurrentY}px`
    }
    handleSwipeDirection()
    touchPrevY = touchCurrentY
  },
  onSwipeEnd() {
    touchendY = swipe.lengthY.value
    touchendTime = new Date().getTime()
    handleSwipe()
  },
})

// handles the detection of the direction of the drag movement
function handleSwipeDirection() {
  const tempBool = isDraggingDown
  if (touchCurrentY < touchPrevY) {
    isDraggingDown = true
  }
  if (touchCurrentY > touchPrevY) {
    isDraggingDown = false
  }
  //reset the touchstartY and touchstartTime if the direction changes
  if (tempBool !== isDraggingDown) {
    touchstartY = touchCurrentY
    touchstartTime = new Date().getTime()
  }
}

// handles the swipe ended logic
function handleSwipe() {
  const distance = Math.abs(touchendY - touchstartY)
  const time = touchendTime - touchstartTime
  const velocity = distance / time
  if (isDraggingDown) {
    if (velocity > swipeThreshold || distance > distanceThreshold) {
      if (touchendY < touchstartY) {
        panel.value.classList.add("release")
        // set the panel bottom to the height of the panel + the shadow height
        panel.value.style.bottom = `${(panel.value.offsetHeight + shadowHeight) * -1}px`
        // close the dropdown after the animation is done
        setTimeout(() => {
          closeMenu()
        }, 250)
        emit("swipe-down")
      }
      if (touchendY > touchstartY) {
        reopenPanel()
      }
    } else {
      reopenPanel()
    }
  } else {
    reopenPanel()
  }
}
// handles the menu item click
const onMenuUpdate = async (event) => {
  vModel.value = event.id
  event.command && event.command()
  closeMenu()
  await nextTick()
  emit("change", event)
}
//toggles the dropdown
const toggleDrawer = () => {
  visibleBottom.value = props.startOpen ? true : !visibleBottom.value
}
// toggles the dropdown on click wrapper
const toggleDrawerClick = () => {
  if (props.blockClick) return
  toggleDrawer()
}

onMounted(() => {
  if (props.startOpen) {
    toggleDrawer()
  }
})
onUnmounted(() => {
  unsetPanel()
})

defineExpose({
  closeMenu,
  toggleDrawer,
})
</script>
<template>
  <div class="dropup-panel-holder">
    <div class="ans" @click="toggleDrawerClick">
      <slot name="customButton" label="">
        <div class="ans">
          {{ vModel }}
        </div>
      </slot>
    </div>

    <Drawer
      v-model:visible="visibleBottom"
      ref="drawerRef"
      position="bottom"
      style="height: auto"
      :showCloseIcon="false"
      id="dropup-panel"
      class="dropup-panel"
      @show="setPanel"
      @hide="unsetPanel"
    >
      <template #header>
        <div class="style-mode-dark w-full">
          <div class="px-4">
            <i class="pi pi-minus drag-closer-line" @click="closeMenu" />
            <h3 v-if="props.label" class="p-submenu-header-replace">
              {{ props.label }}
            </h3>
          </div>
          <slot name="header" />
        </div>
      </template>
      <template #default>
        <div class="p-menu-list">
          <div class="p-menu-item">
            <div
              v-for="item in options"
              :key="item.label"
              class="style-mode-dark item p-menu-item-content relative"
              @click="onMenuUpdate(item)"
              :class="[
                {
                  selected:
                    item.id === (typeof vModel === 'object' ? vModel.id : vModel) &&
                    props.checkMark,
                },
              ]"
            >
              <!-- id = {{ item }}
              <br />
              Vmodel = {{ vModel }} -->
              <div :key="item.label" class="flex align-items-center station-options">
                <img
                  v-if="item.image"
                  :alt="item.label"
                  :src="item.image"
                  class="mr-3"
                  style="width: 40px; height: 40px"
                />
                <i v-if="item.icon" class="mr-3" :class="item.icon"></i>
                <component
                  class="mr-3 custom-icon"
                  :active="item.active ?? false"
                  v-if="item.customIcon"
                  :is="item.customIcon"
                />
                <div class="option pointer-events-none">{{ item.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer="slotProps">
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </template>
    </Drawer>
  </div>
</template>

<style lang="scss" scoped>
.dropup-panel-holder {
  .ans {
    @include font-config($type-paragraph1);
  }
}
.dropup-panel {
  .p-submenu-header-replace {
    background: transparent;
    color: var(--p-text-color);
    font-weight: var(--font-weight-700);
    font-size: 1.625rem;
    font-family: var(--font-family-header);
    margin-top: 20px;
    margin-bottom: 20px;
  }
}
</style>

<style lang="scss">
:root,
[data-style-mode="light"],
.style-mode-light {
  --dropupBg: var(--p-surface-700);
  --menu-item-hover: var(--p-surface-500);
}
[data-style-mode="dark"],
.style-mode-dark {
  --dropupBg: var(--p-surface-25);
  --menu-item-hover: #ffffff3d;
}
@mixin checkMark {
  &:after {
    font-family: primeicons;
    content: "\e909";
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 20px;
    width: 1rem;
    height: 1rem;
    color: #ffffff;
  }
}

.p-drawer-mask {
  .p-drawer.dropup-panel {
    max-height: 100vh;
    z-index: 10010;
    background-color: var(--dropupBg);
    border: none;
    &.release {
      transition: bottom 0.25s;
      -webkit-transition: bottom 0.25s;
    }
    -webkit-box-shadow: 0 -20px 40px 0 rgba(0, 0, 0, 0.3);
    box-shadow: 0 -20px 40px 0 rgba(0, 0, 0, 0.3);
    border-radius: 28px 28px 0px 0px;
    .p-drawer-header {
      padding: 0;
    }
    .p-drawer-content {
      padding: 0;
    }
    .p-menu {
      border: none;
      background-color: transparent;
    }
    .p-menu-list {
      padding: 0;
      overflow-y: auto;
      .p-menu-item {
        position: relative;
        .custom-icon {
          width: 24px;
          height: 24px;
          flex: none;
        }
        .p-menu-item-content {
          border-radius: 0;
          padding: 0.75rem 0.75rem 0.75rem 1.5rem;
          color: var(--p-surface-0);
          font-size: 1rem;
          font-weight: var(--font-weight-600);
          &:hover {
            background: var(--menu-item-hover);
          }
          &:focus {
            background: transparent !important;
            background-color: transparent !important;
          }
          &.selected {
            @include checkMark;
          }
        }
      }
    }
  }
}
</style>
