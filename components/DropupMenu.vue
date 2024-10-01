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
  data: {
    type: [String, Object],
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select",
  },
  customButton: {
    type: Boolean,
    default: false,
  },
  width: {
    type: String,
    default: "42px",
  },
  height: {
    type: String,
    default: "42px",
  },
  normal: {
    type: Boolean,
    default: false,
  },
  startOpen: {
    type: Boolean,
    default: false,
  },
  checkMark: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(["update:data", "swipe-down"])

const dataRef = ref(props.data)

const dropdownRootRef = ref(null)
const sDropDownRef = ref(null)
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
  sDropDownRef.value.click()
  sDropDownRef.value.blur()
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
  panel.value = document.getElementById("p-dropup-panel")
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
  onSwipeStart() {
    // removes class to the css animation so the drag will be 1:1 with the finger
    panel.value.classList.remove("release")

    touchstartY = swipe.lengthY.value
    touchstartTime = new Date().getTime()
  },
  onSwipe() {
    touchCurrentY = swipe.lengthY.value
    // so it does not drag hight than the height of the panel
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

// handles the detection of the direction of the drag movment
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

onMounted(() => {
  if (props.startOpen) dropdownRootRef.value.show()
})
onUnmounted(() => {
  unsetPanel()
})
</script>
<template>
  <Dropdown
    ref="dropdownRootRef"
    v-model="dataRef"
    :options="props.options"
    :optionLabel="props.optionLabel"
    :placeholder="props.placeholder"
    class="s-dropup"
    :class="[{ customButton: props.customButton, normal: props.normal }]"
    @update:modelValue="$emit('update:data', $event)"
    @show="setPanel"
    @hide="unsetPanel"
    :panelClass="`p-dropup-panel ${props.customButton ? 'is-customButton' : ''} ${
      !props.checkMark ? 'hideCheckMark' : ''
    }`"
    :panelProps="{ id: 'p-dropup-panel' }"
    @click.prevent
  >
    <template #value="slotProps">
      <div ref="sDropDownRef" class="ans">
        <slot name="customButton" label="">
          <!-- populate from LocalStorage -->
          <div
            v-if="slotProps.value[props.optionLabel] && !props.customButton"
            class="flex align-items-center justify-content-end"
          >
            <div class="ans">
              {{ slotProps.value[props.optionLabel] }}
            </div>
          </div>
          <span v-else>
            <!-- populate from Supabase -->
            <div class="ans">
              {{ data }}
            </div>
          </span>
        </slot>
      </div>
    </template>
    <template #header>
      <div class="style-mode-dark">
        <div class="px-4">
          <i class="pi pi-minus closer-line" @click="closeMenu" />
          <h3 v-if="props.label" class="p-submenu-header-replace">
            {{ props.label }}
          </h3>
        </div>
        <slot name="header" />
      </div>
    </template>
    <template #option="slotProps">
      <!--  <pre>{{ slotProps.option }}</pre> -->
      <div class="style-mode-dark">
        <div
          :key="slotProps.option[props.optionLabel]"
          class="flex align-items-center station-options"
          :class="[{ selected: slotProps.option[props.optionLabel] === dataRef }]"
        >
          <img
            v-if="slotProps.option.image"
            :alt="slotProps.option.label"
            :src="slotProps.option.image"
            class="mr-3"
            style="width: 18px; height: 18px"
          />
          <i v-if="slotProps.option.icon" class="mr-3" :class="slotProps.option.icon"></i>
          <component
            class="mr-3 custom-icon"
            :active="slotProps.option.active ?? false"
            v-if="slotProps.option.customIcon"
            :is="slotProps.option.customIcon"
          />
          <div class="option">{{ slotProps.option[props.optionLabel] }}</div>
        </div>
      </div>
    </template>
    <template #footer="slotProps">
      <div class="footer">
        <slot name="footer"></slot>
      </div>
    </template>
  </Dropdown>
</template>

<style lang="scss" scoped>
.s-dropup:not(.normal) {
  width: v-bind(width);
  height: v-bind(height);
  background: transparent;
  border: none;
  text-align: right;
  &.p-focus {
    outline: none;
    box-shadow: none;
  }
  .p-dropdown-trigger {
    display: none !important;
  }
  //&:hover {
  //background: var(--background3);
  //}
}
</style>
<style lang="scss">
@mixin checkMark {
  &:after {
    font-family: primeicons;
    content: "\e909";
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 20px;
    width: 1rem;
    height: 1rem;
  }
}
.s-dropup:not(.normal) {
  .p-dropdown-trigger {
    display: none !important;
  }
  .p-dropdown-label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .ans {
    @include font-config($type-paragraph1);
  }
  &.customButton .p-dropdown-label {
    justify-content: center;
  }
}
.p-dropup-panel {
  // move the panel above the bottom-menu
  z-index: 10010;
  &.release {
    transition: bottom 0.25s;
    -webkit-transition: bottom 0.25s;
  }
  &.is-customButton {
    .p-highlight:after {
      display: none !important;
    }
  }
  position: fixed !important;
  display: block !important;
  top: unset !important;
  bottom: 0;
  left: 0;
  width: 100%;
  transform-origin: center bottom !important;
  border-radius: 28px 28px 0px 0px;
  -webkit-box-shadow: 0 -20px 40px 0 rgba(0, 0, 0, 0.3);
  box-shadow: 0 -20px 40px 0 rgba(0, 0, 0, 0.3);
  background: var(--background4) !important;
  .pi-minus.closer-line {
    color: #ffffff;
    font-size: 30px;
    text-align: center;
    width: 100%;
    opacity: 30%;
  }
  .p-submenu-header-replace {
    background: transparent;
    color: var(--text-color);
    font-weight: var(--font-weight-700);
    font-size: 1.625rem;
    font-family: var(--font-family-header);
    margin-top: 20px;
    margin-bottom: 20px;
  }
  .p-dropdown-items-wrapper {
    max-height: unset !important;
    padding: 5px 0px 0px 0px;
    .p-dropdown-item {
      color: #ffffff !important;
      font-weight: var(--font-weight-600);
      font-size: 0.938rem;
      padding: 0.75rem 20px;
      background: unset !important;
      &:hover {
        background: #ffffff3d !important;
      }
      &.p-highlight {
        background: unset !important;
        @include checkMark;
      }
      .station-options {
        //margin: 10px 0;
        word-wrap: break-word;
        width: 100%;
        img {
          width: 40px !important;
          height: 40px !important;
        }
        .option {
          font-size: 16px;
          white-space: wrap;
        }
        &.selected {
          @include checkMark;
        }
      }
      .custom-icon {
        width: 2rem;
        height: 2rem;
        flex: none;
      }
    }
  }
  .footer {
    //padding: 0px 20px calc($bottomMenuHeight + $playerHeight) 20px;
    padding: 0px 20px calc($bottomMenuHeight + 20px) 20px;
  }
  &.hideCheckMark {
    .p-highlight:after {
      display: none !important;
    }
    .station-options .selected:after {
      display: none !important;
    }
  }
}
</style>
