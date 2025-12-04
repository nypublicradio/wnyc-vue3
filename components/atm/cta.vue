<script setup>
const routeToPage = () => {
  navigateTo("/ask-the-mayor");
};
</script>
<template>
  <div class="atm-cta flex items-center w-full" @click="routeToPage">
    <nuxt-img
      src="/atm/mayor.png"
      loading="eager"
      :quality="100"
      :width="90"
      :height="90"
    />
    <div
      class="flex flex gap-2 p-2 justify-content-between align-items-center w-full"
    >
      <div class="flex flex-column justify-content-center">
        <h2>Zohran K. Mamdani</h2>
        <p class="text-xs">Mayor-elect of New York City</p>
      </div>
      <Button
        label="Ask the Mayor"
        icon="pi pi-video"
        size="small"
        @click="routeToPage"
      />
    </div>
  </div>
</template>


<style lang="scss" scoped>
.atm-cta {
  background-color: var(--p-surface-25);
  background-image: url("/atm/bg2.jpg");
  background-size: cover;
  filter: grayscale(0);
  border-radius: 10px;
  border: 1px solid var(--p-surface-50);
  padding: 0;
}
</style>