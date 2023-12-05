<script setup>
const user = useCurrentUser()
const filterOptions = ref([
  { label: "All", value: null },
  { label: "Episodes", value: mediaTypes.EPISODE },
  { label: "Articles", value: mediaTypes.ARTICLE_PAGE },
  { label: "Story", value: mediaTypes.STORY },
  { label: "Segment", value: mediaTypes.SEGMENT },
  { label: "Shows", value: mediaTypes.SHOW },
])
const selectedFilterOption = ref(filterOptions.value[0])
</script>
<template>
  <section v-if="user" class="favorites">
    <Dropdown
      v-model="selectedFilterOption"
      :options="filterOptions"
      optionLabel="label"
      placeholder="Select a filter"
      class="w-full mb-3"
    />
    <saved-dynamic-list table="favorited" :typeFilter="selectedFilterOption.value">
      <div class="empty flex flex-column gap-3 text-center mt-8">
        <h2>Favorites will appear here!</h2>
        <div class="max-w-15rem m-auto">
          <p class="line-height-3">
            Use the <strong>favorite</strong> button
            <StarIcon class="w-2rem -mb-3" />
          </p>
          <p class="line-height-3">
            to save your favorite episodes, articles and more— so you can return to them
            over and over.
          </p>
        </div>
        <Button
          label="Browse Shows"
          link
          class="underline"
          size="small"
          @click="navigateTo('/browse')"
        />
      </div>
    </saved-dynamic-list>
  </section>
  <section v-else class="favorites">You must be logged in to see your favorites.</section>
</template>

<style lang="scss" scoped>
.favorites {
}
</style>
