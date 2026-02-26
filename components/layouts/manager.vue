<script setup>
const props = defineProps({
  body: {
    type: Array,
    required: true,
    default: () => [],
  },
})
const layoutComponents = {}
// dynamically import and Cache layout components to prevent re-creating them on each render
const getLayoutComponent = (layout) => {
  if (!layoutComponents[layout]) {
    if (layout === "default") {
      // setting "river" as default layout
      layoutComponents[layout] = defineAsyncComponent(() =>
        import(`./text-only.vue`)
      )
    } else {
      layoutComponents[layout] = defineAsyncComponent(() =>
        import(`./${layout}.vue`)
      )
    }
  }
  return layoutComponents[layout]
}
</script>

<template>
  <div class="layout-manager">
    <div v-for="(section, index) in props.body" :key="section?.id">
      <div v-if="section?.value?.list?.listItems?.length">
        <component
          :is="getLayoutComponent(section?.value?.layout)"
          :list="section?.value?.list"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.layout-manager {
}
</style>
