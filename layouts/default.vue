<script setup>
import { updateLiveStream } from '~/composables/data/liveStream'
import { useCurrentSteamStation } from '~/composables/states'
const route = useRoute()
const currentSteamStation = useCurrentSteamStation()
onBeforeMount(() => {
  updateLiveStream(currentSteamStation.value)
})
</script>

<template>
  <div :class="[`${route.name}`]">
    <Html lang="en">
      <Head>
        <Link rel="canonical" :href="`https://wnyc.org${route.path}`" />
        <Title>
          WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News
        </Title>
        <Meta
          name="description"
          content="WNYC is America's most listened-to public radio station and the producer of award-winning programs and podcasts like Radiolab, On the Media, and The Brian Lehrer Show."
        />
        <Meta
          name="keywords"
          content="wnyc, podcasts, npr, new york, WNYC Studios, arts, culture, classical, music, news, public, radio"
        />
        <Meta
          name="og:site_name"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta name="og:type" content="website" />
        <Meta
          name="og:url"
          :content="`https://www.wnyc.org${route.fullPath}`"
        />
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="og:description"
          content="WNYC is America's most listened-to public radio station and the producer of award-winning programs and podcasts like Radiolab, On the Media, and The Brian Lehrer Show."
        />
        <Meta
          name="og:image"
          content="https://media.wnyc.org/i/1200/1200/c/80/1/wnyc_square_logo.png"
        />
        <Meta name="og:image:alt" content="WNYC" />
        <Meta name="og:image:width" content="1200" />
        <Meta name="og:image:height" content="600" />
        <Meta name="fb:app_id" content="151261804904925" />
        <Meta name="twitter:card" content="summary_large_image" />
        <Meta name="twitter:site" content="@radiolab" />
        <Meta name="twitter:title" content="WNYC" />
        <Meta
          name="twitter:description"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:image"
          content="https://media.wnyc.org/i/1200/1200/c/80/1/wnyc_square_logo.png"
        />
      </Head>
    </Html>
    <the-header />
    <main>
      <div class="dots" />
      <div class="content">
        <slot />
      </div>
    </main>
    <the-footer />
    <audio-player />
  </div>
</template>

<style lang="scss">
.dots {
  opacity: 0.5;
  background-image: radial-gradient(
      RGB(255, 255, 255, 0.6) 2px,
      transparent 2px
    ),
    radial-gradient(RGB(255, 255, 255, 0.6) 2px, transparent 2px);
  background-position: 35px 0, 35px 35px;
  background-size: 35px 35px;
  width: 1366px;
  max-width: 100%;
  height: 340px;
  position: absolute;
  margin: auto;
  right: 0;
  left: 0;
}
.content {
  z-index: 10;
  position: relative;
}
</style>
