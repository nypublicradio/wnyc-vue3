<script lang="ts" setup>
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
    <h2 class="menu-h2">{{ props.menuData.label }}</h2>
    <div
      v-if="props.menuData?.items?.length > 0"
      class="flex flex-column gap-2 -ml-2"
    >
      <NavButton
        v-for="item in props.menuData.items[0]"
        :label="item.label"
        :route="item.url"
        :key="item.id"
        class="menu-item"
        :class="item.class"
        :command="item.command"
        @emit-click="() => emit('emit-click', item)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.expanded-menu-item {
  .menu-h2 {
    margin-bottom: 16px;
    margin-left: 4px;

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
