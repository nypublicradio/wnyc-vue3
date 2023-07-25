<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import UserIcon from '~/components/icons/UserIcon.vue'
import { ref } from 'vue'
import { useSettingsData } from '~/composables/states.ts'
import { trackClickEvent } from '~/utilities/helpers'
const props = defineProps({
  data: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:data'])
const settingsData = useSettingsData()

const internalData = ref(props.data)

// manages the logged in and logged out state
const toggleLogged = () => {
  navigateTo('/login')
  internalData.value = !internalData.value
  emit('update:data', internalData.value)
  trackClickEvent(
    'Click Tracking - login and logout button',
    'Settings Sidebar - user section',
    internalData.value ? 'logged in' : 'logged out'
  )
}
</script>

<template>
  <div class="s-user flex gap-3">
    <Avatar
      :image="settingsData.profileimage"
      size="large"
      style="background-color: #ffffff; color: var(--night--500)"
      shape="circle"
    >
      <template #icon v-if="!settingsData.profileimage">
        <UserIcon />
      </template>
    </Avatar>
    <div v-if="internalData" class="info flex flex-column gap-2 mt-2">
      <h2>Hi, {{ settingsData.name }}</h2>
      <VFlexibleLink class="p1" to="#" @click="toggleLogged()"
        >Log out</VFlexibleLink
      >
    </div>
    <div v-else class="info flex flex-column gap-3 mt-2">
      <h2>You are logged out.</h2>
      <Button label="Log in" rounded @click="toggleLogged()" class="w-9rem" />

      <p>
        Don't have an account yet?
        <VFlexibleLink
          to="/"
          @click="
            trackClickEvent(
              'Click Tracking - sign up link',
              'Settings Sidebar - user section',
              'sign up'
            )
          "
          >Sign up</VFlexibleLink
        >
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
