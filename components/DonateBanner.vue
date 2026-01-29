<script setup>
const props = defineProps({
  headline: {
    type: String,
    default: "We rely on your support",
  },
  blurb: {
    type: String,
    default:
      "Donations from listeners are the largest source of WNYC's funding for all the reporting and programs that keep you informed, engaged, and entertained.",
  },
  link: {
    type: String,
    default: null,
  },
})

const config = useRuntimeConfig()
const donateLink = ref(config.public.ARTICLE_STREAMFIELD_DONATION_URL)
if (props.link) {
  donateLink.value = props.link
}

// Handle the donate button click
const onDonate = () => {
  if (donateLink.value) {
    window.open(donateLink.value, "_blank")
  } else {
    // fallback to donate page
    window.open("https://donate.wnyc.org/page/contribute", "_blank")
  }
}
</script>

<template>
  <div class="donate-banner px-2 py-4 md:px-4 md:py-5 style-mode-light">
    <section
      class="flex flex-column gap-4 justify-content-center align-items-center"
    >
      <h2 class="font-bold font-tisa text-center text-xl md:text-2xl">
        {{ props.headline }}
      </h2>
      <p class="text-center line-height-3">{{ props.blurb }}</p>
      <Button label="Donate" @click="onDonate" class="px-6" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.donate-banner {
  background-color: var(--p-yellow-500);
  &.style-mode-light {
    --p-text-color: var(--p-surface-950);
  }
  section {
    max-width: $thinContentWidth;
  }
}
</style>
