<script setup>
import VImage from "./VImage.vue"

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
const popover = ref(null)

// 2way binding to the currentUserProfile on the parent prop v-model
const vModel = defineModel()

// clicks the popover to close it
const closePopover = () => {
  popover.value.hide()
}

// handles the menu item click
const onMenuUpdate = async (event) => {
  vModel.value = event.id
  event.command && event.command()
  closePopover()
  await nextTick()
  emit("change", event)
}

//toggles the popover
const togglePopover = (event) => {
  popover.value.toggle(event)
}

// toggles the popover on click wrapper
const togglePopoverClick = (event) => {
  if (props.blockClick) return
  togglePopover(event)
}

onMounted(() => {
  if (props.startOpen) {
    popover.value.show()
  }
})

onUnmounted(() => {
  closePopover()
})

defineExpose({
  closePopover,
  togglePopover,
})
</script>
<template>
  <div class="dropup-panel-holder">
    <div class="ans" @click="togglePopoverClick">
      <slot name="customButton" label="">
        <div class="ans">
          {{ vModel }}
        </div>
      </slot>
    </div>

    <Popover ref="popover">
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
            <div :key="item.label" class="flex align-items-center station-options">
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
              <div class="option pointer-events-none">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </Popover>
  </div>
</template>

<style lang="scss" scoped>
.dropup-panel-holder {
  .ans {
    @include font-config($type-paragraph1);
  }
}
</style>
