<script setup>
import {
  playStoredMp3,
  deleteStoredMp3,
  readStoreDir,
  playMp3,
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
    file: 'https://waaa.wnyc.org/radiolab_podcast/radiolab_podcast052022_lamancha.mp3/radiolab_podcast052022_lamancha.mp3_ywr3ahjkcgo_d2d032db4d1737bae96500b2a72fa36e_58957006.mp3?hash_redirect=1&x-total-bytes=58957006&x-ais-classified=streaming&listeningSessionID=0CD_382_121__bf478affca16c2c2c324c8c675e6e794fc9fb2f8',
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
