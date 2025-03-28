<script lang="ts" setup>
import { setDarkMode } from "~/utilities/helpers"
import { useCurrentUserProfile } from "~/composables/states"
const currentUserProfile = useCurrentUserProfile()
// toggle dark mode
const toggle = () => {
  currentUserProfile.value.dark_mode = !currentUserProfile.value.dark_mode
  setDarkMode(currentUserProfile.value.dark_mode)
}
</script>

<template>
  <Button :icon="`pi ${currentUserProfile.dark_mode ? 'pi-sun' : 'pi-moon'}`" aria-label="dark mode toggle button"
    severity="secondary" size="small" variant="link" @click="toggle" />
</template>
