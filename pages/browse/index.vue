<script setup>
import { useFuse } from "@vueuse/integrations/useFuse"
import { showTopics } from "~/composables/globals.ts"
import { goToShowPage } from "~/utilities/helpers"

const config = useRuntimeConfig()
const { data: shows, pending, error } = useLazyFetch(`${config.public.BFF_URL}/api/v2/shows`)

const router = useRouter()
const route = useRoute()
const searchFieldValue = ref("")
const isSearching = ref(false)
const activeTab = ref(route.query.tab ?? "0")

const options = computed(() => ({
  fuseOptions: {
    keys: ["title"],
    location: 0,
    threshold: 0.35,
    distance: 80,
  },
}))

const search = ref(null)

// clear the search field
const clearSearchField = () => {
  searchFieldValue.value = ""
}

// route to the show page and add query
const selectTopic = (topic) => {
  router.push({
    path: "browse/browse-topic",
    query: { topic: topic.value, label: topic.label },
  })
}

// handle the active tab for the featured and all shows to set url query
const handleActiveTab = (e) => {
  router.push({ query: { tab: e.index } })
  activeTab.value = e.index
}

watch(searchFieldValue, () => {
  // sets the scroll to the top of the page when search field is updated. a delay is needed to allow the search to complete
  setTimeout(() => {
    window.scrollTo(0, 0)
  }, 200)
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Browse Shows",
    page_type: "browse_tab",
    content_group: "app_tab",
  })
})

watch(
  shows,
  () => {
    // init the search when shoes is populated
    if (shows) {
      search.value = useFuse(searchFieldValue, shows?.value?.all, options)
    }
  },
  { once: true }
)
</script>

<template>
  <div class="browse-page">
    <Html lang="en">
      <Head>
        <Title
          >Browse Shows | WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="Browse Shows | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="Browse Shows | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
    <section class="search z-2">
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
          aria-label="clear search"
          @click="clearSearchField"
        ></Button>
        <!-- <i class="pi pi-spin pi-spinner" /> -->
      </span>
    </section>
    <div class="content-holder">
      <div v-if="!searchFieldValue">
        <div class="topics">
          <section>
            <h2>Browse By Topic</h2>
          </section>
          <HorizontalScrollFeature class="topics-holder">
            <div class="flex gap-3 w-full">
              <div v-for="topic in showTopics" class="station-holder" :key="topic.label">
                <div class="relative topic-btn-holder">
                  <Button
                    class="topic-btn text-sm white-space-nowrap font-meta"
                    :label="topic.label"
                    :aria-label="`${topic.label} topic button`"
                    @click="selectTopic(topic)"
                    :style="`background-color: ${topic.color};`"
                  />
                </div>
              </div>
            </div>
          </HorizontalScrollFeature>
        </div>
        <FetchError v-if="error" />
        <section class="tabs mt-2">
          <TabView
            :lazy="true"
            :activeIndex="Number(activeTab)"
            @tab-change="handleActiveTab"
          >
            <TabPanel header="Featured Shows">
              <div class="shows flex flex-column gap-5">
                <template v-if="!pending">
                  <ShowItem
                    v-for="show in shows?.featuredShows"
                    :data="show"
                    :key="show.title"
                    @onClick="goToShowPage(show)"
                  />
                </template>
                <skeleton-show-item
                  v-else
                  v-for="(show, index) in 27"
                  :key="`sk1-${index}`"
                />
              </div>
            </TabPanel>
            <TabPanel header="All Shows">
              <div class="shows flex flex-column gap-5">
                <template v-if="!pending">
                  <ShowItem
                    v-for="show in shows?.all"
                    :data="show"
                    :key="show.title"
                    @onClick="goToShowPage(show)"
                  />
                </template>
                <skeleton-show-item
                  v-else
                  v-for="(show, index) in 27"
                  :key="`sk2-${index}`"
                />
              </div>
            </TabPanel>
          </TabView>
        </section>
      </div>
      <div v-else>
        <section class="results">
          <!-- if results show them -->
          <div class="results-list mb-2">
            <h2>Search Results</h2>
          </div>
          <div class="shows flex flex-column gap-5">
            <ShowItem
              v-for="show in search.results"
              :data="show.item"
              :key="show.item.title"
              @onClick="goToShowPage(show.item)"
            />
          </div>
          <!-- if no results show this -->
          <div
            v-if="search.results.length === 0"
            class="text-center flex flex-column gap-4 mt-8"
          >
            <h2>No results for "{{ searchFieldValue }}"</h2>
            <NoResultsGraphic class="max-w-6rem m-auto" alt="No Results" />
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
                Try searching again using<br />
                different keywords or spelling
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.browse-page {
  .search {
    position: sticky;
    top: env(safe-area-inset-top);
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
  .topics-holder {
    .station-holder {
      &:first-child {
        @include media(">=md") {
          margin-left: calc(((100% - 768px) / 2) + 48px);
        }
      }
    }
  }
  .content-holder {
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
}
</style>
