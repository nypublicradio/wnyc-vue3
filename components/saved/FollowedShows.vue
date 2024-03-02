<script setup>
const user = useCurrentUser()
</script>
<template>
  <section v-if="user" class="followed-shows">
    <saved-dynamic-list typeFilter="show" table="favorited">
      <template #empty>
        <div class="empty flex flex-column gap-3 text-center mt-8">
          <h2>Followed shows will appear here!</h2>
          <div class="max-w-15rem m-auto">
            <p class="line-height-3">
              Use the <strong>follow</strong> button
              <FollowIcon class="w-2rem -mb-2" />
            </p>
            <p class="line-height-3">
              to follow your favorite shows — the latest episodes will appear here.
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
      </template>
      <template #recent-episodes="slotProps">
        <saved-fetch-recent-episodes :show="slotProps.show" />
      </template>
    </saved-dynamic-list>

    <div class="up-to-date flex flex-column gap-3 text-center mt-8">
      <h2>You're up to date!</h2>
      <img src="/face.svg" alt="happy face illustration" class="w-6rem m-auto my-4" />
      <p class="px-4">
        It feels great to be informed...<br />
        check back tomorrow for the latest.
      </p>

      <Button
        label="Listen to the live stream"
        text
        severity="secondary"
        class="underline"
        size="small"
        @click="navigateTo('/live')"
      />
    </div>
  </section>
  <section v-else class="followed-shows">
    You must be logged in to see your followed shows.
  </section>
</template>

<style lang="scss" scoped>
.followed-shows {
}
</style>
