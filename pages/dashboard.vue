<script setup lang="ts"></script>
<template>
  <div class="dashboard-page">
    <Html lang="en">
      <Head>
        <Title>
          User Account Dashboard | WNYC | New York Public Radio, Podcasts, Live Streaming
          Radio, News
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
    <div class="py-5 thinContent">
      <Settings />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.dashboard-page {
  padding-bottom: 200px;
  background-color: var(--p-surface-25);
}
</style>
