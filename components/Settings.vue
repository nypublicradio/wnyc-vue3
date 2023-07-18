<script setup>
import { ref, computed, onMounted } from 'vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

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
  <div>
    <div class="settings">
      <h1>Settings</h1>
      Should this just be a page?
      <VFlexibleLink
        raw
        :to="wnycHomepage"
        class="my-6"
        @emit-flexible-link="
          trackClickEvent(
            'Click Tracking - sidebar WNYC Logo',
            'sidebar WNYC Logo',
            wnycHomepage
          )
        "
      >
        <WnycLogo />
      </VFlexibleLink>
      <VFlexibleLink
        v-for="(link, sidebarNavIndex) in headerNav"
        raw
        :key="sidebarNavIndex"
        :to="link.value.url"
        :target="link.type ? 'external_link' : undefined"
        class="c-secondary-nav__link"
        @emit-flexible-link="
          trackClickEvent(
            `Click Tracking - sidebar navigation - ${link.value.title}`,
            'sidebar navigation',
            link.value.url
          )
        "
      >
        {{ link.value.title }}
      </VFlexibleLink>
      <nypr-logo class="mt-8 mb-4" />
      <p class="mb-4">
        © {{ year }} New York Public Radio. All rights reserved.
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.settings {
}
</style>
