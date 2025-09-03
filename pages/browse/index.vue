<script setup>
import { useFuse } from "@vueuse/integrations/useFuse"
import { showTopics } from "~/composables/globals.ts"
import { goToShowPage } from "~/utilities/helpers"
import { useBreakpoints } from "~/composables/useBreakpoints"

const config = useRuntimeConfig()
const { data: shows, status, error } = useLazyFetch(
  `${config.public.BFF_URL}/api/v2/shows`
)

const router = useRouter()
const searchFieldValue = ref("")
const isSearching = ref(false)
const allOrFeatured = ref(true)

const { breakpoint } = useBreakpoints()
const isMobile = computed(() => breakpoint("<md"))

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

// handle the click on the "All Topics" button
const handleAllTopics = () => {
  // not sure what we are doing here yet.
}

// handle the toggle of all or featured shows
const toggleAllShows = () => {
  allOrFeatured.value = !allOrFeatured.value
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
      <h1 class="mb-3 md:mb-4">Browse All Shows</h1>
      <IconField>
        <InputIcon v-if="isSearching" class="pi pi-spin pi-spinner text-color" />
        <InputIcon v-else class="pi pi-search text-color" />
        <InputText
          v-model="searchFieldValue"
          placeholder="Search"
          class="w-full on-white"
        />
        <InputIcon v-if="searchFieldValue" class="relative">
          <Button
            rounded
            text
            plain
            icon="pi pi-times text-color"
            aria-label="clear search"
            class="absolute right-0 top-0 bottom-0 m-auto"
            @click="clearSearchField"
          ></Button>
        </InputIcon>
      </IconField>
    </section>
    <div class="content-holder md:mt-3">
      <div v-if="!searchFieldValue">
        <div class="topics">
          <section class="topics-header flex justify-content-between align-items-center">
            <h2>Browse By Topic</h2>
            <Button
              severity="secondary"
              variant="link"
              class="link -mr-2"
              @click="handleAllTopics"
              label="All Topics"
            ></Button>
          </section>
          <HorizontalScrollFeature v-if="isMobile" class="topics-holder" :data="shows">
            <div class="flex w-full">
              <div
                v-for="topic in showTopics"
                class="station-holder item"
                :key="topic.label"
              >
                <div class="relative topic-btn-holder">
                  <Button
                    class="topic-btn text-sm white-space-nowrap btn"
                    :label="topic.label"
                    :aria-label="`${topic.label} topic button`"
                    @click="selectTopic(topic)"
                    :style="`background-color: ${topic.color};`"
                  />
                </div>
              </div>
            </div>
          </HorizontalScrollFeature>
          <section v-else>
            <div class="grid">
              <div
                v-for="topic in showTopics.slice(0, -1)"
                class="station-holder desktop item col-4"
                :key="topic.label"
              >
                <div class="relative topic-btn-holder">
                  <Button
                    class="topic-btn text-sm md:text-base"
                    :label="topic.label"
                    :aria-label="`${topic.label} topic button`"
                    @click="selectTopic(topic)"
                    :style="`background-image: url(${topic.image});`"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
        <FetchError v-if="error" />

        <section class="tabs mt-2">
          <div class="flex justify-content-between align-items-center mb-4">
            <h2>{{ allOrFeatured ? "Featured" : "All" }} Shows</h2>
            <div class="-mr-2">
              <Button
                v-if="allOrFeatured"
                severity="secondary"
                variant="link"
                class="link"
                @click="toggleAllShows"
                label="All Shows"
              ></Button>
              <Button
                v-else
                severity="secondary"
                variant="link"
                class="link"
                @click="toggleAllShows"
                label="Featured Shows"
              ></Button>
            </div>
          </div>

          <div class="shows grid">
            <template v-if="status === 'success'">
              <ShowItem
                v-for="show in allOrFeatured ? shows?.featuredShows : shows?.all"
                :data="show"
                :key="show.title"
                class="col-12 md:col-4 md:mb-5"
                rootClass="md:align-items-start"
                contentClass="md:flex-column gap-3 md:gap-2"
                imageClass="w-7rem md:w-13rem"
                :size="{ xs: [112, 112], md: [208, 208] }"
                :hideButtons="!isMobile"
                @onClick="goToShowPage(show)"
              />
            </template>

            <skeleton-show-item
              v-else
              v-for="(show, index) in 27"
              :key="`sk1-${index}`"
              class="col-12 md:col-4 md:mb-5"
              contentClass="md:flex-column gap-3 md:gap-2"
              imageClass="w-7rem md:w-13rem h-7rem md:h-13rem"
              :hideButtons="!isMobile"
            />
          </div>
        </section>
      </div>
      <div v-else>
        <section class="results">
          <!-- if results show them -->
          <div class="results-list mb-2">
            <h2>Search Results</h2>
          </div>
          <div class="shows grid">
            <ShowItem
              v-for="show in search.results"
              :data="show.item"
              :key="show.item.title"
              class="col-12 md:col-4 md:mb-5"
              rootClass="md:align-items-start"
              contentClass="md:flex-column gap-3 md:gap-2"
              imageClass="w-7rem md:w-13rem"
              :size="{ xs: [112, 112], md: [208, 208] }"
              :hideButtons="!isMobile"
              @onClick="goToShowPage(show.item)"
            />
          </div>
          <!-- if no results show this -->
          <div
            v-if="search.results.length === 0"
            class="text-center flex flex-column gap-4 my-6"
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
  max-width: $thinContentWidth;
  margin: auto;
  .search {
    position: sticky;
    top: env(safe-area-inset-top);
    background: var(--background2);
    z-index: 1;
  }
  .content-holder {
    .topics {
      .station-holder {
        &:last-child:not(.desktop) {
          padding-right: 5rem !important;
        }
        &.desktop {
          .topic-btn {
            width: 100%;
            height: 130px;
            border-radius: 16px;
            background-size: cover;
            background-position: center;
          }
        }
      }
      .topic-btn-holder {
        .topic-btn {
          font-family: var(--font-family-header);
          border: 1px solid transparent !important;
          &:hover,
          &:focus,
          &:active {
            opacity: 0.8;
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
          border-top: 10px solid var(--p-red-500);
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
