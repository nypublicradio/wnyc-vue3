<script setup>
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import {
  fetchAndStoreMp3,
  playStoredMp3,
  deleteStoredMp3,
  readStoreDir,
  playMp3,
} from '~/utilities/helpers'
import { useFileSystem, useCurrentFile } from '~/composables/states'
const fileSystem = useFileSystem()
const currentFile = useCurrentFile()

watch(fileSystem, (value) => {
  console.log('fileSystem', value)
})
watch(currentFile, (value) => {
  console.log('currentFile', value)
})

const files = ref([
  {
    name: 'chop',
    filename: 'chop.mp3',
    url: '/episodes/chop.mp3',
  },
  {
    name: 'high',
    filename: 'high.mp3',
    url: '/episodes/high.mp3',
  },
  {
    name: 'snap',
    filename: 'snap.mp3',
    url: '/episodes/snap.mp3',
  },
  {
    name: 'warm',
    filename: 'warm.mp3',
    url: '/episodes/warm.mp3',
  },
  {
    name: 'sample',
    filename: 'sample.mp3',
    url: '/episodes/sample.mp3',
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
        <li v-for="file in files" :key="file.name">
          <Button :label="file.name" @click="playMp3(file)" />
          <Button
            v-if="
              fileSystem.files?.find((fsFile) => fsFile.name === file.filename)
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
          <Button :label="file.name" @click="playStoredMp3(file)" />
          <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
        </li>
      </ul>
      <!-- <pre>{{ fileSystem.files }}</pre> -->
      <audio
        v-if="currentFile?.data"
        :src="`data:audio/mpeg;base64,${currentFile?.data}`"
        controls
        autoplay
      >
        <source :src="currentFile" type="audio/mpeg" />
        The “audio” tag is not supported by your browser.
      </audio>
      <audio v-if="currentFile?.url" controls autoplay>
        <source :src="currentFile.url" type="audio/mpeg" />
        The “audio” tag is not supported by your browser.
      </audio>
    </div>
  </div>
</template>

<style lang="scss">
.file-system {
}
</style>
