<script setup>
import VPerson from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VPerson.vue"
import { getUserFallBackImage } from "~/utilities/helpers"
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
})

//const tags = ref(props.article.tags)
const isSponsored = ref(props.article?.sponsoredContent ?? false)
const isDisableComments = ref(props.article?.disableComments ?? false)
const profileData = isSponsored.value ? props.article?.sponsors : props.article?.authors

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
    <hr class="black mb-4" />
    <div class="grid grid-nogutter">
      <div class="profile-col col-12">
        <!-- <pre>{{ profileData }}</pre> -->
        <section>
          <VPerson
            v-for="profile in profileData"
            :key="profile.id"
            :profileData="profile"
            :imageSize="60"
            imageFlexBasis="60px"
            class="mb-4 text-sm gap-4"
            :imageFallbackPath="!profile.photoID ? getUserFallBackImage() : null"
            :onStaffPage="!profile.url"
            :truncate="5"
          />
        </section>
        <hr class="black mb-6" />
        <div class="mx-auto mb-6" style="width: 300px">
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
          <section v-if="props.article.cmsSource === cmsSources.WAGTAIL">
            <story-comments-section :article="props.article" />
          </section>
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
