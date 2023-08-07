<script setup lang="ts">
import VSmartHeader from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VSmartHeader.vue'
const route = useRoute()
const config = useRuntimeConfig()
</script>

<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <Html lang="en">
      <Head>
        <Link rel="canonical" :href="`https://wnyc.org${route.path}`" />
        <Link rel="stylesheet" :href="config.public.HTL_CSS" type="text/css" />
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
    <div class="top-safe-cover" />
    <header>
      <VSmartHeader :hero-buffer="800" :resume-delay="0">
        <TheHeader />
      </VSmartHeader>
    </header>
    <main>
      <div class="content">
        <!-- <input :value="fcmToken" />
        <p>acceptNotifications = {{ acceptNotifications }}</p>
        <Button
          v-if="!acceptNotifications"
          label="go to system settings"
          @click="toSystemSettings"
        /> -->

        <!-- <FileSystem /> -->
        <!-- <div class="px-4">
          <p>fcm token =</p>
          <input :value="fcmToken" />
          <pre></pre>
          <p>appLaunchUrl = {{ appLaunchUrl }}</p>
          <p>Notification = {{ nNotification }}</p>
          <h4>Capacitor's JavaScript API</h4>
          <h6>
            Platform (web | ios | android) = {{ Capacitor.getPlatform() }}
          </h6>
          <h6>isNativePlatform = {{ Capacitor.isNativePlatform() }}</h6>
          <h6>
            isPluginAvailable('Camera') =
            {{ Capacitor.isPluginAvailable('Camera') }}
          </h6>
        </div> -->

        <!-- <Transition name="refresh">
          <div
            v-if="isRefreshing"
            class="fixed flex align-items-center justify-content-center w-full mt-2"
          >
            <i
              class="pi pi-spin pi-spinner text-white text-lg mr-2"
              style="font-size: 2rem"
            ></i>
            <p>REFRESHING</p>
          </div>
        </Transition> -->
        <slot />
      </div>
    </main>
    <AudioPlayer />
    <BottomMenu />
  </div>
</template>

<style lang="scss" scoped>
.content {
  z-index: 10;
  position: relative;
}
</style>
