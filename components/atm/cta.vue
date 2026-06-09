<script setup>
import { trackClickEvent } from "~/utilities/helpers"
// route to ask the mayor page and track it
const routeToPage = () => {
  trackClickEvent(
    "Click Tracking - Ask The Mayor CTA",
    "CTA on the Home Page",
    "Ask The Mayor CTA"
  )

  navigateTo("/ask-the-mayor")
}
</script>
<template>
  <div
    class="atm-cta flex items-center w-full cursor-pointer"
    @click="routeToPage"
  >
    <img
      src="/atm/mayor.png"
      loading="eager"
      :width="100"
      :height="100"
      alt="Blank and white illustration of Mayor Zohran K. Mamdani"
    />
    <div
      class="flex gap-1 sm:gap-2 p-2 sm:p-4 justify-content-center sm:justify-content-between align-items-center w-full flex-column sm:flex-row"
    >
      <div class="content flex flex-column justify-content-center">
        <h2>Zohran K. Mamdani</h2>
        <p class="text-xs">Mayor of New York City</p>
      </div>
      <Button
        label="Submit a Question"
        size="small"
        @click.stop="routeToPage"
      />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.atm-cta {
  background-color: var(--p-surface-25);
  background-image: url("/atm/bg2.jpg");
  background-size: cover;
  border-radius: 10px;
  //border: 1px solid var(--p-surface-50);
  padding: 0;
  .content * {
    color: var(--p-surface-950);
  }
}
</style>