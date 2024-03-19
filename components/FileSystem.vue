<script setup>
import { goToEpisodePage, goToStoryPage, trackClickEvent } from "~/utilities/helpers"
import { deleteDirectory } from "~/utilities/file-system"
import {
  //useFileSystem,
  useFileSystemLS,
  useIsNetworkConnected,
  useGlobalToast,
} from "~/composables/states"

import { mediaTypes } from "~/composables/globals"

//const fileSystem = useFileSystem()
const fileSystemLS = useFileSystemLS()
const isNetworkConnected = useIsNetworkConnected()

// const used = ref(0)
// const granted = ref(0)

// get the used and granted storage
// watch(
//   fileSystem,
//   (/* value */) => {
//     navigator.webkitPersistentStorage.queryUsageAndQuota((usedBytes, grantedBytes) => {
//       //console.log('we are using ', usedBytes, ' of ', grantedBytes, 'bytes')
//       used.value = usedBytes
//       granted.value = grantedBytes
//     })
//   },
//   { deep: true }
// )

// handle the routing of the stored audio file IF network is connected
const handleRoute = (file) => {
  if (isNetworkConnected.value) {
    switch (file.type) {
      case mediaTypes.EPISODE:
      case mediaTypes.SEGMENT:
        goToEpisodePage(file)
        break
      case mediaTypes.ARTICLE:
        goToStoryPage(file, { downloaded: "true", id: file.id, src: file.cmsSource })
        break
      default:
        console.log("handleRoute", file)
    }
  } else {
    const globalToast = useGlobalToast()
    globalToast.value = {
      severity: "error",
      summary: "Not connected. Try again later.",
      life: 3000,
      closable: true,
    }
  }
}

// handle the delete of the stored audio file and GA tracking
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
      <!-- <p>!!Storage limit: {{ used }} of {{ granted }}</p> -->
      <div>
        <div class="flex flex-column-reverse gap-4 mt-2">
          <EpisodeItem
            v-for="file in fileSystemLS"
            :data="file"
            :key="`EI-${file.id}`"
            isDownloaded
            @on-click="handleRoute(file)"
          >
            <div class="flex gap-2 z-2">
              <Button
                icon="pi pi-trash"
                text
                rounded
                aria-label="delete"
                @click="handleDelete(file)"
              />
            </div>
          </EpisodeItem>
        </div>
      </div>
    </div>
  </div>
</template>
