<script setup>
// navigate back to home and track it
const backHome = () => {
  navigateTo('/home')
}
</script>

<template>
  <div class="shows-page">
    <section class="">
      <h1>People</h1>
      <div class="flex">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="backHome"
        />
        <h1>Home</h1>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.shows-page {
}
</style>
