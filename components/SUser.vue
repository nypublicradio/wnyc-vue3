<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import UserIcon from '~/components/icons/UserIcon.vue'
import {
  useSettingSideBar,
  useCurrentUser,
  useCurrentUserProfile,
  useLocalUserProfileDefault,
} from '~/composables/states.ts'
import { trackClickEvent, setDisplaySettings } from '~/utilities/helpers'

const settingsSideBar = useSettingSideBar()
const emit = defineEmits(['update:data'])
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const localUserProfileDefault = useLocalUserProfileDefault()

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
console.log('currentUser = ', currentUser.value)
console.log('currentUserProfile = ', currentUserProfile.value)
</script>

<template>
  <div class="s-user flex gap-3">
    <Avatar
      :image="currentUserProfile?.avatar_image_url"
      size="large"
      style="background-color: #ffffff; color: var(--night--500)"
      shape="circle"
    >
      <template #icon v-if="!currentUserProfile?.avatar_image_url">
        <UserIcon />
      </template>
    </Avatar>
    <div v-if="currentUser" class="info flex flex-column gap-2 mt-2">
      <h2>
        Hi, {{ currentUserProfile.first_name }}
        {{ currentUserProfile.last_name }}
      </h2>
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
