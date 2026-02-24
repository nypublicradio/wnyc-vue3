<script setup>
import { useFallbackImages } from "~/composables/useFallbackImages"
import { useAppDownloadLink } from "~/composables/states"

const props = defineProps({
  show: {
    type: Object,
    default: null,
  },
})

const { show } = toRefs(props)

const appDownloadLink = useAppDownloadLink()
const { getEpisodeFallBackImage } = useFallbackImages()

// Use computed properties to maintain reactivity
const showImage = computed(
  () => show.value?.show?.showArt || show.value?.show?.image
)
const showTitle = computed(
  () => show.value?.show?.topperDisplayTitle || show.value?.show?.title
)

const showSlug = computed(() => show.value?.show?.slug)

const aboutContent = computed(() => {
  const s = show.value?.show
  if (!s) return []
  if (s.aboutModule && s.aboutModule.length > 0) return s.aboutModule
  if (s.description) return [{ id: "desc", value: s.description }]
  if (s.tease) return [{ id: "tease", value: s.tease }]
  return []
})

// TEMP until we have real show social data
const showSocialData = [
  {
    label: "Instagram",
    url: "https://www.instagram.com/onthemedia/",
    id: "3",
    icon: "pi pi-instagram",
  },
  {
    label: "X",
    url: "https://x.com/onthemedia",
    id: "1",
    icon: "pi pi-twitter",
  },
  {
    label: "BlueSky",
    url: "https://bsky.app/profile/onthemedia.bsky.social",
    id: "0",
    icon: "ci-bluesky w-1rem h-1rem absolute top-0 right-0 left-0 bottom-0 m-auto",
  },
  {
    label: "Reddit",
    url: "https://www.reddit.com/r/onthemedia/",
    id: "2",
    icon: "pi pi-reddit",
  },
]

const handleShowClick = () => {
  if (showSlug.value) {
    navigateTo(`/browse/shows/${showSlug.value}`)
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
    <HtmlConvert
      v-for="about in aboutContent"
      :key="about?.id"
      :htmlContent="about?.value"
      :tagClassMap="{
        div: 'text-sm line-height-3',
        p: 'text-sm line-height-3',
        span: 'text-sm line-height-3',
        li: 'text-sm line-height-3',
        a: 'text-sm line-height-3',
      }"
    />
    <SocialButtons :data="showSocialData" />
    <story-htlAd
      layout="rectangle"
      slotClass="htlad-wnyc_homepage_rectangle"
      fineprint="WNYC is funded by sponsors and member donations"
    />
  </div>
  <div v-else class="flex flex-column gap-4">
    <!-- Image and Title skeleton -->
    <div class="flex gap-3 align-items-start">
      <Skeleton size="80px" borderRadius="0px" />
      <div class="flex align-items-center flex-1">
        <Skeleton class="mt-2" height="1rem" width="60%" borderRadius="16px" />
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
  </div>
</template>
