<script setup>
import { cmsSources } from "~/composables/globals"
import { ref } from "vue"

const props = defineProps({
  article: {
    type: Object,
    default: null,
  },
  isDisableComments: {
    type: Boolean,
    default: false,
  },
  showAd: {
    type: Boolean,
    default: true,
  },
  showNprTranscriptDisclaimer: {
    type: Boolean,
    default: false,
  },
})

//const tags = ref(props.article.tags)
const isSponsored = ref(props.article?.sponsoredContent ?? false)
const isDisableComments = ref(props.article?.disableComments ?? false)
const profileData = computed(() =>
  isSponsored.value ? props.article?.sponsors : props.article?.authors
)
const { getUserFallBackImage } = useFallbackImages()

// function attached to the emit of the article-tags when clicked
// const onTagClick = (tag) => {
//   if (tag) {
//     trackClickEvent(`story page id ${article.id}`, 'Article Tags', tag.name)
//   }
// }
</script>

<template>
  <div class="article-footer">
    <!-- <pre>{{ props.article }}</pre> -->
    <!-- tags -->
    <!-- <story-article-tags
      v-if="tags.length"
      :tags="tags"
      @tag-click="onTagClick"
    /> -->
    <!-- profile & comments-->
    <div class="grid grid-nogutter">
      <div class="profile-col col-12">
        <!-- <pre>{{ profileData }}</pre> -->
        <div v-if="profileData?.length">
          <hr class="black mb-4 mt-0" />
          <p
            v-if="props.showNprTranscriptDisclaimer"
            class="npr-transcript-disclaimer text-sm mb-4"
          >
            Transcripts of NPR audio are available on NPR.org
          </p>
          <div>
            <VPerson
              v-for="profile in profileData"
              :key="profile.id"
              :profileData="profile"
              :imageSize="66"
              imageFlexBasis="66px"
              class="mb-4 text-sm gap-4"
              :imageFallbackPath="!profile.photoID ? getUserFallBackImage() : null"
              :onStaffPage="!profile.url"
              :truncate="5"
            />
          </div>
          <hr class="black mb-6" />
        </div>
        <p
          v-else-if="props.showNprTranscriptDisclaimer"
          class="npr-transcript-disclaimer text-sm mb-6"
        >
          Transcripts of NPR audio are available on NPR.org
        </p>
        <div
          v-if="props.showAd"
          class="mx-auto mb-6"
          style="max-width: 300px; width: 100%"
        >
          <story-htlAd
            layout="rectangle"
            slotClass="htlad-wnyc_article_rectangle"
            fineprint="WNYC is funded by sponsors and member donations"
          />
        </div>
        <div
          v-if="!isDisableComments && !props.isDisableComments"
          id="comments"
          class="mb-4"
        >
          <hr class="black mb-4" />
          <div v-if="props.article.cmsSource === cmsSources.WAGTAIL">
            <story-comments-section :article="props.article" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.article-footer {
  .profile-col {
    flex-grow: 1;
    flex-basis: 0;
    @include media("<lg") {
      flex: 0 0 auto;
      width: 100%;
    }
  }
}
</style>
