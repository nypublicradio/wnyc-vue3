<script setup>
const searchFieldValue = ref('')
const isSearching = ref(false)
const currentTopic = ref('')
const topics = ref([
  {
    label: 'Arts & Culture',
    value: 'arts-and-culture',
    color: 'var(--red)',
  },
  {
    label: 'Tech & Media',
    value: 'tech-and-media',
    color: 'var(--info)',
  },
  {
    label: 'Local News',
    value: 'local-news',
    color: 'var(--purple)',
  },
  {
    label: 'Storytelling',
    value: 'storytelling',
    color: 'var(--success)',
  },
])

const clearSearchField = () => {
  searchFieldValue.value = ''
}

const selectTopic = (topic) => {
  if (currentTopic.value === topic.label) {
    currentTopic.value = ''
  } else {
    currentTopic.value = topic.label
  }
}
</script>

<template>
  <div class="browse-page">
    <section class="search">
      <span class="p-input-icon-left w-full">
        <i v-if="isSearching" class="pi pi-spin pi-spinner" />
        <i v-else class="pi pi-search" />
        <InputText
          v-model="searchFieldValue"
          placeholder="Search"
          class="search-field w-full pr-6"
        />
        <Button
          v-if="searchFieldValue"
          class="closer"
          rounded
          text
          plain
          icon="pi pi-times"
          @click="clearSearchField"
        ></Button>
        <!-- <i class="pi pi-spin pi-spinner" /> -->
      </span>
    </section>
    <div v-if="!searchFieldValue">
      <div class="topics">
        <section class="pb-0">
          <h2>Browse By Topic</h2>
        </section>
        <HorizontalScrollFeature class="topics-holder">
          <div class="flex">
            <div
              v-for="topic in topics"
              class="station-holder"
              :class="{
                activetopic: currentTopic === topic.label,
              }"
              :key="topic.label"
            >
              <div class="relative">
                <Button
                  class="topic-btn text-sm white-space-nowrap"
                  :label="topic.label"
                  @click="selectTopic(topic)"
                  :style="`background-color: ${topic.color};`"
                >
                </Button>
              </div>
            </div>
          </div>
        </HorizontalScrollFeature>
      </div>
      <section v-if="currentTopic" class="topic-results">
        <h2>{{ currentTopic }} Results</h2>
      </section>
      <section class="featured-shows">
        <h2>Featured Shows</h2>
      </section>
    </div>
    <div v-else>
      <section class="results">
        <h2>Rearch Results</h2>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.browse-page {
  .search-field {
    background-color: var(--background2);
  }
  .closer {
    position: absolute;
    top: 50%;
    margin-top: -1.25rem;
    margin-left: -2.5rem;
  }
  .topics {
    .topic-btn {
      border: 1px solid transparent !important;
      &:hover,
      &:focus,
      &:active {
        border: 1px solid transparent !important;
      }
      margin-left: 1rem;
      &:first-child {
        margin-left: 1.25rem;
      }
    }
  }
}
</style>

<style lang="scss">
.browse-page {
  .topics {
    .horizontal-scroll-feature .scroll {
      padding-left: 0 !important;
    }
  }
}
</style>
