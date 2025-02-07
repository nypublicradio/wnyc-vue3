<script setup>
import { ref, watchEffect } from "vue"

const props = defineProps({
  data: {
    default: false,
    type: Boolean,
  },
  fontSize: {
    default: "0.70rem",
    type: String,
  },
  width: {
    default: "3.5rem",
    type: String,
  },
  no: {
    default: "NO",
    type: String,
  },
  yes: {
    default: "YES",
    type: String,
  },
})

const emit = defineEmits(["click", "update:data", "change", "input", "focus", "blur"])

const checked = ref(props.data)

const noRef = ref(null)
const yesRef = ref(null)

watchEffect(() => {
  checked.value = props.data
})
</script>

<template>
  <div
    class="v-toggleswitch"
    :class="[{ checked: checked }]"
    :style="{ '--p-toggleswitch-width': props.width }"
  >
    <ToggleSwitch
      v-model="checked"
      :ariaLabel="`Toggle between ${props.yes} and ${props.no}`"
      @update:modelValue="emit('update:data', checked)"
      @click="emit('click', checked)"
      @change="emit('change', checked)"
      @focus="emit('focus', checked)"
      @blur="emit('blur', checked)"
    >
      <template #handle>
        <div class="options">
          <div ref="noRef" class="option no">
            {{ props.no }}
          </div>
          <div ref="yesRef" class="option yes">
            {{ props.yes }}
          </div>
        </div>
      </template>
    </ToggleSwitch>
  </div>
</template>

<style lang="scss" scoped>
$sliderSize: var(--p-toggleswitch-width);
$fontSize: v-bind(fontSize);

.v-toggleswitch {
  position: relative;
  line-height: 0;
  width: $sliderSize;
  .p-toggleswitch {
    width: $sliderSize;
    .p-toggleswitch-input {
      width: $sliderSize;
    }
    .p-toggleswitch-slider {
      width: $sliderSize;
    }
    &.p-toggleswitch-checked {
    }
    overflow: hidden;

    .options {
      display: flex;
      gap: 1.75rem;
      justify-content: space-evenly;
      flex-direction: row-reverse;
      pointer-events: none;
      .option {
        font-weight: bold;
        font-family: var(--font-family);
        font-size: $fontSize;
        font-smooth: always;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        pointer-events: none;
        &.no {
          text-align: left;
          color: #000000;
        }
        &.yes {
          text-align: right;
          color: #ffffff;
        }
      }
    }
  }
}
</style>
