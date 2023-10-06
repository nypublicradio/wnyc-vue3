<script setup>
const router = useRouter()
const searchFieldValue = ref('')
const isSearching = ref(false)
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

const tempResults = [
  {
    id: '1',
    isLive: true,
    image:
      'https://media.wnyc.org/i/%s/%s/%s/%s/2023/01/52650126647_4bf5e103e0_o.jpg',
    title: 'The Brian Leher Show',
    slug: 'The-brian-leher-show',
    org: 'WNYC',
  },
  {
    id: '2',
    isLive: false,
    image: 'https://media.wnyc.org/i/%s/%s/%s/%s/2020/06/AllOfIt.png',
    title: 'All Of It',
    slug: 'all-of-it',
    org: 'WNYC',
  },
  {
    id: '3',
    isLive: false,
    image: 'https://media.wnyc.org/i/%s/%s/%s/%s/2019/07/NYPR.DSM_1400.jpg',
    title: 'Death, Sex & Money',
    slug: 'death-sex-and-money',
    org: 'WNYC',
  },
  {
    id: '4',
    isLive: true,
    image: 'https://media.wnyc.org/i/%s/%s/%s/%s/2023/04/bbc-newshour-tile.jpg',
    title: 'BBC Newshour',
    slug: 'bbc-newshour',
    org: 'BBC',
  },
  {
    id: '5',
    isLive: false,
    image: '304978',
    title: 'Article Title Here',
    slug: 'article-title-here',
    org: 'Gothamist',
  },
]

const clearSearchField = () => {
  searchFieldValue.value = ''
}

const selectTopic = (topic) => {
  router.push({
    name: 'browse-topic',
    query: { topic: topic.label },
  })
}

const getAlgoliaSuggestion = computed(() => {
  return 'Blah blah'
})

const goToShowPage = (show) => {
  navigateTo(`shows/${show.slug}`)
}

const viewAllShows = () => {
  navigateTo('browse-all')
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
        <section>
          <h2>Browse By Topic</h2>
        </section>
        <HorizontalScrollFeature class="topics-holder">
          <div class="flex">
            <div
              v-for="topic in topics"
              class="station-holder"
              :key="topic.label"
            >
              <div class="relative topic-btn-holder">
                <Button
                  class="topic-btn text-sm white-space-nowrap font-meta"
                  :label="topic.label"
                  @click="selectTopic(topic)"
                  :style="`background-color: ${topic.color};`"
                />
              </div>
            </div>
          </div>
        </HorizontalScrollFeature>
      </div>
      <section class="featured-shows">
        <div class="flex justify-content-between mb-3">
          <h2>Featured Shows</h2>
          <Button
            link
            label="View All Shows"
            @click="viewAllShows"
            class="p-0 m-0 underline"
            size="small"
          />
        </div>
        <div class="shows flex flex-column gap-3">
          <BrowseItem
            v-for="show in tempResults"
            :show="show"
            :key="show.title"
            @onClick="goToShowPage(show)"
          />
        </div>
      </section>
    </div>
    <div v-else>
      <section class="results">
        <!-- if results show them -->
        <div class="results-list">
          <h2>Rearch Results</h2>
        </div>
        <!-- if no results show this -->
        <div class="text-center flex flex-column gap-4 mt-8">
          <h2>No results for {{ searchFieldValue }}</h2>
          <img
            src="/noResults.svg"
            class="max-w-6rem m-auto"
            alt="No Results"
          />
          <div>
            <p class="mb-2">
              Did you mean:
              <Button
                link
                text
                class="p-0 text-sm"
                :label="getAlgoliaSuggestion"
                @click="searchFieldValue = getAlgoliaSuggestion"
              />
            </p>
            <p>
              Or... try searching again using<br />
              different keywords or spelling
            </p>
          </div>
        </div>
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
    .topic-btn-holder {
      margin-left: 1rem;
      &:first-child {
        margin-left: 1.25rem;
      }
      .topic-btn {
        border: 1px solid transparent !important;
        &:hover,
        &:focus,
        &:active {
          border: 1px solid transparent !important;
        }
      }

      .arrow {
        transition: bottom 0.5s;
        -webkit-transition: bottom 0.5s;
        position: absolute;
        bottom: 0px;
        right: 0;
        left: 0;
        margin: auto;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid var(--red);
        z-index: -1;
      }
      &.activetopicholder {
        .arrow {
          bottom: -10px;
        }
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
