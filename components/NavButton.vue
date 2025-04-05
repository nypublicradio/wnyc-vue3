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
})
const emit = defineEmits(["emit-click", "emit-mouseenter", "emit-mouseleave"])

const op = ref()

const handleMouseEnter = (event: MouseEvent) => {
  op?.value.show(event)
  emit("emit-mouseenter", event)
}

const handleMouseLeave = () => {
  op?.value.hide()
  emit("emit-mouseleave")
}
</script>
<template>
  <div class="nav-button" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <VFlexibleLink
      class="relative"
      :class="[$attrs.class]"
      raw
      :to="props.route"
      @flexible-link-click="
        () => {
          emit('emit-click')
          trackClickEvent(
            `Click Tracking - ${props.label} Button`,
            props.trackingLocation,
            `${props.label} Button`
          )
        }
      "
    >
      <Button
        :label="props.label"
        :aria-label="`${props.label} button`"
        :size="props.size"
        :variant="props.variant"
        :severity="props.severity"
        tabindex="-1"
      >
        <template #icon>
          <slot name="icon" />
        </template>
      </Button>
    </VFlexibleLink>
    <Popover ref="op" appendTo="self">
      <slot name="menu" />
    </Popover>
  </div>
</template>

<style scoped lang="scss">
.nav-button {
  .p-button {
    .p-button-label {
      pointer-events: none;
    }
  }
  &.bold {
    .p-button {
      .p-button-label {
        font-weight: 700;
      }
    }
  }
}
</style>
<style lang="scss">
.nav-button {
  .p-popover {
    border: none;
    background: none;
    box-shadow: none;
    top: 0 !important;
    left: 0 !important;
    &:before,
    &:after {
      display: none;
    }
  }
}
</style>
