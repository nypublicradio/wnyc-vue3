<script setup>

const emit = defineEmits(["onClick"])
const config = useRuntimeConfig()
</script>
<template>
  <div class="streamfield-donation p-3 pb-4 my-6">
    <section class="holder">
      <h2 class="mb-2">WNYC depends <span class="no-wrap">on you.</span></h2>
      <p class="mb-1">
        Listener support is WNYC’s largest source of funding, and makes it possible to
        bring you the independent local news you depend on.
      </p>
      <div class="text-center mt-4">
        <!-- maybe consider opening in a in app browser -->
        <VFlexibleLink
          raw
          :to="`${config.public.ARTICLE_STREAMFIELD_DONATION_URL}`"
          target="_blank"
          @click="emit('onClick')"
        >
          <Button label="Donate Now" aria-label="donate" />
        </VFlexibleLink>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.streamfield-donation {
  background: var(--donation-bg);
  .holder {
    max-width: 550px;
  }
}
.streamfield-donation h2 {
  font-family: var(--font-family-tisa);
  font-size: var(--font-size-10);
  font-weight: var(--font-weight-700);
  line-height: var(--font-size-11);
  color: var(--donation-text);
}
.streamfield-donation p {
  font-size: var(--font-size-5);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-8);
  color: var(--donation-text);
}
.streamfield-donation .p-button {
  width: 181px;
  height: 39px;
}
</style>
