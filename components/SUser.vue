<script setup>
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
import VUploadImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VUploadImage.vue"
import UserIcon from "~/components/icons/UserIcon.vue"
import {
  useSettingSideBar,
  useLoginSideBar,
  useSignupSideBar,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states.ts"
import { trackClickEvent, getAndSetUserProfile } from "~/utilities/helpers"
import { useToast } from "primevue/usetoast"

const toast = useToast()

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  isEmail: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:data", "onDisabled"])

const settingsSideBar = useSettingSideBar()
const loginSideBar = useLoginSideBar()
const signupSideBar = useSignupSideBar()

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const imageUploadModal = shallowRef(false)

// actions to be taken with the log in button is clicked
const onLogIn = () => {
  loginSideBar.value = true
  trackClickEvent(
    "Click Tracking - login button",
    "Settings Sidebar - user section",
    "login button"
  )
}
// actions to be taken with the log out button is clicked
const onLogOut = async () => {
  // sign out from supabase
  await client.auth.signOut()
  //const { error } = await client.auth.signOut()
  // if (error) {
  //   alert('Error logging out')
  // }

  // set the currentUser composable to null
  currentUser.value = null

  getAndSetUserProfile()

  settingsSideBar.value = false

  //GTM
  trackClickEvent(
    "Click Tracking - logout button",
    "Settings Sidebar - user section",
    "logout button"
  )

  // show toast
  toast.add({
    severity: "success",
    summary: "You have logged out.",
    life: 3000,
  })
}
// actions to be taken with the sign up link is clicked
const onSignUp = () => {
  signupSideBar.value = true
  trackClickEvent(
    "Click Tracking - sign up link",
    "Settings Sidebar - user section",
    "sign up link"
  )
}
// handles the modal on avatar image when clicked
const handleModal = () => {
  if (!props.disabled) {
    imageUploadModal.value = true
    trackClickEvent(
      "Click Tracking - Avatar Image link",
      "Settings Sidebar - user section",
      "request to upload image"
    )
  } else {
    emit("onDisabled")
  }
}
</script>

<template>
  <div class="s-user flex gap-3">
    <Avatar
      :image="currentUserProfile?.avatar_image_url"
      size="large"
      :style="`
        cursor: ${props.disabled ? 'default' : 'pointer'};
      `"
      shape="circle"
      @click="handleModal"
    >
      <template #icon v-if="!currentUserProfile?.avatar_image_url">
        <UserIcon />

        <Button
          v-if="currentUser && props.isEmail"
          icon="pi pi-plus"
          severity="secondary"
          rounded
          aria-label="upload image"
        />
      </template>
    </Avatar>
    <Dialog
      v-model:visible="imageUploadModal"
      modal
      header="Your Profile Image"
      :draggable="false"
    >
      <VUploadImage
        :image="currentUserProfile?.avatar_image_url"
        :currentUser="currentUser"
        :currentUserProfile="currentUserProfile"
        :client="client"
        :config="config"
        :maxFileSize="2500000"
        @close-dialog="() => (imageUploadModal = false)"
        @imageUploaded="
          (imageUrl) => {
            currentUserProfile.avatar_image_url = imageUrl
            trackClickEvent(
              'Event Tracking - VUloadImage',
              'Settings Sidebar - user section',
              `image uploaded and saved: ${imageUrl}`
            )
          }
        "
      />
    </Dialog>
    <div v-if="currentUser" class="info flex flex-column gap-2 mt-2">
      <h2>Hi, {{ currentUserProfile.name }}</h2>
      <VFlexibleLink to="/home" class="p1" @click="onLogOut">Log out</VFlexibleLink>
    </div>
    <div v-else class="info flex flex-column gap-3 mt-2">
      <h2>You are logged out.</h2>
      <Button
        label="Log in"
        rounded
        @click="onLogIn"
        class="w-9rem"
        aria-label="login button"
      />

      <p>
        Don't have an account yet?
        <VFlexibleLink to="#" @click="onSignUp"> Sign up </VFlexibleLink>
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.s-user {
  .p-avatar {
    width: 40px;
    height: 40px;
    position: relative;
    flex: none;
    background-color: #ffffff;
    color: var(--night--500);
    border-radius: 50%;
    .p-button {
      position: absolute;
      transform: scale(0.5);
      left: -15px;
      bottom: -10px;
      &:before {
        font-weight: 900;
      }
    }
  }
}
</style>

<style lang="scss">
.s-user {
  .p-avatar {
    img {
      object-fit: cover;
    }
  }
}
</style>
