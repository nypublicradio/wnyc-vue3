<script lang="ts" setup>
import { trackClickEvent } from "~/utilities/helpers"

const props = defineProps({
  menuData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(["emit-click"])
</script>
<template>
  <div class="expanded-menu-item">
    <h1 class="menu-h1">{{ props.menuData.label }}</h1>
    <div class="flex flex-column gap-2 -ml-2">
      <VFlexibleLink
        v-for="item in props.menuData.items[0]"
        :key="item.id"
        raw
        :to="item.url"
        class="menu-btn"
        :class="item.class"
        @flexible-link-click="
          () => {
            if (item.command) {
              item.command()
            }
            emit('emit-click')
            trackClickEvent(
              `Click Tracking - ${item.label} Button`,
              'hamburger menu',
              `${item.label} Button`
            )
          }
        "
      >
        <Button
          raw
          :label="item.label"
          :aria-label="`${item.label} button`"
          severity="secondary"
          size="small"
          variant="link"
        />
      </VFlexibleLink>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.expanded-menu-item {
  .menu-h1 {
    margin-bottom: 16px;
    @include media("<lg") {
      font-size: 0.813rem;
      text-transform: uppercase;
      font-weight: var(--font-weight-400);
      margin-bottom: 8px;
    }
  }
  .menu-btn {
    .p-button-label {
      text-align: left;
    }
  }
}
</style>
