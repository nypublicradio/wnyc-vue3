<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
//`import VUploadImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VUploadImage.vue'
import UserIcon from '~/components/icons/UserIcon.vue'
import {
  useSettingSideBar,
  useCurrentUser,
  useCurrentUserProfile,
  useLocalUserProfileDefault,
} from '~/composables/states.ts'
import { trackClickEvent, setDisplaySettings } from '~/utilities/helpers'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const settingsSideBar = useSettingSideBar()
const emit = defineEmits(['update:data'])
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const localUserProfileDefault = useLocalUserProfileDefault()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const imageUploadModal = ref(false)
const isDisabled = ref(props.disabled)

// actions to be taken with the log in button is clicked
const onLogIn = () => {
  navigateTo('/login')
  settingsSideBar.value = false
  trackClickEvent(
    'Click Tracking - login button',
    'Settings Sidebar - user section',
    ''
  )
}
// actions to be taken with the log out button is clicked
const onLogOut = async () => {
  const client = useSupabaseClient()

  // sign out from supabase
  const { error } = await client.auth.signOut()
  // if (error) {
  //     console.log('error')
  // }

  // set the currentUser composable to null
  currentUser.value = null

  // set the currentUserProfile composable to null
  currentUserProfile.value = null

  // reset the currentEpisode composable to the default
  currentUserProfile.value = localUserProfileDefault.value
  // set display settings
  setDisplaySettings(localUserProfileDefault.value)

  // clear localStorage
  //localStorage.clear()

  settingsSideBar.value = false
  trackClickEvent(
    'Click Tracking - logout button',
    'Settings Sidebar - user section',
    ''
  )
}
// actions to be taken with the sign up link is clicked
const onSignUp = () => {
  settingsSideBar.value = false
  trackClickEvent(
    'Click Tracking - sign up link',
    'Settings Sidebar - user section',
    ''
  )
}
//console.log('currentUser = ', currentUser.value)
//console.log('currentUserProfile = ', currentUserProfile.value)

const handleModal = () => {
  if (!isDisabled.value) {
    imageUploadModal.value = true
  }
  trackClickEvent(
    'Click Tracking - Avatar Image link',
    'Settings Sidebar - user section',
    'request to upload image'
  )
}
</script>

<template>
  <div class="s-user flex gap-3">
    <Avatar
      :image="currentUserProfile?.avatar_image_url"
      size="large"
      :style="`
        cursor: ${isDisabled ? 'default' : 'pointer'};
      `"
      shape="circle"
      @click="handleModal"
    >
      <template #icon v-if="!currentUserProfile?.avatar_image_url">
        <UserIcon />

        <Button
          v-if="currentUser"
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
      header="Upload Profile Image"
      :style="{ width: '80vw' }"
    >
      <VUploadImage
        style="padding: 40px"
        :image="currentUserProfile?.avatar_image_url"
        :currentUser="currentUser"
        :currentUserProfile="currentUserProfile"
        :client="client"
        :config="config"
        @imageUploaded="
          () => {
            trackClickEvent(
              'Event Tracking - VUloadImage',
              'Settings Sidebar - user section',
              'image uploaded and saved'
            )
          }
        "
      />
    </Dialog>
    <div v-if="currentUser" class="info flex flex-column gap-2 mt-2">
      <h2>Hi, {{ currentUserProfile.name }}</h2>
      <VFlexibleLink to="/home" class="p1" @click="onLogOut"
        >Log out</VFlexibleLink
      >
    </div>
    <div v-else class="info flex flex-column gap-3 mt-2">
      <h2>You are logged out.</h2>
      <Button label="Log in" rounded @click="onLogIn" class="w-9rem" />

      <p>
        Don't have an account yet?
        <VFlexibleLink to="/signup" @click="onSignUp"> Sign up </VFlexibleLink>
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
