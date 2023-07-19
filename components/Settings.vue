<script setup>
import { trackClickEvent, getYear } from '~/utilities/helpers'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

definePageMeta({
  layout: 'blank',
})

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
//onMounted(() => {})
</script>

<template>
  <div class="settings">
    <section>
      <h1>Settings</h1>
      Should this just be a page?
      <VFlexibleLink
        raw
        to="/"
        class="my-6"
        @emit-flexible-link="
          trackClickEvent(
            'Click Tracking - sidebar WNYC Logo',
            'sidebar WNYC Logo',
            '/'
          )
        "
      >
        <WnycLogo />
      </VFlexibleLink>

      <nypr-logo class="mt-8 mb-4" />
      <p class="mb-4">
        © {{ getYear() }} New York Public Radio. All rights reserved.
      </p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings {
}
</style>
