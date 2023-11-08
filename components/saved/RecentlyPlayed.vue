<script setup>
import { useCurrentUser } from '~/composables/states'
const user = useCurrentUser()
const client = useSupabaseClient()

const list = ref(null)

if (user.value) {
  let { data: recently_viewed, error } = await client
    .from('recently_viewed')
    .select('*')
    .eq('uid', user.value.id)
  list.value = recently_viewed
}
</script>

<template>
  <section class="recently-played">
    <div v-if="list" class="text-center mt-8">
      <h2 class="mb-4">Recently Played:</h2>
      <div v-for="(item, index) in list" :key="index">
        {{ item }}
      </div>
    </div>
    <div v-else class="empty flex flex-column gap-3 text-center mt-8">
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
  </section>
</template>

<style lang="scss" scoped>
.recently-played {
}
</style>
