<script lang="ts" setup>
// import global playlist data state here
</script>
<template>
  <div class="root px-3">
    <!-- Playlist Queue will be rendered here as a list of MediaCards.vue wrapped in a parent DataTable(https://v4.primevue.org/datatable/#reorder) component that enables the user to drag the item to change the order and remove the item. A scrubber icon on the left and a trash icon on the right with the media card in the middle. no need for headers on the table. doing a single selection triggers that item to play (https://v4.primevue.org/datatable/#single_row_selection)-->
    <p>Playlist here</p>
  </div>
</template>

<style lang="scss" scoped>
.root {
  padding-bottom: calc($playerHeightBrowser + 40px);
}
</style>