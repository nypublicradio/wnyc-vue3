<script setup>
const user = useCurrentUser()
</script>
<template>
  <section v-if="user" class="recently-played">
    <saved-dynamic-list table="recently_viewed" :isSaveHistory="false">
      <template #empty>
        <saved-empty
          icon="Headphones"
          linkText="Listen to the live stream"
          linkRoute="/live"
        >
          You haven’t listened to anything... yet! Your most
          <strong>recently played</strong> content will appear here
        </saved-empty>
      </template>
    </saved-dynamic-list>
  </section>
  <section v-else class="recently-played">
    You must be logged in to see your recently played.
  </section>
</template>
