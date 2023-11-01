<script setup lang="ts">
//import { GalleryPage } from "~/composables/types/Page";
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'
import { trackClickEvent } from '~/utilities/helpers'
import { normalizeGalleryPage } from '~/composables/data/galleryPages'
const route = useRoute()
//const router = useRouter()

const gallery = await usePageById(route.params.gallerySlug).then(({ data }) =>
  normalizeGalleryPage(data.value)
)

const shareUrl = ref(gallery.url)
const shareTitle = ref(gallery.title)
</script>
<template>
  <div class="gallery-page">
    <section class="header flex align-items-center justify-content-between">
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="
            navigateTo(`/story/${route.query.article}?src=${route.query.src}`)
          "
          label="Return"
        />
      </div>
      <div class="mr-2">
        <v-share-tools>
          <v-share-tools-item
            action="share"
            service="facebook"
            :url="shareUrl"
            :utm-parameters="{
              medium: 'social',
              source: 'facebook',
              campaign: 'shared_facebook',
            }"
            @share="
              trackClickEvent(
                'Click Tracking',
                'Article Gallery Page',
                'Social Share Facebook'
              )
            "
          />
          <v-share-tools-item
            action="share"
            service="twitter"
            :url="shareUrl"
            :share-parameters="{ text: shareTitle, via: 'gothamist' }"
            :utm-parameters="{
              medium: 'social',
              source: 'twitter',
              campaign: 'shared_twitter',
            }"
            @share="
              trackClickEvent(
                'Click Tracking',
                'Article Gallery Page',
                'Social Share Twitter'
              )
            "
          />
          <v-share-tools-item
            action="share"
            service="reddit"
            :url="shareUrl"
            :share-parameters="{ title: shareTitle }"
            :utm-parameters="{
              medium: 'social',
              source: 'reddit',
              campaign: 'shared_reddit',
            }"
            @share="
              trackClickEvent(
                'Click Tracking',
                'Article Gallery Page',
                'Social Share Reddit'
              )
            "
          />
          <v-share-tools-item
            action="share"
            service="email"
            :url="shareUrl"
            :share-parameters="{ body: shareTitle + ' - %URL%' }"
            :utm-parameters="{
              medium: 'social',
              source: 'email',
              campaign: 'shared_email',
            }"
            @share="
              trackClickEvent(
                'Click Tracking',
                'Article Gallery Page',
                'Social Share Email'
              )
            "
          />
        </v-share-tools>
      </div>
    </section>
    <section class="pt-0 -mt-2">
      <!-- <pre class="text-xs">{{ gallery.slides[0] }}</pre> -->
      <div v-if="gallery?.slides" class="grid mt-0">
        <VImage
          v-for="(img, index) in gallery.slides"
          :key="img.image.id"
          :src="String(img.image.id)"
          :ratio="[img.image.width, img.image.height]"
          sizes="xs:390px md:768px lg:1024px xl:1920px"
          density="x1 x2"
          :max-width="Number(img.image.width)"
          :max-height="Number(img.image.height)"
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

<style lang="scss" scoped>
.gallery-page {
  .header {
    background-color: var(--backgroundSimple);
    position: sticky;
    top: 0;
    z-index: 1;
  }
}
</style>
<style lang="scss">
.v-image {
  .p-progress-spinner {
    width: 390px;
    height: 390px;
    z-index: 999993453453453999 !important;
  }
  .enlarge-button-holder {
    @include media('<md') {
      display: none !important;
    }
  }
}
</style>
