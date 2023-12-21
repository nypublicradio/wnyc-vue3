<script setup>
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
const emit = defineEmits(["onClick"])
</script>
<template>
  <div class="streamfield-donation p-4 pb-5 my-2">
    <h2 class="mb-3">We rely on your support</h2>
    <p class="mb-3">
      Donations from listeners are the largest source of WNYC's funding for all the
      reporting and programs that keep you informed, engaged, and entertained.
    </p>
    <div class="text-center">
      <!-- maybe consider opening in a in app browser -->
      <VFlexibleLink
        raw
        to="https://pledge.wnyc.org/support/wnyc?utm_source=wnyc_app&utm_medium=wnyc&utm_campaign=story-donate-button"
        target="_blank"
        @click="emit('onClick')"
      >
        <Button label="Donate" />
      </VFlexibleLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.streamfield-donation {
  background: var(--donation-bg);
  //background: $backgroundGradient1;
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
