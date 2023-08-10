<script setup lang="ts">
import VSmartHeader from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VSmartHeader.vue'
const route = useRoute()
useHead({
  bodyAttrs: {
    class: 'template-default',
  },
})
</script>

<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <div class="top-safe-cover" />

    <header v-if="route.name === 'home'">
      <VSmartHeader :hero-buffer="400" :resume-delay="0">
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
    <BottomMenu />
  </div>
</template>

<style lang="scss" scoped>
.content {
  z-index: 10;
  position: relative;
}
</style>
