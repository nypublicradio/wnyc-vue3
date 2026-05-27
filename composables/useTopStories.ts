
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

  const { data: topStoriesData, status, error } = useFetchWrapper(`${config.public.BFF_URL}/api/curated_lists/${listId}`)

  const normalizeStories = (rawStories: any) => {
    if (!rawStories || typeof rawStories !== 'object') {
      return { listItems: [] }
    }

    const listItems = Array.isArray(rawStories.listItems)
      ? rawStories.listItems
      : Array.isArray(rawStories.list_items)
        ? rawStories.list_items
        : []

    return {
      ...rawStories,
      listItems,
    }
  }

  // Computed property to safely extract top_stories array
  const topStories = computed(() => {
    return normalizeStories(topStoriesData?.value)
  })

  // Function to get filtered stories excluding a specific article
  const getFilteredTopStories = (currentArticle?: Article) => {
    const stories = normalizeStories(topStoriesData?.value)
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
