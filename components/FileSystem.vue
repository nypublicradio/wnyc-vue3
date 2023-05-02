<script setup>
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import {
  fetchAndStoreMp3,
  playStoredMp3,
  deleteStoredMp3,
  readStoreDir,
  playMp3,
  fileNameFromURL,
  formatFileSize,
} from '~/utilities/helpers'
import { useFileSystem } from '~/composables/states'
const fileSystem = useFileSystem()

watch(fileSystem, (value) => {
  console.log('fileSystem', value)
})

const files = ref([
  {
    title: 'chop',
    file: '/episodes/chop.mp3',
    details: '<p>This is a sample description for this audio file</p>',
    image: 'https://media.wnyc.org/i/448/448/l/80/2020/10/atc.jpg',
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
  readStoreDir()

  // fileSystem.value.files.filter((fsFile) => {
  //   console.log('fsFile.name  = ', fsFile.name)
  //   console.log('file.filename  = ', file.filename)
  // })
})
</script>

<template>
  <div>
    <div class="file-system">
      <p>Files:</p>

      <ul>
        <li v-for="file in files" :key="file.title">
          <Button :label="file.title" @click="playMp3(file)" />
          <Button
            v-if="
              fileSystem.files?.find(
                (fsFile) => fsFile.name === fileNameFromURL(file.file)
              )
            "
            icon="pi pi-trash"
            @click="deleteStoredMp3(file)"
          />
          <Button
            v-else
            icon="pi pi-download"
            @click="fetchAndStoreMp3(file)"
          />
        </li>
      </ul>
      <p>Saved files:</p>
      <ul>
        <li v-for="file in fileSystem.files" :key="file.name">
          <Button
            :label="`${file.name} - ${formatFileSize(file.size)}`"
            @click="playStoredMp3(file)"
          />
          <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
        </li>
      </ul>
      <!-- <pre>{{ fileSystem.files }}</pre> -->
    </div>
  </div>
</template>

<style lang="scss">
.file-system {
}
</style>
