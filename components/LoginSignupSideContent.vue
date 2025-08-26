<script setup>
const props = defineProps({
  bgImage: {
    type: String,
    default: "loginSignUp_result.webp",
  },
})
</script>

<template>
  <div
    class="login-signup-side-content image style-mode-dark p-0"
    :style="`background-image:url('/${props.bgImage}')`"
  >
    <div class="flex flex-column justify-content-around align-items-end">
      <div></div>
      <div class="info">
        <h2>Listen anywhere with your free account!</h2>
        <ul class="pl-4 flex flex-column gap-1">
          <li>Access your favorites anywhere</li>
          <li>Find more of what you love in the WNYC App</li>
          <li>Pick up listening where you left off on podcasts</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-signup-side-content {
  //background: var(--p-surface-25);
  &.image {
    background-size: cover;
    background-position: 75% 0;
    min-height: 983px;
    .info {
      padding: 2rem;
      background-color: var(--p-surface-950);
      max-width: 460px;
      width: 100%;
    }
  }
}
</style>
