<script setup>
const props = defineProps({
  msg: {
    type: String,
    default: "WNYC is supported by",
  },
  color: {
    type: String,
    default: "#ab5491",
  },
})
</script>

<template>
  <div class="sponsor-banner" data-style-mode="dark">
    <div class="content">
      <p class="msg">{{ props.msg }}</p>
      <JLGreene class="sponsor" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sponsor-banner {
  background-color: #000000;
  padding: 3rem;
  color: var(--text-color);
  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.75rem;
    opacity: 0.8;
    .msg {
      font-size: 1rem;
      text-align: center;
    }
    .sponsor {
      width: 100%;
      max-width: 180px;
      margin: 0 auto;
      color: v-bind(color);
    }
  }
}
</style>
