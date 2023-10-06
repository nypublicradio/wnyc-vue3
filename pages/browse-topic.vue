<script setup>
// navigate back to home and track it
const router = useRouter()
const route = useRoute()
const backHome = () => {
  router.go(-1)
}

const topic = route.query.topic
</script>
<template>
  <div class="browse-topic-page">
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
        <h1>{{ topic }}</h1>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.browse-topic-page {
}
</style>
