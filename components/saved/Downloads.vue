<template>
  <section class="downloads">
    <div class="empty flex flex-column gap-3 text-center mt-8">
      <FileSystem />

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
        link
        class="underline"
        size="small"
        @click="navigateTo('/browse')"
      />
    </div>
  </section>
</template>
