<script setup>
useHead({
  title:
    "User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
  bodyAttrs: {
    class: "no-bottom-padding",
  },
})
</script>
<template>
  <div class="dashboard-page">
    <div class="pt-5 thinContent">
      <Settings />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  padding-bottom: calc(
    60px + var(--persistent-player-height) + env(safe-area-inset-bottom) + 20px
  );
  background-color: var(--p-surface-25);
}
</style>
