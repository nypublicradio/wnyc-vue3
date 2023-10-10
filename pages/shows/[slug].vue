<script setup>
// navigate back to home and track it
const route = useRoute()
const router = useRouter()
const backHome = () => {
  router.go(-1)
}

console.log('route', route)
</script>

<template>
  <div class="shows-page">
    <section class="">
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
        <h1>Show page : {{ route.fullPath }}</h1>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.shows-page {
}
</style>
