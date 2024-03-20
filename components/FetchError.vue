<script setup>
const props = defineProps({
  msg: {
    type: String,
    default: "An error occured while loading this page.",
  },
  refershRoute: {
    type: String,
    default: "/home",
  },
})

const emit = defineEmits(["on-click"])

const handleReloadHome = () => {
  window.location.href = props.refershRoute
}
</script>

<template>
  <div class="fetch-error text-center py-4">
    <p>{{ props.msg }}</p>
    <div class="mt-3 flex gap-3 justify-content-center">
      <Button label="Try again" severity="secondary" @click="emit('on-click')" />
      <Button label="Refresh" severity="secondary" @click="handleReloadHome" />
    </div>
  </div>
</template>
