<script setup>
import { useSwipe } from '@vueuse/core'
const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  data: {
    type: [String, Object],
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(['update:data', 'swipe-down'])

const internalData = ref(props.data)
const sDropDownRef = ref(null)

// clicks the dropdown again to close it
const closeMenu = () => {
  sDropDownRef.value.click()
}

const panel = ref(null)
// to match the total height of the shadow that is being applied to the panel
const shadowHeight = 70

// when the dropdown is opened, set the panel ref
const setPanel = async () => {
  await nextTick()
  panel.value = document.getElementById('p-dropup-panel')
}

// when the dropdown is closed, unset the panel ref
const unsetPanel = async () => {
  panel.value = null
}

// swipe setup
const swipe = useSwipe(panel, {
  passive: true,
  onSwipeStart() {
    // removes class to the css animation so the drag will be 1:1 with the finger
    panel.value.classList.remove('release')
  },
  onSwipe() {
    const length = swipe.lengthY.value
    // so it does not drag hight than the height of the panel
    if (length < 0) {
      panel.value.style.bottom = `${length}px`
    }
  },
  onSwipeEnd() {
    if (swipe.direction.value === 'down' && swipe.lengthY.value < -100) {
      // adds the release class to enable the css animation
      panel.value.classList.add('release')
      // set the panel bottom to the height of the panel + the shadow height
      panel.value.style.bottom =
        (panel.value.offsetHeight + shadowHeight) * -1 + 'px'
      // close the dropdown after the animation is done
      setTimeout(() => {
        closeMenu()
      }, 250)
      emit('swipe-down')
    } else {
      // adds the release class to enable the css animation and bring it back to the top smoothly
      panel.value.classList.add('release')
      panel.value.style.bottom = `0px`
    }
  },
})
</script>
<template>
  <Dropdown
    v-if="options.length > 0"
    v-model="internalData"
    :options="options"
    :optionLabel="props.optionLabel"
    placeholder="Select a station"
    class="s-dropup"
    @update:modelValue="$emit('update:data', $event)"
    @show="setPanel"
    @hide="unsetPanel"
    panelClass="p-dropup-panel"
    :panelProps="{ id: 'p-dropup-panel' }"
  >
    <template #value="slotProps">
      <div
        ref="sDropDownRef"
        v-if="slotProps.value[props.optionLabel]"
        class="flex align-items-center justify-content-end"
      >
        <div class="ans">{{ slotProps.value[props.optionLabel] }}</div>
      </div>
      <span v-else>
        <!-- placeholder -->
        <div class="ans">{{ data }}</div>
      </span>
    </template>
    <template #header>
      <i class="pi pi-minus" @click="closeMenu" />
      <h3 v-if="props.label" class="p-submenu-header-replace">
        {{ props.label }}
      </h3>
    </template>
    <template #option="slotProps">
      <div
        :key="slotProps.option.label"
        class="flex align-items-center station-options"
      >
        <!-- <img
          v-if="slotProps.option.image"
          :alt="slotProps.option.label"
          :src="slotProps.option.image"
          class="mr-2"
          style="width: 18px; height: 18px"
        /> -->
        <div class="option">{{ slotProps.option[props.optionLabel] }}</div>
      </div>
    </template>
  </Dropdown>
</template>

<style lang="scss" scoped>
.s-dropup {
  width: 80%;
  height: 42px;
  margin-right: -1rem;
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
  &:hover {
    background: var(--background3);
  }
}
</style>
<style lang="scss">
.s-dropup {
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
}
.p-dropup-panel {
  &.release {
    transition: bottom 0.25s;
    -webkit-transition: bottom 0.25s;
  }
  position: absolute;
  top: unset !important;
  bottom: 0;
  left: 0;
  width: 100%;
  transform-origin: center bottom !important;
  border-radius: 28px 28px 0px 0px;
  -webkit-box-shadow: 0 -20px 50px 0 rgba(0, 0, 0, 0.6);
  box-shadow: 0 -20px 50px 0 rgba(0, 0, 0, 0.6);
  background: var(--background4) !important;
  .pi-minus {
    color: #ffffff;
    font-size: 30px;
    text-align: center;
    width: 100%;
    opacity: 30%;
  }
  .p-submenu-header-replace {
    background: transparent;
    color: #ffffff !important;
    font-weight: var(--font-weight-700);
    font-size: 1.625rem;
    font-family: var(--font-family-header);
    margin-top: 20px;
    margin-bottom: 20px;
    padding-left: 1.25rem;
  }
  .p-dropdown-items-wrapper {
    max-height: unset !important;
    padding: 5px 0px calc($bottomMenuHeight + $playerHeight) 0px;
    .p-dropdown-item {
      color: #ffffff !important;
      font-weight: var(--font-weight-600);
      font-size: 0.938rem;
      padding: 0.5rem 20px;
      background: unset !important;
      &:hover {
        background: #ffffff3d !important;
      }
      &.p-highlight {
        background: unset !important;
        &:after {
          font-family: primeicons;
          content: '\e909';
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
      .station-options {
        margin: 10px 0;
        img {
          width: 40px !important;
          height: 40px !important;
        }
        .option {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
