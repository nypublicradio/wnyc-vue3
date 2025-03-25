<script lang="ts" setup>
import { trackClickEvent } from "~/utilities/helpers"
import { useCurrentUser, useCurrentUserProfile } from "~/composables/states"

const props = defineProps({
  label: {
    type: String,
    default: "Log in/Sign up",
  },
  trackingLocation: {
    type: String,
    default: "Header",
  },
})

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
</script>
<template>
  <VFlexibleLink
    class="login-signup-btn"
    :class="{ 'user-logged-in': currentUser }"
    raw
    to="/login"
    @flexible-link-click="
      trackClickEvent(
        `Click Tracking - ${props.label} up Button`,
        props.trackingLocation,
        `${props.label} up Button`
      )
    "
  >
    <Button
      :label="`${currentUser ? 'Hi, ' + currentUserProfile.name : props.label}`"
      :aria-label="`${props.label} up button`"
      severity="secondary"
      size="small"
      variant="link"
      :disabled="currentUser"
    >
      <template #icon>
        <UserIcon />
      </template>
    </Button>
  </VFlexibleLink>
</template>

<style lang="scss" scoped>
.login-signup-btn {
  .p-button {
    opacity: 1;
  }
}
</style>
