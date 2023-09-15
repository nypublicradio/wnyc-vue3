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

const emit = defineEmits(['update:data'])

const internalData = ref(props.data)

const sDropDownRef = ref(null)
const hackRef = ref(null)
const headerRef = ref(null)
const closeMenu = () => {
  sDropDownRef.value.click()
}
const swipe1 = useSwipe(headerRef, {
  onSwipe() {
    console.log('swiping', swipe1.direction.value)
    if (swipe1.direction.value === 'down' && swipe1.lengthY.value < -5) {
      closeMenu()
      //emit('swipe-down')
    }
  },
  passive: true,
})
const swipe2 = useSwipe(hackRef, {
  onSwipe() {
    console.log('swiping', swipe2.direction.value)
    if (swipe2.direction.value === 'down' && swipe2.lengthY.value < -5) {
      closeMenu()
      //emit('swipe-down')
    }
  },
  passive: true,
})
</script>
<template>
  <Dropdown
    v-if="options.length > 0"
    v-model="internalData"
    :options="options"
    :optionLabel="props.optionLabel"
    placeholder="Select a station"
    class="s-dropdown"
    @update:modelValue="$emit('update:data', $event)"
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
      <div ref="headerRef">
        <i class="pi pi-minus" @click="closeMenu" />
        <h3 v-if="props.label" class="p-submenu-header-replace">
          {{ props.label }}
        </h3>
      </div>
      <div ref="hackRef" class="hackRef"></div>
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
.s-dropdown {
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
.s-dropdown {
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
.p-dropdown-panel {
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
  .hackRef {
    width: 100%;
    height: 900px;
    position: absolute;
    top: 40px;
    left: 0;
    background: transparent;
    //z-index: 111;
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
