<script setup lang="ts">
import { refreshData } from "./utilities/helpers"

interface ErrorPayload {
  statusCode?: number
  statusMessage?: string
  message?: string
  stack?: string
  data?: unknown
}

const props = defineProps({
  error: {
    type: Object,
    default: null,
  },
})

const requestEvent = import.meta.server ? useRequestEvent() : null
const route = useRoute()

function logPageError(errorPayload: ErrorPayload | null) {
  if (!errorPayload) {
    return
  }

  const details = {
    timestamp: new Date().toISOString(),
    context: import.meta.server ? "server" : "client",
    route: route.fullPath,
    url: requestEvent?.path || requestEvent?.node?.req?.url,
    statusCode: errorPayload.statusCode,
    statusMessage: errorPayload.statusMessage,
    message: errorPayload.message,
    data: errorPayload.data,
    stack: errorPayload.stack,
  }

  console.error("[error.vue] Nuxt error page triggered", details)

  if (errorPayload.stack) {
    console.error("[error.vue] stack", errorPayload.stack)
  }
}

// Set the HTTP response status code based on the error
// This is critical for nginx to intercept 404s and proxy to CMS
// MUST run only on server side when SSR is enabled
if (import.meta.server && props.error) {
  if (requestEvent && props.error?.statusCode) {
    setResponseStatus(
      requestEvent,
      props.error.statusCode,
      props.error.statusMessage
    )
  }
}

logPageError(props.error as ErrorPayload)

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
