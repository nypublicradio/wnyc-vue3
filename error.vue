<script setup lang="ts">
import { refreshData } from "./utilities/helpers"

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
})

// Set the HTTP response status code based on the error
// This is critical for nginx to intercept 404s and proxy to CMS
// MUST run only on server side when SSR is enabled
if (import.meta.server && props.error?.statusCode) {
  const event = useRequestEvent()
  if (event) {
    setResponseStatus(event, props.error.statusCode, props.error.statusMessage)
  }
}

//clear error and route home
function handleGoHome() {
  //nuxt global
  clearError({ redirect: "/home" })
  refreshData()
}
</script>

<template>
  <div class="error">
    <NuxtLayout>
      <section class="flex flex-column md:flex-row gap-3 align-items-center">
        <img
          src="/404_tote.webp"
          alt="404"
          preload
          fetchpriority="high"
          loading="eager"
          class="flex-none w-15rem lg:w-27rem"
        />
        <div class="text-center md:text-left">
          <div class="header">
            <h1 v-if="error.statusCode === 404">
              Sorry, this page can't be found.
            </h1>
            <h1 v-else>Sorry, something went wrong.</h1>
          </div>
          <div
            class="mt-3 flex flex-column gap-3 justify-content-center lg:justify-content-start"
          >
            <p>
              The page you're looking for isn't available. It may have been
              removed or the link has expired.
            </p>
            <Button
              severity="secondary"
              variant="link"
              class="link w-10rem jusify-self-start -ml-4"
              label="Return home"
              aria-label="Return home"
              @click="handleGoHome"
            />
          </div>
        </div>
      </section>
    </NuxtLayout>
    <Drawers class="z-2" />
  </div>
</template>

<style scoped>
.header h1 {
  font-size: 2.25rem;
}
</style>
