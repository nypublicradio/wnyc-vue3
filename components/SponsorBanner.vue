<script setup>
import { ref, computed, onMounted } from "vue"

const props = defineProps({
  msg: {
    type: String,
    default: "WNYC is supported by",
  },
})

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
</script>

<template>
  <div class="sponsor-banner">
    <p class="msg">{{ msg }}</p>
    <img class="sponsor" src="/sponsors/jlgreene.svg" alt="JL Greene Logo" />
  </div>
</template>

<style lang="scss" scoped>
.sponsor-banner {
  background-color: red;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.75rem;
  .msg {
    font-size: 1rem;
    text-align: center;
  }
  .sponsor {
    width: 100%;
    max-width: 180px;
    margin: 0 auto;
  }
}
</style>
