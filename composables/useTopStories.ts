
interface Article {
  readonly id: string | number
}
// ROOT LEVEL COMPOSABLE TO FETCH TOP STORIES
export const useTopStories = () => {
  const config = useRuntimeConfig()
  const toast = useToast()
  const API_TIMEOUT = 5000
  // const options = {
  //   method: 'GET',
  //   url: `${config.public.AVIARY_BASE_API}curated_lists/4`,
  //   headers: {
  //     'X-CMS-Site': config.public.cmsSite
  //   },
  //   timeout: API_TIMEOUT,
  // }

  //const topStoriesRes = await axios(options)

  const { data: topStoriesData } = useFetchWrapper('/api/curated_lists/4')

  // const curationFetchArgs = [
  //   `${config.public.BFF_URL}/api/homepagecuration`,
  //   {
  //     key: "home-page-curation",
  //     retry: 2,
  //     retryDelay: 500,
  //   },
  // ]

  // const {
  //   data: topStoriesData,
  //   status,
  //   error,
  // } = useFetchWrapper(...topStoriesList)

  // Computed property to safely extract top_stories array
  const topStories = computed(() => {
    return topStoriesData.value || []
  })

  // Function to get filtered stories excluding a specific article
  const getFilteredTopStories = (currentArticle?: Article) => {
    const stories = topStoriesData.value || []
    if (!currentArticle) return stories

    return stories.filter((item) => item.id !== currentArticle.id)
  }

  // Watch for errors and show toast
  // watch(error, (newError) => {
  //   if (newError) {
  //     console.error("Error fetching top stories:", newError)
  //     toast.add({
  //       severity: "error",
  //       summary:
  //         "We are having a problem loading the top stories. Please try again later.",
  //       life: 6000,
  //       closable: true,
  //     })
  //   }
  // })

  return {
    topStories,
    getFilteredTopStories,
    topStoriesData,
    //error,
    //status,
    //isLoading: computed(() => status.value === 'pending'),
  }
}
