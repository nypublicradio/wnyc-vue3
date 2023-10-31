<script setup lang="ts">
//import { GalleryPage } from "~/composables/types/Page";
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
//import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
//import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'
import { normalizeGalleryPage } from '~/composables/data/galleryPages'
const route = useRoute()
const router = useRouter()

const gallery = await usePageById(route.params.gallerySlug).then(({ data }) =>
  normalizeGalleryPage(data.value)
)

// console.dir(gallery)
// const gallery = await findPage(`/story/photos/${route.params.gallerySlug}`)
//   .then(({ data }) => normalizeFindPageResponse(data))
//   .catch(() => {
//     throw createError({
//       statusCode: 404,
//       statusMessage: "Page Not Found",
//       fatal: true,
//     });
//   });

// if (gallery.slides.length <= 0 && gallery.articleLink) {
//   navigateTo(gallery.articleLink, { replace: true, redirectCode: 301 });
// }
</script>
<template>
  <div class="gallery-page">
    <section class="">
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="router.go(-1)"
          label="Back to article"
        />
      </div>
      <div v-if="gallery?.slides" class="grid mt-0">
        <VImage
          v-for="(img, index) in gallery.slides"
          :key="img.image.title"
          :src="String(img.image.id)"
          :ratio="[3, 2]"
          sizes="xs:390px md:768px lg:1024px xl:1920px"
          density="x1 x2"
          :alt="img.image.alt"
          class="story-page-image col-12 md:col-6 xl:col-4"
          allowPreview
        >
          <template #belowImage>
            <div>
              <p class="mt-1">
                {{ img.image.caption }}
              </p>
              <p class="mt-1 mb-5 text-xs opacity-80">
                {{ img.image.credit }}
              </p>
            </div>
          </template>
        </VImage>
      </div>
    </section>
  </div>
</template>
