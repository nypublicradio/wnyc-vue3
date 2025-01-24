<script setup>
import { useSettingSideBar } from "~/composables/states.ts"
const props = defineProps({
  label: {
    type: String,
    default: "",
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  link: {
    type: String,
    default: null,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  isLink: {
    type: Boolean,
    default: false,
  },
  ripple: {
    type: Boolean,
    default: true,
  },
})

const settingSideBar = useSettingSideBar()
const emit = defineEmits(["link-click", "label-click"])

// handles when the button is clicked. emits and closes the side panel
const onClick = () => {
  emit("link-click", props.link)
  if (settingSideBar.value) {
    settingSideBar.value = false
  }
}
</script>

<template>
  <div
    class="s-box relative overflow-hidden"
    :class="[{ 'is-link': props.link || props.isLink, clickable: props.clickable }]"
  >
    <div
      class="content flex justify-content-between align-items-center"
      v-ripple
      :class="[{ killRipple: !props.ripple }]"
    >
      <VFlexibleLink @click="onClick" v-if="link" raw :to="link" class="w-full py-1">
        <Button
          :label="label"
          class="w-full text-left line-height-3"
          text
          aria-label="menu item"
        />
      </VFlexibleLink>
      <VFlexibleLink v-else-if="isLink" raw class="w-full py-1">
        <Button
          :label="label"
          class="w-full text-left line-height-3"
          text
          aria-label="menu item"
        />
      </VFlexibleLink>
      <template v-else>
        <div
          class="label-holder flex flex-column gap-1 h-full w-auto py-3 justify-items-center cursor-pointer"
          @click="emit('label-click')"
        >
          <p class="label">
            {{ label }}
          </p>
          <p v-if="description" class="description">
            {{ description }}
          </p>
        </div>
      </template>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.s-box {
  background-color: var(--s-box-background-color);
  width: 100%;
  min-height: 50px;
  padding: 0 1.25rem;
  border: 1px solid var(--shade-400);
  border-left: none;
  border-right: none;
  margin-top: -1px;
  &.clickable {
    cursor: pointer;
  }
  &.is-link {
    padding: 0;
    .flexible-link {
      .p-button {
        padding-left: 1.25rem;
        padding-right: 1.25rem;
        color: var(--night);
        font-weight: var(--font-weight-500);
        &:hover {
          background: var(--background3);
        }
      }
    }
  }
  .content {
    width: 100%;
    height: 100%;
    font-size: 0.8125rem;
  }
  .label {
    font-size: 1rem;
    margin-right: 15px;
  }
  .description {
    font-size: 0.75rem;
    line-height: normal;
    opacity: 0.7;
    margin-right: 15px;
  }
}
</style>
<style lang="scss">
.s-box {
  .content {
    &.killRipple {
      .p-ink,
      .p-ink-active {
        display: none !important;
      }
      .label-holder {
        cursor: default !important;
      }
    }
  }
}
</style>
