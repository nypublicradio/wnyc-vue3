<script setup>
const props = defineProps({
  msg: {
    type: String,
    default: "An error occured while loading this page.",
  },
  refreshRoute: {
    type: String,
    default: "/home",
  },
})

const emit = defineEmits(["on-click"])

// hard refresh to the home page
const handleReloadHome = () => {
  window.location.href = props.refreshRoute
}
</script>

<template>
  <div class="fetch-error text-center py-4">
    <p>{{ props.msg }}</p>
    <div class="mt-3 flex gap-3 justify-content-center">
      <Button
        label="Try again"
        severity="secondary"
        aria-label="try again button"
        @click="emit('on-click')"
      />
      <Button
        label="Refresh"
        severity="secondary"
        aria-label="refresh button"
        @click="handleReloadHome"
      />
    </div>
  </div>
</template>
