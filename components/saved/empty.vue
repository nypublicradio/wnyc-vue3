
<script lang="ts" setup>
import FollowIcon from "~/components/icons/FollowIcon.vue"
import StarIcon from "~/components/icons/StarIcon.vue"
import Headphones from "~/components/icons/Headphones.vue"

const iconComponentMap = {
  FollowIcon,
  StarIcon,
  Headphones,
}

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

const icon = computed(() => iconComponentMap[props.icon])
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