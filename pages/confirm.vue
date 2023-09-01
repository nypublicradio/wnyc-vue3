<script setup lang="ts">
const user = useSupabaseUser()
alert('CONFIRM PAGE REACHED')
watch(
  user,
  () => {
    if (user.value) {
      return navigateTo('/home')
    }
  },
  { immediate: true }
)
</script>
<template>
  <div>Waiting for login...</div>
</template>
