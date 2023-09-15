<script setup>
const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  data: {
    type: [String, Object],
    default: null,
  },
})

const emit = defineEmits(['update:data'])

const internalData = ref(props.data)
</script>
<template>
  <Dropdown
    v-if="options.length > 0"
    v-model="internalData"
    :options="options"
    :optionLabel="props.optionLabel"
    placeholder="Select a station"
    class="s-dropdown"
    @update:modelValue="$emit('update:data', $event)"
  >
    <template #value="slotProps">
      <div
        v-if="slotProps.value[props.optionLabel]"
        class="flex align-items-center justify-content-end"
      >
        <div class="ans">{{ slotProps.value[props.optionLabel] }}</div>
      </div>
      <span v-else>
        <!-- placeholder -->
        <div class="ans">{{ data }}</div>
      </span>
    </template>
    <template #header>
      <i class="pi pi-minus" />
    </template>
    <template #option="slotProps">
      <div class="flex align-items-center station-options">
        <!-- <img
          v-if="slotProps.option.image"
          :alt="slotProps.option.label"
          :src="slotProps.option.image"
          class="mr-2"
          style="width: 18px; height: 18px"
        /> -->
        <div class="option">{{ slotProps.option[props.optionLabel] }}</div>
      </div>
    </template>
  </Dropdown>
</template>

<style lang="scss" scoped>
.s-dropdown {
  width: 80%;
  height: 42px;
  margin-right: -1rem;
  background: transparent;
  border: none;
  text-align: right;
  .p-dropdown-trigger {
    display: none !important;
  }
  &:hover {
    background: var(--background3);
  }
}
</style>
<style lang="scss">
.s-dropdown {
  .p-dropdown-trigger {
    display: none !important;
  }
  .p-dropdown-label {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
  .ans {
    @include font-config($type-paragraph1);
  }
}
.p-dropdown-panel {
  position: absolute;
  top: unset !important;
  bottom: 0;
  left: 0;
  width: 100%;
  transform-origin: center bottom !important;
  border-radius: 28px 28px 0px 0px;
  -webkit-box-shadow: 0 -20px 50px 0 rgba(0, 0, 0, 1);
  box-shadow: 0 -20px 50px 0 rgba(0, 0, 0, 1);
  background: var(--background4) !important;
  .pi-minus {
    color: #ffffff;
    font-size: 30px;
    text-align: center;
    width: 100%;
    opacity: 30%;
  }
  .p-dropdown-items-wrapper {
    max-height: unset !important;
    padding: 5px 20px calc($bottomMenuHeight + $playerHeight) 20px;
    .p-dropdown-item {
      color: #ffffff !important;
      font-weight: var(--font-weight-600);
      font-size: 0.938rem;
      padding: 0.5rem 0;
      .station-options {
        margin: 10px 0;
        img {
          width: 40px !important;
          height: 40px !important;
        }
        .option {
          font-size: 16px;
        }
      }
    }
  }
}
</style>
