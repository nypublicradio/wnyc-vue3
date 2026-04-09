<script setup>
import { useFuse } from "@vueuse/integrations/useFuse"
//import { showTopics } from "~/composables/globals.ts"
import { goToShowPage } from "~/utilities/helpers"
import { useBreakpoints } from "~/composables/useBreakpoints"
import { useIsApp } from "~/composables/states"
const config = useRuntimeConfig()
const isApp = useIsApp()
const route = useRoute()
const {
  data: shows,
  status,
  error,
} = await useFetch(`${config.public.BFF_URL}/api/v3/shows`)

const router = useRouter()
const searchFieldValue = ref("")
const isSearching = ref(false)
const allOrFeatured = computed(() => route.query.all !== "true")
const { isMobileBreakpoint } = useBreakpoints()

// computed property to get the current shows based on allOrFeatured
const currentShows = computed(() => {
  if (!shows.value) return []
  return allOrFeatured.value ? shows.value.featuredShows : shows.value.all
})

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
// const selectTopic = (topic) => {
//   router.push({
//     path: "browse/browse-topic",
//     query: { topic: topic.value, label: topic.label },
//   })
// }

// handle the click on the "All Topics" button
// const handleAllTopics = () => {
//   // not sure what we are doing here yet.
// }

// handle the toggle of all or featured shows
const toggleAllShows = () => {
  router.replace({
    query: {
      ...route.query,
      all: allOrFeatured.value ? "true" : "false",
    },
  })
}

watch(searchFieldValue, () => {
  if (!import.meta.client) return
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

const title = "Browse Shows | WNYC"
useHead({
  title,
})
useSeoMeta({
  title,
  ogTitle: title,
})
</script>

<template>
  <div class="browse-page">
    <div class="search z-2" :class="{ 'is-app': isApp }">
      <section class="thinContent">
        <h1 class="hidden md:block mb-3 md:mb-4">Browse All Shows</h1>
        <IconField>
          <InputIcon v-if="isSearching" class="pi pi-spin pi-spinner z-2" />
          <InputIcon v-else class="pi pi-search z-2" />
          <InputText
            v-model="searchFieldValue"
            placeholder="Search"
            class="search w-full on-white"
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
    </div>
    <!-- <pre>{{ shows }}</pre> -->
    <div class="content-holder md:mt-3">
      <div v-if="!searchFieldValue">
        <!-- <div class="topics">
          <section
            class="topics-header flex justify-content-between align-items-center"
          >
            <h2>Browse By Topic</h2>
          </section>
          <HorizontalScrollFeature
            v-if="isMobileBreakpoint"
            class="topics-holder"
            :data="shows"
          >
            <div
              v-for="topic in showTopics"
              class="station-holder item"
              :key="topic.label"
            >
              <div class="relative topic-btn-holder btn-holder">
                <Button
                  class="topic-btn text-sm white-space-nowrap btn"
                  :label="topic.label"
                  :aria-label="`${topic.label} topic button`"
                  @click="selectTopic(topic)"
                  :style="`background-color: ${topic.color};`"
                />
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
                    class="topic-btn text-lg"
                    :label="topic.label"
                    :aria-label="`${topic.label} topic button`"
                    @click="selectTopic(topic)"
                    :style="`background-image: url(${topic.image});`"
                  />
                </div>
              </div>
            </div>
          </section>
        </div> -->
        <FetchError v-if="error" />

        <section class="tabs mt-2">
          <div
            class="flex md:justify-content-between align-items-center mb-4 gap-3"
          >
            <Transition name="fade" mode="out-in">
              <h2 :key="allOrFeatured ? 'featured' : 'all'">
                {{ allOrFeatured ? "Featured" : "All" }} Shows
              </h2>
            </Transition>
            <div class="-mr-2">
              <Transition name="fade" mode="out-in">
                <Button
                  v-if="allOrFeatured"
                  severity="secondary"
                  variant="link"
                  class="link"
                  @click="toggleAllShows"
                  label="All Shows"
                  :size="isMobileBreakpoint ? 'small' : 'base'"
                ></Button>
                <Button
                  v-else
                  severity="secondary"
                  variant="link"
                  class="link"
                  @click="toggleAllShows"
                  label="Featured Shows"
                  :size="isMobileBreakpoint ? 'small' : 'base'"
                ></Button>
              </Transition>
            </div>
          </div>
          <!-- <pre>{{ currentShows }}</pre> -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="status === 'success'"
              :key="`shows-${allOrFeatured}`"
              class="shows grid"
            >
              <ShowItem
                v-for="show in currentShows"
                :data="show"
                :key="show.title"
                class="col-12 md:col-4 md:mb-5"
                rootClass="md:align-items-start"
                contentClass="md:flex-column gap-3 md:gap-2"
                imageClass="w-6rem xs:w-7rem md:w-13rem"
                :size="{ xxs: [96, 96], xs: [112, 112], md: [208, 208] }"
                :hideButtons="!isMobileBreakpoint"
                @onClick="goToShowPage(show)"
              />
            </div>
            <div v-else key="loading" class="shows grid">
              <skeleton-show-item
                v-for="(show, index) in 27"
                :key="`sk1-${index}`"
                class="col-12 md:col-4 md:mb-5"
                contentClass="md:flex-column gap-3 md:gap-2"
                imageClass="w-7rem md:w-13rem h-7rem md:h-13rem"
                :hideButtons="!isMobileBreakpoint"
              />
            </div>
          </Transition>
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
              imageClass="w-6rem xs:w-7rem md:w-13rem"
              :size="{ xxs: [96, 96], xs: [112, 112], md: [208, 208] }"
              :hideButtons="!isMobileBreakpoint"
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
  .search {
    position: sticky;
    top: calc(env(safe-area-inset-top) + $headerHeight);
    background: var(--header-background);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    z-index: 1;
    &.is-app {
      top: env(safe-area-inset-top);
    }
  }
  .content-holder {
    max-width: $thinContentWidth;
    margin: auto;
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
            transition: transform var(--p-transition-duration),
              opacity var(--p-transition-duration);
            -webkit-transition: transform var(--p-transition-duration),
              opacity var(--p-transition-duration);
            &:hover {
              transform: scale(1.05);
            }
            .p-button-label {
              margin-top: -2rem;
            }
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
.browse-page {
  .content-holder {
    .topics {
      .station-holder {
        &.desktop {
          .topic-btn {
            .p-button-label {
              margin-top: -2rem;
            }
          }
        }
      }
    }
    .shows {
      .browse-item {
        &:hover {
          .v-image-wrapper {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .v-image-wrapper {
          transition: transform var(--p-transition-duration),
            opacity var(--p-transition-duration);
          -webkit-transition: transform var(--p-transition-duration),
            opacity var(--p-transition-duration);
        }
      }
    }
  }
}
</style>
