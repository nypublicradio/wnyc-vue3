<script setup>
import { useFuse } from "@vueuse/integrations/useFuse"
import { useShowTopics } from "~/composables/globals.ts"

const config = useRuntimeConfig()
const { data: shows } = useFetch(`${config.public.BFF_URL}/api/shows`)
const featuredShows = ref(shows?.value?.featuredShows ?? null)
const allShows = ref(shows?.value?.all ?? null)

const showTopics = useShowTopics()
const router = useRouter()
const searchFieldValue = ref("")
const isSearching = ref(false)

const keys = computed(() => {
  return ["title"]
})

const options = computed(() => ({
  fuseOptions: {
    keys: keys.value,
    location: 0,
    threshold: 0.35,
    distance: 80,
  },
}))

const { results } = useFuse(searchFieldValue, allShows, options)

const clearSearchField = () => {
  searchFieldValue.value = ""
}

const selectTopic = (topic) => {
  router.push({
    name: "browse-topic",
    query: { topic: topic.label },
  })
}

// const getAlgoliaSuggestion = computed(() => {
//   return 'Blah blah'
// })

const goToShowPage = (show) => {
  navigateTo({
    path: `browse/shows/${show.slug}`,
  })
}

watch(shows, () => {
  allShows.value = shows.value.all
  featuredShows.value = shows.value.featuredShows
})

watch(searchFieldValue, () => {
  // sets the scroll to the top of the page when search field is updated. This is needed because if the use scrolls down and searches, they do not see the top of the list if it is long.
  document.body.scrollIntoView({
    behavior: "instant",
    block: "start",
  })
})
</script>

<template>
  <div class="browse-page">
    <section class="search">
      <span class="p-input-icon-left w-full">
        <i v-if="isSearching" class="pi pi-spin pi-spinner text-color" />
        <i v-else class="pi pi-search text-color" />
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
          <div class="flex gap-3">
            <div v-for="topic in showTopics" class="station-holder" :key="topic.label">
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

      <div class="tabs mt-3">
        <TabView>
          <TabPanel header="Featured Shows">
            <section class="shows flex flex-column gap-3">
              <BrowseItem
                v-if="featuredShows"
                v-for="show in featuredShows"
                :data="show"
                :key="show.title"
                @onClick="goToShowPage(show)"
              />
              <skeleton-browse-item
                v-else
                v-for="(show, index) in 27"
                :key="`sk1-${index}`"
              />
            </section>
          </TabPanel>
          <TabPanel header="All Shows">
            <section class="shows flex flex-column gap-3">
              <BrowseItem
                v-if="allShows"
                v-for="show in allShows"
                :data="show"
                :key="show.title"
                @onClick="goToShowPage(show)"
              />
              <skeleton-browse-item
                v-else
                v-for="(show, index) in 27"
                :key="`sk2-${index}`"
              />
            </section>
          </TabPanel>
        </TabView>
      </div>
    </div>
    <div v-else>
      <section class="results">
        <!-- if results show them -->
        <div class="results-list mb-2">
          <h2>Rearch Results</h2>
        </div>
        <div class="shows flex flex-column gap-3">
          <BrowseItem
            v-for="show in results"
            :data="show.item"
            :key="show.item.title"
            @onClick="goToShowPage(show.item)"
          />
        </div>
        <!-- if no results show this -->
        <div v-if="results.length === 0" class="text-center flex flex-column gap-4 mt-8">
          <h2>No results for {{ searchFieldValue }}</h2>
          <img src="/noResults.svg" class="max-w-6rem m-auto" alt="No Results" />
          <div>
            <!-- <p class="mb-2">
              Did you mean:
              <Button
                link
                text
                class="p-0 text-sm"
                :label="getAlgoliaSuggestion"
                @click="searchFieldValue = getAlgoliaSuggestion"
              />
            </p> -->
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
  .search {
    position: sticky;
    top: 0;
    background: var(--backgroundSimple);
    z-index: 1;
    .search-field {
      background-color: var(--searchFieldBackground);
    }
  }
  .closer {
    position: absolute;
    top: 50%;
    margin-top: -1.25rem;
    margin-left: -2.5rem;
  }
  .topics {
    .topic-btn-holder {
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
