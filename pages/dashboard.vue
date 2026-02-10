<script setup>
useHead({
  bodyAttrs: {
    class: "no-bottom-padding",
  },
})
</script>
<template>
  <div class="dashboard-page">
    <Html lang="en">
      <Head>
        <Title>
          User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live
          Streaming Radio, News
        </Title>
        <Meta
          name="og:title"
          content="User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
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
