<script setup>
const searchValue = ref('')
</script>

<template>
  <div class="browse-page">
    <section class="search">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search" />
        <i class="pi pi-spin pi-spinner" />
        <InputText
          v-model="searchValue"
          placeholder="Search"
          class="search-field w-full pr-6"
        />
        <Button class="-ml-5" icon="pi pi-times"></Button>
      </span>
    </section>
    <div v-if="!searchValue">
      <section class="topic">
        <h2>Browse By Topic</h2>
      </section>

      <section class="featured-shows">
        <h2>Featured Shows</h2>
      </section>
    </div>
    <section v-else class="results">
      <h2>Rearch Results</h2>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.browse-page {
  .search-field {
    background-color: var(--background2);
  }
}
</style>
