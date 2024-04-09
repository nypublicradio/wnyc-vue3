<script setup>
import { useFileSystem } from "~/composables/states"
import {
  fetchAndStoreMp3,
  deleteDirectory,
  fileNameFromURL,
} from "~/utilities/file-system"
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
  if (value.files?.find((entry) => entry.name === fileNameFromURL(props.file.audio))) {
    pending.value = false
  }
})
</script>

<template>
  <Button
    v-if="
      fileSystem.files?.find(
        (fsFile) => fsFile.name === fileNameFromURL(props.file.audio)
      )
    "
    icon="pi pi-trash"
    aria-label="delete audio"
    @click="
      () => {
        deleteDirectory(file)
        pending = false
      }
    "
  />
  <Button
    v-else-if="!pending"
    icon="pi pi-download"
    aria-label="download audio"
    @click="
      () => {
        fetchAndStoreMp3(file)
        pending = true
      }
    "
  />
  <Button v-else disabled icon="pi pi-spin pi-spinner" />
</template>
