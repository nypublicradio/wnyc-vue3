<script setup>
import {
  playStoredMp3,
  deleteStoredMp3,
  updateFileSystem,
  formatFileSize,
} from "~/utilities/file-system"
import { useFileSystem /* useFileSystemLS */ } from "~/composables/states"
const fileSystem = useFileSystem()
const fileSystemLS = useFileSystemLS()

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

onMounted(() => {
  // initial read the CapacitorJS FileSystme and update the fileSystem state
  updateFileSystem()
})
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
            <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
          </li>
        </ul> -->
        <ul class="">
          <li v-for="file in fileSystemLS" :key="`LS-${file.title}`">
            <Button
              :label="`${file.name} - ${formatFileSize(file.size)}`"
              @click="playStoredMp3(file)"
            />
            <Button icon="pi pi-trash" @click="deleteStoredMp3(file)" />
          </li>
        </ul>
        <EpisodeItem
          v-for="file in fileSystemLS"
          :data="file"
          :key="file.id"
          @onClick="goToEpisodePage(file)"
        />
      </div>
      <div class="grid">
        <!-- <pre class="col-6 text-left">FileSystem = {{ fileSystem.files }}</pre> -->
        <pre class="col-6 text-left">fileSystemLS = {{ fileSystemLS }}</pre>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.file-system {
}
</style>
