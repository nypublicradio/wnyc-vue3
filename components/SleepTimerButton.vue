<script lang="ts" setup>
import SleepIcon from "@/components/icons/SleepIcon.vue"
//import { useNewFeatureBadge } from "@/composables/useNewFeatureBadge"

//const { isNewFeature, handleFeatureClick } = useNewFeatureBadge()
const props = defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
  isText: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
  severity: {
    type: String,
    default: "secondary",
  },
  iconClass: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["emit-click"])

// handle click event on the button
const handleClick = () => {
  //handleFeatureClick()
  emit("emit-click")
}
</script>

<template>
  <div class="sleep-timer-button">
    <Button
      :text="props.isText"
      :label="props.label"
      :severity="props.severity"
      rounded
      @click="handleClick"
    >
      <template #icon>
        <SleepIcon :active="props.isActive" :class="props.iconClass"
      /></template>
    </Button>
    <!--  <NewFeatureBadge class="badge" v-if="isNewFeature" /> -->
  </div>
</template>

<style lang="scss" scoped>
.sleep-timer-button {
  position: relative;
  .p-button .o-icon {
    fill: var(--p-text-color);
  }
  .badge {
    top: -25px;
    position: absolute;
  }
}
</style>
