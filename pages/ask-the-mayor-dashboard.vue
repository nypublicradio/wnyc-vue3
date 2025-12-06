
<script setup>
import { trackClickEvent } from "~/utilities/helpers";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const user = useCurrentUser();


onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp();
  $analytics.sendPageView({
    page_title: "Ask the Mayor Dashboard",
    page_type: "ask_the_mayor_dashboard",
    content_group: "ask_the_mayor_dashboard",
  });
});
</script>

<template>
  <div>
    <Html lang="en">
      <Head>
        <Title
          >WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>

    <section>
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="navigateTo('/home')"
          label="Back"
        />
      </div>
      <h1>Ask the Mayor Dashboard</h1>
      
    </section>
  </div>
</template>
<style>
</style>