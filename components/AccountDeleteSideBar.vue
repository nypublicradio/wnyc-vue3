<script setup>
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
import { requestAccountDeletion } from "~/utilities/helpers"
import { useAccountDeleteSideBar, useCurrentUserProfile } from "~/composables/states.ts"

const accountDeleteSideBar = useAccountDeleteSideBar()
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <div class="account-delete-sidebar">
    <section>
      <SHeader label="Are you sure?" @close-sidebar="accountDeleteSideBar = false" />
    </section>
    <section class="flex flex-column">
      <p class="text-base mb-0">
        Are you sure you want to delete your WNYC account? You will be logged off and your
        saved content will be lost.
      </p>
      <div class="text-center">
        <div class="s-user my-8">
          <Avatar
            v-if="currentUserProfile?.avatar_image_url"
            :image="currentUserProfile?.avatar_image_url"
            size="large"
            shape="circle"
          />
          <div v-else class="p-avatar">
            <DeleteUserIcon />
          </div>
        </div>
        <Button class="px-8 mb-4" @click="requestAccountDeletion()" label="Delete" />
        <div class="mb-4 w-6 m-auto">
        <p>
          <VFlexibleLink to="#" @click="accountDeleteSideBar = false"> Go back </VFlexibleLink>
        </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.s-user {
  .p-avatar {
    width: 123px;
    height: 123px;
    position: relative;
    flex: none;
    background-color: #ffffff;
    color: var(--night--500);
    border-radius: 50%;
    img {
      object-fit: cover;
    }
    svg {
      width: 80%;
      height: 80%;
    }
  }
}
</style>
