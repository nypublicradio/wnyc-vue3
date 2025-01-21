<script setup>
const props = defineProps({
  tags: {
    type: Array,
    default: null,
  },
  label: {
    type: String,
    default: "Tagged",
  },
})
const emit = defineEmits(["tag-click"])
</script>

<template>
  <div v-if="props.tags" class="tags flex align-items-center mb-4 md:mb-6">
    <p v-if="props.label" class="type-caption mr-3">
      {{ props.label }}
    </p>
    <div class="flex gap-1 align-items-center flex-wrap">
      <v-tag
        v-for="tag in props.tags"
        class="tag-small"
        :name="tag.name"
        :slug="`/tags/${tag.slug}`"
        :key="tag.name"
        @click="emit('tag-click', tag)"
      />
    </div>
  </div>
</template>
