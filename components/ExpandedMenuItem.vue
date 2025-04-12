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
    <h1 class="menu-h1">{{ props.menuData.label }}</h1>
    <div class="flex flex-column gap-2 -ml-2">
      <NavButton
        v-for="item in props.menuData.items[0]"
        :label="item.label"
        :route="item.url"
        :key="item.id"
        class="menu-item"
        :class="item.class"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.expanded-menu-item {
  .menu-h1 {
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
