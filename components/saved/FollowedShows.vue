<script setup>
const user = useCurrentUser()
</script>
<template>
  <section v-if="user" class="followed-shows">
    <saved-dynamic-list
      typeFilter="show"
      table="favorited"
      headerTitle="Latest From My Followed Shows"
    >
      <template #empty>
        <saved-empty
          icon="FollowIcon"
          linkText="Browse Shows"
          linkRoute="/browse"
        >
          Use the <strong>follow</strong> button to follow your favorite shows
          —the latest episodes will appear here.
        </saved-empty>
      </template>
      <template #recent-episodes="slotProps">
        <saved-fetch-recent-episodes :show="slotProps.show" />
      </template>
    </saved-dynamic-list>

    <!-- <div class="up-to-date flex flex-column gap-3 text-center mt-8">
      <h2>You're up to date!</h2>

      <FaceGraphic alt="happy face illustration" class="w-6rem m-auto my-4" />
      <p class="px-4">
        It feels great to be informed...<br />
        check back tomorrow for the latest.
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
    </div> -->
  </section>
  <section v-else class="followed-shows">
    You must be logged in to see your followed shows.
  </section>
</template>

<style lang="scss">
.followed-shows {
  .show {
    .flex {
      align-items: center;
    }
    .v-image,
    .v-image-wrapper {
      width: 84px !important;
      height: 84px !important;
      @include media("<md") {
        width: 70px !important;
        height: 70px !important;
      }
    }
  }
}
</style>
