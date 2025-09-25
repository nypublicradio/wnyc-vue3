<script setup>
import VUploadImage from "~/components/supabase/VUploadImage.vue"
import UserIcon from "~/components/icons/UserIcon.vue"
import {
  useSettingSideBar,
  useLoginSideBar,
  useSignupSideBar,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states.ts"
import { trackClickEvent, logOutUser } from "~/utilities/helpers"
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
  size: {
    type: String,
    default: "large",
  },
  textSize: {
    type: String,
    default: "",
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

const user = await client.auth.getSession()
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
  await logOutUser()

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

const avatarUrl = computed(() => {
  return (
    user.value?.data?.user?.user_metadata?.avatar_url ||
    currentUser.value?.user_metadata?.avatar_url ||
    currentUserProfile.value?.avatar_image_url ||
    null
  )
})
</script>

<template>
  <div class="s-user flex gap-3">
    <Avatar
      :image="avatarUrl"
      :size="props.size"
      :style="`
        cursor: ${props.disabled ? 'default' : 'pointer'};
      `"
      shape="circle"
      @click="handleModal"
    >
      <template #icon v-if="!avatarUrl">
        <UserIcon />

        <i
          v-if="currentUser && props.isEmail"
          class="pi pi-plus"
          aria-label="upload image plus icon"
        />
      </template>
    </Avatar>
    <i
      v-if="avatarUrl && currentUser && props.isEmail"
      class="pi pi-plus"
      aria-label="upload image plus icon"
    />
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
        :maxFileSize="8500000"
        :userId="`${currentUserProfile?.name}-${currentUser?.id}`"
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
      <h2 :class="props.textSize">Hi, {{ currentUserProfile?.name }}</h2>
      <VFlexibleLink to="/home" class="p1" @click="onLogOut">Log out</VFlexibleLink>
    </div>
    <div v-else class="info flex flex-column gap-3 mt-2">
      <h2>You are logged out.</h2>
      <Button label="Log in" rounded @click="onLogIn" class="w-9rem" aria-label="login" />

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
    position: relative;
    flex: none;
    background-color: #ffffff;
    color: var(--p-surface-950);
    .pi-plus {
      font-size: 0.5rem;
      position: absolute;
      background-color: var(--p-primary-500);
      padding: 3px;
      line-height: normal;
      border-radius: 10px;
      left: -3px;
      bottom: -3px;
      font-weight: var(--font-weight-900);
      color: var(--p-surface-0) !important;
      pointer-events: none;
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
