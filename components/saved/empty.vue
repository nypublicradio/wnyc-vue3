
<script lang="ts" setup>
const props = defineProps({
  icon: {
    type: String,
    default: "FollowIcon",
  },
  linkText: {
    type: String,
    default: "Browse Shows",
  },
  linkRoute: {
    type: String,
    default: "/browse",
  },
})

// dynamically load the icon based on the props.icon
const icon = computed(() => {
  return defineAsyncComponent(
    () => import(`~/components/icons/${props.icon}.vue`)
  )
})
</script>

<template>
  <div class="empty flex gap-4 align-items-start p-4 md:p-5">
    <component :is="icon" class="w-3rem md:w-4rem h-3rem md:h-4rem flex-none" />
    <div>
      <p class="md:text-lg">
        <!-- Use the <strong>follow</strong> button to follow your favorite shows
        —the latest episodes will appear here. -->
        <slot />
      </p>
      <Button
        :label="props.linkText"
        :aria-label="props.linkText"
        variant="link"
        severity="secondary"
        class="-ml-2 mt-3 md:text-lg link"
        size="small"
        @click="navigateTo(props.linkRoute)"
      />
    </div>
  </div>
</template>

<style>
.empty {
  background: #ffffff;
  border-radius: var(--p-border-radius-xl);
}
</style>