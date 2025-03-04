<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import { cmsSources } from "~/composables/globals"
const props = defineProps({
  article: {
    type: Object,
    default: null,
  },
})

const streamfield = props.article.body

onMounted(() => {
  // you can't have script tags in v-html
  // so we need to load the twitter embeds script manually
  if (window.twttr) {
    // the script is already loaded, so just reload the embeds
    window.twttr.widgets.load()
  } else if (!document.getElementById("twttr-widgets")) {
    const embed = document.createElement("script")
    embed.id = "twttr-widgets"
    embed.src = "https://platform.twitter.com/widgets.js"
    document.body.appendChild(embed)
  }
})
</script>

<template>
  <div class="streamfield">
    <section
      v-if="
        props.article.cmsSource === cmsSources.PUBLISHER ||
        props.article.cmsSource === cmsSources.NPR
      "
    >
      <HtmlConvert :htmlContent="props.article.body" />
    </section>
    <!-- <pre>{{ props.article }}</pre> -->
    <div v-else v-for="(block, index) in streamfield" :key="`block-${index}`">
      <!-- image -->
      <section v-if="block.type === 'image'" class="streamfield-image mt-4 mx-auto">
        <!--     :width="block.value.image.width"
          :height="block.value.image.height" -->
        <VImage
          :src="String(block.value.image.id)"
          :ratio="[block.value.image.width ?? 3, block.value.image.height ?? 2]"
          :alt="block.value.image.alt"
          :maxWidth="block.value.image.width"
          :maxHeight="block.value.image.height"
          sizes="xs:390px md:768px"
          density="x1 x2"
        >
          <!--           <template #caption>
            <VImageCaption
              v-if="block.value.image.caption"
              :text="block.value.image.caption"
            />
          </template> -->
          <template #belowImage>
            <div>
              <p class="text-sm mt-1">
                {{ block.value.image.caption }}
              </p>
              <p class="text-xs mt-2">
                {{ block.value.image.credit }}
              </p>
            </div>
          </template>
        </VImage>
      </section>

      <section v-else>
        <!-- paragraph -->
        <HtmlConvert
          :htmlContent="block.value"
          v-if="block.type === 'paragraph'"
          class="streamfield-paragraph"
        />
        <!-- image -->

        <!-- block-quote -->
        <div v-else-if="block.type === 'block_quote'" class="streamfield-block-quote">
          <blockquote>
            <HtmlConvert :htmlContent="block.value.blockQuote" />
          </blockquote>
        </div>

        <!-- code -->
        <HtmlConvert
          v-else-if="block.type === 'code'"
          class="streamfield-code"
          :htmlContent="block.value.code"
        />

        <!-- embed -->
        <HtmlConvert
          v-else-if="block.type === 'embed'"
          class="streamfield-embed"
          :htmlContent="block.value.embed"
        />

        <!-- heading -->

        <HtmlConvert
          v-else-if="block.type === 'heading'"
          class="streamfield-heading"
          :htmlContent="block.value"
          :aria-label="block.value"
        />

        <!-- pull-quote -->
        <streamfield-pull-quote
          v-else-if="block.type === 'pull_quote'"
          :quote="block.value.pullQuote"
          :author="block.value.attribution"
        />
      </section>
      <!-- 1/2 way through the streamfield, insert the donation block -->
      <streamfield-donation
        v-if="index === Math.floor(streamfield.length / 2)"
        @onClick="
          trackClickEvent(
            `story page id ${props.article.id}`,
            'donate banner',
            'donate button'
          )
        "
      />
    </div>
  </div>
</template>

<style lang="scss">
.streamfield .streamfield-paragraph > * {
  @include html-formatting();
  margin-bottom: 1rem;
  &:last-child {
    margin-bottom: 0;
  }
}

.streamfield .streamfield-block-quote {
  // left border matches prime vue Divider styles
  border-left: 1px solid rgba(234, 234, 234, 1);
  padding-left: 1rem;
}
</style>
