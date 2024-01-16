<script setup>
import {
  playStoredMp3,
  deleteStoredMp3,
  readStoreDir,
  playMp3,
  formatFileSize,
  initReadOfPreferences,
} from "~/utilities/helpers"
import { useFileSystem, useFileSystemLS } from "~/composables/states"
const fileSystem = useFileSystem()
const fileSystemLS = useFileSystemLS()
fileSystemLS.value = await initReadOfPreferences()

const used = ref(0)
const granted = ref(0)

watch(fileSystem, (/* value */) => {
  //console.log('fileSystem', value)

  navigator.webkitPersistentStorage.queryUsageAndQuota((usedBytes, grantedBytes) => {
    //console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes')
    used.value = usedBytes
    granted.value = grantedBytes
  })
})

const files = ref([
  {
    title: "Large: Colors",
    file: "https://waaa.wnyc.org/radiolab/radiolab040210.mp3",
    details: "<p>This is a Radiolab sample description for this audio file</p>",
    image:
      "https://media.wnyc.org/i/200/200/c/70/photologue/photos/RL_Colors_620_no_title.jpg",
  },
  {
    title: "Small: Colors",
    file: "https://waaa.wnyc.org/bl/bl122721dpod.mp3",
    details: "<p>This is a Radiolab sample description for this audio file</p>",
    image:
      "https://media.wnyc.org/i/200/200/c/70/photologue/photos/RL_Colors_620_no_title.jpg",
  },
  {
    title: "snap",
    file: "/episodes/snap.mp3",
    details: "<p>This is a sample description for this audio file</p>",
    image: "https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg",
  },
  {
    title: "warm",
    file: "/episodes/warm.mp3",
    details: "<p>This is a sample description for this audio file</p>",
    image: "https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg",
  },
  {
    title: "sample",
    file: "/episodes/sample.mp3",
    details: "<p>This is a sample description for this audio file</p>",
    image: "https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg",
  },
])

onMounted(() => {
  // initial read of the stored directory
  readStoreDir()
})
</script>

<template>
  <div>
    <div class="file-system">
      <p>Files:</p>

      <ul>
        <li v-for="file in files" :key="file.title">
          <Button :label="file.title" @click="playMp3(file)" />

          <DownloadDeleteButton :file="file" />
        </li>
      </ul>
      <p>Saved files:</p>
      <p>!!Storage limit: {{ used }} of {{ granted }}</p>
      <ul>
        <li v-for="file in fileSystemLS" :key="`LS-${file.title}`">
          <Button
            :label="`${file.title} - ${formatFileSize(file.size)}`"
            @click="playStoredMp3(file)"
          />
          <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
        </li>
      </ul>
      <!-- <ul>
        <li v-for="file in fileSystem.files" :key="file.name">
          <Button
            :label="`${file.name} - ${formatFileSize(file.size)}`"
            @click="playStoredMp3(file)"
          />
          <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
        </li>
      </ul> -->
      <div class="grid">
        <pre class="col-6">FileSystem = {{ fileSystem.files }}</pre>
        <pre class="col-6">FileSystemLS = {{ fileSystemLS }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.file-system {
}
</style>
