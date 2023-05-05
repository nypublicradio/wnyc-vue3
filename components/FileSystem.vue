<script setup>
import {
  playStoredMp3,
  deleteStoredMp3,
  readStoreDir,
  playMp3,
  formatFileSize,
} from '~/utilities/helpers'
import { useFileSystem, useFileSystemLS } from '~/composables/states'
const fileSystem = useFileSystem()
const fileSystemLS = useFileSystemLS()

watch(fileSystem, (value) => {
  console.log('fileSystem', value)
})

const files = ref([
  {
    title: 'Radiolab: Colors',
    file: 'https://waaa.wnyc.org/radiolab/radiolab052112.mp3',
    details: '<p>This is a Radiolab sample description for this audio file</p>',
    image:
      'https://media.wnyc.org/i/200/200/c/70/photologue/photos/RL_Colors_620_no_title.jpg',
  },
  {
    title: 'high',
    file: '/episodes/high.mp3',
    details: '<p>This is a sample description for this audio file</p>',
    image: 'https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg',
  },
  {
    title: 'snap',
    file: '/episodes/snap.mp3',
    details: '<p>This is a sample description for this audio file</p>',
    image: 'https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg',
  },
  {
    title: 'warm',
    file: '/episodes/warm.mp3',
    details: '<p>This is a sample description for this audio file</p>',
    image: 'https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg',
  },
  {
    title: 'sample',
    file: '/episodes/sample.mp3',
    details: '<p>This is a sample description for this audio file</p>',
    image: 'https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg',
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
      <!-- <ul>
        <li v-for="file in fileSystem.files" :key="file.name">
          <Button
            :label="`${file.name} - ${formatFileSize(file.size)}`"
            @click="playStoredMp3(file)"
          />
          <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
        </li>
      </ul> -->
      <ul>
        <li v-for="file in fileSystemLS" :key="file.name">
          <Button
            :label="`${file.title} - ${formatFileSize(file.size)}`"
            @click="playStoredMp3(file)"
          />
          <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
        </li>
      </ul>
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
