<script setup>
import { goToEpisodePage, goToStoryPage, trackClickEvent } from "~/utilities/helpers"
import {
  playStoredMp3,
  deleteDirectory /* , formatFileSize */,
} from "~/utilities/file-system"
import {
  useFileSystem,
  useFileSystemLS,
  useIsNetworkConnected,
} from "~/composables/states"

/* import { mediaTypes } from "~/composables/globals" */

const fileSystem = useFileSystem()
const fileSystemLS = useFileSystemLS()
const isNetworkConnected = useIsNetworkConnected()

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

const handleRoute = (file) => {
  console.log("huh")
  if (isNetworkConnected.value) {
    console.log("isNetworkConnected.value", isNetworkConnected.value)
    switch (file.type) {
      case mediaTypes.EPISODE:
      case mediaTypes.SEGMENT:
        //goToEpisodePage(file, `downloaded=true&id=${file.id}`)
        goToEpisodePage(file)
        break
      case mediaTypes.ARTICLE:
        goToStoryPage(file, `downloaded=true&id=${file.id}&src=${file.cmsSource}`)
        //goToStoryPage(file)
        break
      default:
        console.log("handleRoute", file)
    }
  }
}

const handlePlay = (file) => {
  console.log("play")
  playStoredMp3(file)
  // GA tracking
  trackClickEvent(
    "Click Tracking - Audio file download",
    "Episode Item",
    `playing = ${file.directoryAudio.name}`
  )
}
const handleDelete = (file) => {
  deleteDirectory(file)
  // GA tracking
  trackClickEvent(
    "Click Tracking - Audio file delete",
    "Episode Item",
    `deleting = ${file.directoryAudio.name}`
  )
}
</script>

<template>
  <div>
    <div class="file-system">
      <!--  <p>Saved files:</p>
      <p>!!Storage limit: {{ used }} of {{ granted }}</p> -->
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
            <Button :label="String(file.id)" @click="playStoredMp3(file)" />
            <Button icon="pi pi-trash" @click="deleteDirectory(file)" />
          </li>
        </ul>
        <div class="flex flex-column gap-4 mt-2">
          <EpisodeItem
            v-for="file in fileSystemLS"
            :data="file"
            :key="`EI-${file.id}`"
            isDownloaded
            @on-click="handleRoute(file)"
          >
            <div class="flex gap-2">
              <Button
                icon="pi pi-trash"
                text
                rounded
                aria-label="delete"
                @click="handleDelete(file)"
              />
              <PlayButton
                label=""
                :file="file.directoryAudio.name"
                @onClick="handlePlay(file)"
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
