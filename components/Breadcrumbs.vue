<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})
</script>

<template>
  <Breadcrumb :model="items" class="hidden xs:block">
    <template #item="{ item }">
      <NavButton
        v-if="item.route && item.label"
        size="small"
        :label="item.label"
        trackingLocation="breadcrumbs"
        :route="item.route"
      />
    </template>
    <template #separator>/</template>
  </Breadcrumb>
</template>

<style lang="scss">
.p-breadcrumb ol {
  padding-left: 0;
}
.p-breadcrumb button {
  padding: 0;
}
</style>
