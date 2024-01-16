<script setup>
const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const { data: categoryData } = useFetch(
  `${config.public.BFF_URL}/api/browse/browse-topic/getTopicData`
)

// navigate back to home and track it
const backHome = () => {
  router.go(-1)
}
const topic = route.query.topic

const goToShowPage = (show) => {
  navigateTo({
    path: `shows/${show.slug}`,
  })
}

onUnmounted(() => {
  categoryData.value = null
})
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
    <section class="shows flex flex-column gap-3">
      <template v-if="categoryData">
        <ShowItem
          v-for="show in categoryData"
          :data="show"
          :key="show.title"
          @onClick="goToShowPage(show)"
        />
      </template>
      <skeleton-show-item v-else v-for="(show, index) in 27" :key="`sk1-${index}`" />
    </section>
  </div>
</template>

<style lang="scss">
.browse-topic-page {
}
</style>
