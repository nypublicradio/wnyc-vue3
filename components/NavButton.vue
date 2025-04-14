<script lang="ts" setup>
import { trackClickEvent } from "~/utilities/helpers"
const props = defineProps({
  label: {
    type: String,
    default: "Get the App",
  },
  trackingLocation: {
    type: String,
    default: "Header",
  },
  severity: {
    type: String,
    default: "secondary",
  },
  variant: {
    type: String,
    default: "link",
  },
  route: {
    type: String,
  },
  size: {
    type: String,
    default: "normal",
    validator: (value: string) => ["normal", "small", "large"].includes(value),
  },
  fontWeight: {
    type: String,
    default: "400",
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  buttonClass: {
    type: String,
    default: "",
  },
})

const emit = defineEmits([
  "emit-click",
  "emit-mouseenter",
  "emit-mouseenter-key",
  "emit-mouseleave",
])
const fontWeight = ref(props.fontWeight)
const hasMenuSlot = ref(!!useSlots().menu)
const op = ref()

const handleMouseEnterKey = (event: MouseEvent) => {
  if (hasMenuSlot.value) {
    if (op?.value?.visible) {
      op?.value.hide()
    } else {
      op?.value.show(event)
    }
  }
  emit("emit-mouseenter-key", event)
}
const handleMouseEnter = (event: MouseEvent) => {
  if (hasMenuSlot.value) {
    op?.value.show(event)
  }
  emit("emit-mouseenter", event)
}

const handleMouseLeave = () => {
  if (hasMenuSlot.value) {
    op?.value.hide()
  }
  emit("emit-mouseleave")
}
</script>
<template>
  <VFlexibleLink @mouseenter="handleMouseEnter" @keydown.enter.prevent="handleMouseEnterKey"
    @mouseleave="handleMouseLeave" class="nav-button flex-none" :class="[$attrs.class]" raw :to="props.route"
    :aria-haspopup="hasMenuSlot ? 'true' : 'false'" @flexible-link-click="
      () => {
        emit('emit-click')
        trackClickEvent(
          `Click Tracking - ${props.label} Button`,
          props.trackingLocation,
          `${props.label} Button`
        )
      }
    ">
    <Button :label="props.label" :aria-label="`${props.label} button`" :size="props.size" :variant="props.variant"
      :severity="props.severity" tabindex="-1" :rounded="props.rounded" :class="props.buttonClass">
      <template #icon>
        <slot name="icon" />
        <slot name="image" />
      </template>
    </Button>
    <Popover ref="op" appendTo="self" v-if="hasMenuSlot">
      <slot name="menu" />
    </Popover>
  </VFlexibleLink>
</template>

<style scoped lang="scss">
.nav-button {
  position: relative;
}
</style>
<style lang="scss">
.nav-button {
  .p-popover {
    border: none;
    background: none;
    box-shadow: none;
    top: 26px !important;
    left: 0 !important;

    &:before,
    &:after {
      display: none;
    }

    .p-popover-content {
      padding: 0;
    }
  }

  .p-button {
    z-index: 1002;

    .p-button-label {
      pointer-events: none;
      font-weight: v-bind(fontWeight);
    }
  }

  &:focus {
    .p-button:first-child:not(.nav-p-button) {
      svg {
        color: var(--p-button-link-hover-color);
      }

      .p-button-label {
        color: var(--p-button-link-hover-color);
        text-decoration: underline;
      }
    }
  }
}
</style>
