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
  route: {
    type: String,
    default: "/login",
  },
  loggedInRoute: {
    type: String,
    default: "/dashboard",
  },
})
const emit = defineEmits(["emit-click"])

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
</script>
<template>
  <VFlexibleLink
    class="login-signup-btn"
    :class="{ 'user-logged-in': currentUser }"
    raw
    :to="currentUser ? props.loggedInRoute : props.route"
    @flexible-link-click="
      () => {
        emit('emit-click')
        trackClickEvent(
          `Click Tracking - ${props.label} up Button`,
          props.trackingLocation,
          `${props.label} up Button`
        )
      }
    "
  >
    <Button
      :label="`${currentUser ? 'Hi, ' + currentUserProfile.name : props.label}`"
      :aria-label="`${props.label} up button`"
      severity="secondary"
      size="small"
      variant="link"
    >
      <template #icon>
        <UserIcon />
      </template>
    </Button>
  </VFlexibleLink>
</template>
