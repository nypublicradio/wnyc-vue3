<script setup>
import { useFallbackImages } from "~/composables/useFallbackImages"
//import { useAppDownloadLink } from "~/composables/states"
import { mediaTypeRoutes } from "~/composables/globals"

const props = defineProps({
  show: {
    type: Object,
    default: null,
  },
})

const { show } = toRefs(props)

//const appDownloadLink = useAppDownloadLink()
const { getEpisodeFallBackImage } = useFallbackImages()

// Use computed properties to maintain reactivity
const showImage = computed(
  () =>
    show.value?.image ||
    show.value?.showArt ||
    show.value?.linkedDataSource?.value?.imageUrl
)
const showTitle = computed(() => show.value?.title)

const showSlug = computed(() => show.value?.meta?.slug || show.value?.slug)

const aboutContent = computed(() => {
  const showData = show.value
  if (!showData) return []
  if (showData.aboutModule && showData.aboutModule.length > 0)
    return showData.aboutModule
  // if (showData.description) return [{ id: "desc", value: showData.description }]
  // if (showData.tease) return [{ id: "tease", value: showData.tease }]
  return []
})

// handle click on show title or image to navigate to show page
const handleShowClick = () => {
  if (showSlug.value) {
    navigateTo(`${mediaTypeRoutes.show}${showSlug.value}`)
  }
}
</script>
<template>
  <div v-if="show" class="flex flex-column gap-3">
    <div @click="handleShowClick" class="flex gap-3 cursor-pointer">
      <VImage
        :src="showImage"
        :srcFallback="getEpisodeFallBackImage()"
        :alt="`${showTitle} show image`"
        :size="[80, 80]"
        :srcset="[2]"
        class="w-5rem flex-none"
      ></VImage>
      <h2 class="mt-1">{{ showTitle }}</h2>
    </div>
    <VStreamfield
      :streamfieldBlocks="aboutContent"
      :article="
        aboutContent.length > 0
          ? null
          : { body: show?.tease || show?.description }
      "
    />
    <story-htlAd
      layout="rectangle"
      slotClass="htlad-wnyc_homepage_rectangle"
      fineprint="WNYC is funded by sponsors and member donations"
    />
  </div>
  <div v-else class="flex flex-column gap-4">
    <ClientOnly>
      <!-- Image and Title skeleton -->
      <div class="flex gap-3 align-items-start">
        <Skeleton size="80px" borderRadius="0px" />
        <div class="flex align-items-center flex-1">
          <Skeleton
            class="mt-2"
            height="1rem"
            width="60%"
            borderRadius="16px"
          />
        </div>
      </div>

      <!-- Description skeleton -->
      <div class="flex flex-column gap-2">
        <Skeleton height="1rem" width="100%" borderRadius="16px" />
        <Skeleton height="1rem" width="95%" borderRadius="16px" />
        <Skeleton height="1rem" width="80%" borderRadius="16px" />
      </div>

      <!-- Listen via paragraph skeleton -->
      <div class="flex flex-column gap-1">
        <Skeleton height="1rem" width="100%" borderRadius="16px" />
        <Skeleton height="1rem" width="70%" borderRadius="16px" />
      </div>

      <!-- Social buttons skeleton -->
      <div class="flex gap-2 align-items-center">
        <Skeleton height="1rem" width="120px" borderRadius="16px" />
        <Skeleton height="2rem" width="2rem" shape="circle" />
        <Skeleton height="2rem" width="2rem" shape="circle" />
        <Skeleton height="2rem" width="2rem" shape="circle" />
        <Skeleton height="2rem" width="2rem" shape="circle" />
      </div>

      <!-- Ad skeleton -->
      <Skeleton height="250px" width="300px" borderRadius="8px" />
    </ClientOnly>
  </div>
</template>
