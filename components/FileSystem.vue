<script setup>
import { goToEpisodePage, goToStoryPage } from "~/utilities/helpers"
import { playStoredMp3, deleteDirectory, formatFileSize } from "~/utilities/file-system"
import { useFileSystem, useFileSystemLS, useCurrentEpisode } from "~/composables/states"
import { mediaTypes } from "~/composables/globals"
const currentEpisode = useCurrentEpisode()
const fileSystem = useFileSystem()
const fileSystemLS = useFileSystemLS()

const used = ref(0)
const granted = ref(0)

watch(
  fileSystem,
  (/* value */) => {
    navigator.webkitPersistentStorage.queryUsageAndQuota((usedBytes, grantedBytes) => {
      //console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes')
      used.value = usedBytes
      granted.value = grantedBytes
    })
  },
  { deep: true }
)

// const handleRoute = (file) => {
//   console.log("handleRoute", file)
//   switch (file.type) {
//     case mediaTypes.EPISODE:
//     case mediaTypes.SEGMENT:
//       goToEpisodePage(file, `downloaded=true&id=${file.id}`)
//       break
//     case mediaTypes.ARTICLE:
//       goToStoryPage(file, `downloaded=true&id=${file.id}&src=${file.cmsSource}`)
//       break
//     default:
//       console.log("handleRoute", file)
//   }
// }
</script>

<template>
  <div>
    <div class="file-system">
      <p>Saved files:</p>
      <p>!!Storage limit: {{ used }} of {{ granted }}</p>
      <div>
        <!--         <ul class="col-6">
          <li v-for="file in fileSystem.files" :key="file.name">
            <Button
              :label="`${file.name} - ${formatFileSize(file.size)}`"
              @click="playStoredMp3(file)"
            />
            <Button icon="pi pi-trash" @click="deleteDirectory(file)" />
          </li>
        </ul> -->
        <ul class="">
          <li v-for="file in fileSystemLS" :key="`LS-${file.title}`">
            <Button
              :label="`${file.id} - ${formatFileSize(file.directoryAudio.size)}`"
              @click="playStoredMp3(file)"
            />
            <Button icon="pi pi-trash" @click="deleteDirectory(file)" />
          </li>
        </ul>
        <div class="flex flex-column gap-4 mt-2">
          <EpisodeItem
            v-for="file in fileSystemLS"
            :data="file"
            :key="file.id"
            isDownloaded
          >
            <div class="flex gap-2">
              <Button
                icon="pi pi-trash"
                text
                rounded
                aria-label="delete"
                @click="deleteDirectory(file)"
              />
              <PlayButton
                label=""
                :file="file.directoryAudio.name"
                @onClick="playStoredMp3(file)"
              />
            </div>
          </EpisodeItem>
        </div>
      </div>
      <div class="grid">
        <pre class="col-6 text-left text-xs">fileSystem = {{ fileSystem }}</pre>
        <pre class="col-6 text-left text-xs">fileSystemLS = {{ fileSystemLS }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.file-system {
}
</style>
