<script setup>
const props = defineProps({
  msg: {
    type: String,
    default: "WNYC is supported by",
  },
})
</script>

<template>
  <div class="sponsor-banner" data-style-mode="light">
    <p class="msg">{{ msg }}</p>
    <img class="sponsor" src="/sponsors/jlgreene.svg" alt="JL Greene Logo" />
  </div>
</template>

<style lang="scss" scoped>
.sponsor-banner {
  background-color: #ffffff;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  color: var(--text-color);
  .msg {
    font-size: 1rem;
    text-align: center;
  }
  .sponsor {
    width: 100%;
    max-width: 180px;
    margin: 0 auto;
    fill: var(--text-color);
  }
}
</style>
