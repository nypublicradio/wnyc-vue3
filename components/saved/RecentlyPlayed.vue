<template>
  <section class="recently-played">
    <saved-dynamic-list table="recently_viewed">
      <div class="empty flex flex-column gap-3 text-center mt-8">
        <h2>You haven't listened to anything...yet!</h2>

        <p class="max-w-15rem m-auto">
          Your most recently played content will appear here.
        </p>

        <Button
          label="Listen to the live stream"
          link
          class="underline"
          size="small"
          @click="navigateTo('/live')"
        />
      </div>
    </saved-dynamic-list>
  </section>
</template>

<style lang="scss" scoped>
.recently-played {
}
</style>
