<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'

const props = defineProps({
  streamfield: {
    type: Array,
    default: null,
    required: true,
  },
})

onMounted(() => {
  // you can't have script tags in v-html
  // so we need to load the twitter embeds script manually
  if (window.twttr) {
    // the script is already loaded, so just reload the embeds
    window.twttr.widgets.load()
  } else if (!document.getElementById('twttr-widgets')) {
    const embed = document.createElement('script')
    embed.id = 'twttr-widgets'
    embed.src = 'https://platform.twitter.com/widgets.js'
    document.body.appendChild(embed)
  }
})
</script>

<template>
  <div class="streamfield">
    <div v-for="(block, index) in streamfield" :key="index">
      <!-- 1/2 way through the streamfield, insert the donation block -->
      <streamfield-donation
        v-if="index === Math.floor(streamfield.length / 2)"
      />
      <section v-else>
        <!-- block-quote -->
        <div
          v-if="block.type === 'block_quote'"
          class="streamfield-block-quote"
        >
          <blockquote>
            <p v-html="block.value.block_quote" />
          </blockquote>
        </div>

        <!-- code -->
        <p
          v-else-if="block.type === 'code'"
          class="streamfield-code"
          v-html="block.value.code"
        />

        <!-- embed -->
        <div
          v-else-if="block.type === 'embed'"
          class="streamfield-embed"
          v-html="block.value.embed"
        />

        <!-- heading -->
        <h2
          v-else-if="block.type === 'heading'"
          class="streamfield-heading"
          v-html="block.value"
          :aria-label="block.value"
        />

        <!-- image -->
        <div v-else-if="block.type === 'image'" class="streamfield-image">
          <VImage
            :src="block.value.image.file"
            :ratio="[1, 1]"
            :alt="block.value.image.alt"
          />
        </div>

        <!-- paragraph -->
        <p
          v-else-if="block.type === 'paragraph'"
          class="streamfield-paragraph"
          v-html="block.value"
        />

        <!-- pull-quote -->
        <streamfield-pull-quote
          v-else-if="block.type === 'pull_quote'"
          :quote="block.value.pull_quote"
          :author="block.value.attribution"
        />
      </section>
    </div>
  </div>
</template>

<style lang="scss">
.streamfield .streamfield-paragraph > * {
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
