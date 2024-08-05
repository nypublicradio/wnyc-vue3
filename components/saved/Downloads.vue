<script setup>
import { useFileSystemLS } from "~/composables/states"
//import { deleteAll } from "~/utilities/file-system"
const fileSystemLS = useFileSystemLS()
</script>

<template>
  <section class="downloads">
    <div class="empty flex flex-column gap-3">
      <pre class="text-xs"><code>{{ fileSystemLS.directory }}</code></pre>
      <!-- <Button
        class="w-3 ml-auto"
        label="Delete all"
        icon="pi pi-trash"
        size="small"
        aria-label="delete all downloads"
        @click="deleteAll()"
      /> -->
      <FileSystem v-if="fileSystemLS.length > 0" />

      <div v-else class="text-center">
        <h2>Downloads will appear here!</h2>
        <div class="max-w-15rem m-auto">
          <p class="line-height-3">
            Use the <strong>download</strong> button
            <DownloadIcon class="w-2rem -mb-2" />
          </p>
          <p class="line-height-3">
            to save content for offline listening when you’re on the go.
          </p>
        </div>
        <Button
          label="Browse Shows"
          text
          severity="secondary"
          class="underline"
          size="small"
          aria-label="browse shows"
          @click="navigateTo('/browse')"
        />
      </div>
    </div>
  </section>
</template>
