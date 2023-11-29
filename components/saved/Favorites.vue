<script setup>
  const user = useCurrentUser()
</script>
<template>
  <section v-if="user" class="favorites">
    <saved-dynamic-list table="favorited">
      <div class="empty flex flex-column gap-3 text-center mt-8">
        <h2>Favorites will appear here!</h2>
        <div class="max-w-15rem m-auto">
          <p class="line-height-3">
            Use the <strong>favorite</strong> button
            <StarIcon class="w-2rem -mb-3" />
          </p>
          <p class="line-height-3">
            to save your favorite episodes, articles and more— so you can return to them
            over and over.
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
    </saved-dynamic-list>
  </section>
  <section v-else class="favorites"> 
    You must be logged in to see your favorites.
  </section>
</template>

<style lang="scss" scoped>
.favorites {
}
</style>
