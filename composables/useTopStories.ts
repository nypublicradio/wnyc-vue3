interface Article {
  readonly id: string | number
}
// ROOT LEVEL COMPOSABLE TO FETCH TOP STORIES
export const useTopStories = () => {
  const config = useRuntimeConfig()
  const toast = useToast()

  const curationFetchArgs = [
    `${config.public.BFF_URL}/api/homepagecuration`,
    {
      key: "home-page-curation",
      retry: 2,
      retryDelay: 500,
    },
  ]

  const {
    data: topStoriesData,
    status,
    error,
  } = useFetchWrapper(...curationFetchArgs)

  // Computed property to safely extract top_stories array
  const topStories = computed(() => {
    //reactiveArticles.curatedContent?.[0].value.list.listItems
    return topStoriesData.value?.new_home_template.curatedContent?.[0].value.list.listItems || []
  })

  // Function to get filtered stories excluding a specific article
  const getFilteredTopStories = (currentArticle?: Article) => {
    const stories = topStoriesData.value?.new_home_template.curatedContent?.[0].value.list.listItems || []
    if (!currentArticle) return stories

    return stories.filter((item) => item.id !== currentArticle.id)
  }

  // Watch for errors and show toast
  watch(error, (newError) => {
    if (newError) {
      console.error("Error fetching top stories:", newError)
      toast.add({
        severity: "error",
        summary:
          "We are having a problem loading the top stories. Please try again later.",
        life: 6000,
        closable: true,
      })
    }
  })

  return {
    topStories,
    getFilteredTopStories,
    topStoriesData,
    error,
    status,
    isLoading: computed(() => status.value === 'pending'),
  }
}
