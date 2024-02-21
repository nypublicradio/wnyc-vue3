<script setup>
const props = defineProps({
  msg: {
    type: String,
    default: "An error occured while loading this page.",
  },
})

const emit = defineEmits(["on-click"])
</script>

<template>
  <div class="fetch-error text-center py-4">
    <p>{{ props.msg }}</p>
    <Button
      class="mt-2"
      label="Try again"
      severity="secondary"
      @click="emit('on-click')"
    />
  </div>
</template>

<style lang="scss" scoped>
.fetch-error {
}
</style>
