<script setup>
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
import { useSettingSideBar } from "~/composables/states.ts"
const props = defineProps({
  label: {
    type: String,
    default: "",
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
  clickable: {
    type: Boolean,
    default: false,
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
  <div class="s-box" :class="[{ 'is-link': props.link, clickable: props.clickable }]">
    <div class="content flex justify-content-between align-items-center">
      <VFlexibleLink @click="onClick" v-if="link" raw :to="link" class="w-full">
        <Button
          :label="label"
          class="w-full text-left"
          text
          aria-label="menu item"
        />
      </VFlexibleLink>
      <div v-else class="flex h-full align-items-center" @click="emit('label-click')">
        <p class="label white-space-nowrap">
          {{ label }}
        </p>
      </div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.s-box {
  background-color: var(--s-box-background-color);
  width: 100%;
  height: 50px;
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
}
</style>
