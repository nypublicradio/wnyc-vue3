<script setup lang="ts">
import type { FactboxBlock } from "~/composables/types/StreamfieldBlock"

defineProps<{
  block: FactboxBlock
}>()
</script>

<template>
  <aside class="factbox">
    <h2 class="mb-4">
      {{ block.value.heading }}
    </h2>
    <VImage
      v-if="block.value.image.image"
      :src="block.value.image.image"
      :size="{
        xxs: [316, 210],
        xs: [517, 344],
        sm: [709, 472],
        md: [885, 589],
        lg: [757, 504],
        xl: [923, 614],
        xxl: [688, 458],
      }"
      :maxHeight="block.value.image.image.height"
      :maxWidth="block.value.image.image.width"
      allowVerticalEffect
      :alt="block.value.image.image.alt"
      class="mb-4"
    >
      <template #caption>
        <VImageCaption
          v-if="block.value.image.caption || block.value.image.image.caption"
          :text="block.value.image.caption || block.value.image.image.caption"
        />
      </template>
    </VImage>
    <div class="factbox-body">
      <div v-for="bodyBlock of block.value.body" :key="bodyBlock.id">
        <div
          v-if="bodyBlock.type === 'text'"
          :key="`${bodyBlock.id}-text`"
          class="factbox-body-text"
          v-html="bodyBlock.value"
        />
        <table
          v-else-if="bodyBlock.type === 'custom_list'"
          class="factbox-body-table mt-4"
        >
          <tbody>
            <tr v-for="listItem of bodyBlock.value" :key="listItem.listItemLabel">
              <th>{{ listItem.listItemLabel }}</th>
              <td v-html="listItem.listItemText" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </aside>
</template>

<style lang="scss">
.factbox {
  margin: 24px 0;
  padding: 20px 0;
  border-top: solid 1px var(--p-text-color);
  border-bottom: solid 1px #999999;
}

.factbox-body-table {
  width: 100%;
  border-spacing: 2rem 0;
}
.factbox-body-table tr {
  background: none !important;
  border: none !important;
}
.factbox-body-table tr th,
.factbox-body-table tr td {
  vertical-align: top;
  text-align: left;
  font-size: var(--font-size-5);
  line-height: 1.4;
  padding: 0;
}
.factbox-body-table tr th {
  padding: 0;
  text-transform: none;
  font-weight: 700;
}
.factbox-body-table tr:not(:last-child) > td {
  padding-bottom: 1rem;
}
.factbox-body-table tr td,
.factbox-body-table tr td p {
  font-family: var(--font-family-header);
  font-size: var(--font-size-5);
  line-height: 1.4;
  text-transform: none;
  font-weight: 400;
}
</style>
