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
  color: #ffffff;
  padding: 3rem;
  .content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.75rem;
    opacity: 0.8;
    .msg {
      color: #ffffff;
      font-size: 1rem;
      text-align: center;
      color: #ffffff;
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
