
interface Article {
  readonly id: string | number
}
// ROOT LEVEL COMPOSABLE TO FETCH TOP STORIES
export const useTopStories = () => {
  const config = useRuntimeConfig()
  const toast = useToast()

  let listId = '4'
  if (config.public.ENV === 'prod') {
    listId = '87'
  }

  const { data: topStoriesData, status, error } = useFetchWrapper(`/api/curated_lists/${listId}`)

  // Computed property to safely extract top_stories array
  const topStories = computed(() => {
    return topStoriesData?.value || { listItems: [] }
  })

  // Function to get filtered stories excluding a specific article
  const getFilteredTopStories = (currentArticle?: Article) => {
    const stories = topStoriesData?.value || { listItems: [] }
    if (!currentArticle) return stories

    return {
      ...stories,
      listItems: stories.listItems.filter((item: any) => item.id !== currentArticle.id)
    }
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
