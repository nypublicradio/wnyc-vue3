<script setup>
// if user is logged in, get all their favorites
const client = useSupabaseClient();
const favorites = ref(null);
const user = useCurrentUser();
if (user.value) {
  const { data, error } = await client
    .from("favorited")
    .select("*")
    .eq("uid", user.value.id)
    .neq("media_type", "show");
  if (data?.length > 0) {
    favorites.value = data;
  }
  if (error) {
    console.log("favorited items error", error);
  }
}
</script>

<template>
  <section class="favorites">
    <div v-if="favorites" class="text-center mt-8">
      <h2 class="mb-4">Favorites:</h2>
      <div v-for="(show, index) in favorites" :key="index">
        {{ show }}
      </div>
    </div>
    <div v-else class="empty flex flex-column gap-3 text-center mt-8">
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
  </section>
</template>

<style lang="scss" scoped>
.favorites {
}
</style>
