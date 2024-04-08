<script setup>
const user = useCurrentUser()
</script>
<template>
  <section v-if="user" class="recently-played">
    <saved-dynamic-list table="recently_viewed" :isSaveHistory="false">
      <template #empty>
        <div class="empty flex flex-column gap-3 text-center mt-8">
          <h2>You haven't listened to anything...yet!</h2>

          <p class="max-w-15rem m-auto">
            Your most recently played content will appear here.
          </p>

          <Button
            label="Listen to the live stream"
            aria-label="Listen to the live stream"
            text
            severity="secondary"
            class="underline"
            size="small"
            @click="navigateTo('/live')"
          />
        </div>
      </template>
    </saved-dynamic-list>
  </section>
  <section v-else class="recently-played">
    You must be logged in to see your recently played.
  </section>
</template>

<style lang="scss" scoped>
.recently-played {
}
</style>
