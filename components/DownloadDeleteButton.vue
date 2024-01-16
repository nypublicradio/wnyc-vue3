<script setup>
import { useFileSystem } from "~/composables/states"
import { fetchAndStoreMp3, deleteStoredMp3, fileNameFromURL } from "~/utilities/helpers"
const props = defineProps({
  file: {
    type: Object,
    default: {},
    required: true,
  },
})

const fileSystem = useFileSystem()

const pending = ref(false)

watch(fileSystem, (value) => {
  // when the file system changes, check if THIS file is stored, then updatre the pending state
  if (value.files?.find((entry) => entry.name === fileNameFromURL(props.file.file))) {
    pending.value = false
  }
})
</script>

<template>
  <Button
    v-if="fileSystem.files?.find((fsFile) => fsFile.name === fileNameFromURL(file.file))"
    icon="pi pi-trash"
    @click="
      () => {
        deleteStoredMp3(file)
        pending = false
      }
    "
  />
  <Button
    v-else-if="!pending"
    icon="pi pi-download"
    @click="
      () => {
        fetchAndStoreMp3(file)
        pending = true
      }
    "
  />
  <Button v-else disabled icon="pi pi-spin pi-spinner" />
</template>
