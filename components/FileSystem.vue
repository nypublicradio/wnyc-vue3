<script setup>
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { fetchAndStoreMp3, playStoredMp3 } from '~/utilities/helpers'
import { useFileSystem, useCurrentFile } from '~/composables/states'
const fileSystem = useFileSystem()
const currentFile = useCurrentFile()

const readSecretFile = async () => {
  currentFile.value = await Filesystem.readFile({
    path: 'wnyc/downloads/sample.mp3',
    directory: Directory.Documents,
  })
}

const deleteSecretFile = async () => {
  await Filesystem.deleteFile({
    path: 'wnyc/downloads/sample.mp3',
    directory: Directory.Documents,
  })
  readDir()
}
const readDir = async () => {
  fileSystem.value = await Filesystem.readdir({
    path: 'wnyc/downloads',
    directory: Directory.Documents,
  })
}

const readFilePath = async () => {
  // Here's an example of reading a file with a full file path. Use this to
  // read binary data (base64 encoded) from plugins that return File URIs, such as
  // the Camera.
  const contents = await Filesystem.readFile({
    path: 'file:///var/mobile/Containers/Data/Application/22A433FD-D82D-4989-8BE6-9FC49DEA20BB/Documents/text.txt',
  })

  console.log('data:', contents)
}

// const makeDir = async () => {
//   await Filesystem.mkdir({
//     path: 'wnyc-audio/',
//     directory: Directory.Documents,
//   })
// }
watch(fileSystem, (value) => {
  console.log('value', value)
})
watch(currentFile, (value) => {
  console.log('currentFile', value)
})
</script>

<template>
  <div>
    <div class="file-system">
      <p>Directory:</p>
      <!--   <pre>{{ directory }}</pre> -->
      <ul>
        <li v-for="dir in fileSystem.files" :key="dir.name">
          <Button :label="dir.name" @click="playStoredMp3(dir.name)" />
        </li>
      </ul>
      <p>Content:</p>
      <Button @click="fetchAndStoreMp3('/sample.mp3', 'sample.mp3')"
        >download and store local file</Button
      >
      <Button @click="writeSecretFile">Write File</Button>
      <Button @click="deleteSecretFile">Delete File</Button>
      <Button @click="readDir">read dir</Button>
      <Button @click="readSecretFile">read content</Button>
      <audio
        v-if="currentFile?.data"
        :src="`data:audio/mpeg;base64,${currentFile?.data}`"
        controls
        autoplay
      >
        The “audio” tag is not supported by your browser.
      </audio>
    </div>
  </div>
</template>

<style lang="scss">
.file-system {
}
</style>
