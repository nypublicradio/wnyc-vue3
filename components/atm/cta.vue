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
      src="/atm/mayor.webp"
      loading="eager"
      alt="Blank and white illustration of Mayor Zohran K. Mamdani"
      class="align-self-end w-9rem sm:w-7rem"
    />
    <div
      class="flex gap-2 py-3 pl-0 pr-3 sm:p-3 sm:pl-0 justify-content-center sm:justify-content-between align-items-center w-full flex-column sm:flex-row -ml-4 sm:-ml-3"
    >
      <div class="content flex flex-column justify-content-center">
        <h2>Mayor Mamdani Takes Your Questions</h2>
        <p class="text-xs">
          NYC's mayor speaks directly to listeners about the issues facing the
          city.
        </p>
      </div>
      <Button
        label="Submit a Question"
        size="small"
        @click.stop="routeToPage"
        class="flex-none w-full sm:w-auto"
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