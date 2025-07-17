<script setup>
const route = useRoute()
const showSlug = computed(() => route.params.slug || "")
</script>
<template>
  <section>
    <h1>EPISODES PAGE: {{ showSlug }}</h1>
  </section>
</template>
