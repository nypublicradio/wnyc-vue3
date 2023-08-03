<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import { useCurrentEpisodeHolder } from '~/composables/states'
const { $analytics } = useNuxtApp()
const currentEpisodeHolder = useCurrentEpisodeHolder()
</script>

<template>
  <div class="live-player flex">
    <div class="image-holder">
      <VImage
        v-if="currentEpisodeHolder?.image"
        :src="currentEpisodeHolder?.image"
        :ratio="[1, 1]"
        alt="show poster image"
        class="image"
      />
      <WnycLoader v-else class="image-loader-anim" size="30%" />
    </div>

    <div class="content flex flex-column gap-2">
      <h2>Title</h2>
      <p class="blurb truncate t2lines">
        The Language of Symbols, How to Talk About Making a Will, Shsjdfh w80r
        sdjfs9ufhs90fs 08d f
      </p>
      <SmallPlay label="WNYC 93.9 PM" live />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-xs: useBreakpointOrFallback('xs', 375px);
.live-player {
  container-type: inline-size;
  position: relative;
  background-color: var(--background2);

  .image-holder {
    flex: none;
    .image,
    .image-loader-anim {
      width: 138px;
      height: 138px;
    }
  }
  .content {
    padding: 1rem;
  }
}
@container (max-width: #{$container-breakpoint-xs}) {
  .live-player {
    .image-holder {
      flex: none;
      .image,
      .image-loader-anim {
        width: 90px;
        height: 90px;
      }
    }
    .content {
      .blurb {
        display: none;
      }
    }
  }
}
</style>
