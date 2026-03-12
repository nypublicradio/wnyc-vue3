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
if (props.error?.statusCode) {
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

//clear error and try again
function handleTryAgain() {
  //nuxt global
  clearError()
  refreshData()
}
</script>

<template>
  <div class="">
    <div class="flex flex-column gap-3 py-4 px-5">
      <h1>{{ error?.message }}</h1>
      There was an error 😱

      <br />
      <div class="mt-3 flex gap-3 justify-content-center">
        <Button
          label="Try again"
          severity="secondary"
          aria-label="try again"
          @click="handleTryAgain"
        />
        <Button label="Navigate home" aria-label="Navigate home" @click="handleGoHome" />
      </div>
    </div>
  </div>
</template>
