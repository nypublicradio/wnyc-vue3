<script setup>
import { usePendingLocalNotifications } from "~/utilities/local-notifications"
import { useCurrentUserProfile } from "~/composables/states"
const pendingLocalNotifications = usePendingLocalNotifications()
const currentUserProfile = useCurrentUserProfile()
const props = defineProps({
  entry: {
    type: Object,
    default: null,
  },
})

const checkNotificationsList = computed(() => {
  if (currentUserProfile.value.receive_general_notifications) {
    return pendingLocalNotifications.value?.notifications.some(
      (notification) => notification.extra.id === props.entry.id
    )
  } else {
    return false
  }
})
</script>
<template>
  <svg
    role="img"
    aria-label="notification icon"
    class="notification-icon o-icon"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 28 28"
  >
    <title>Notification</title>

    <g v-if="!checkNotificationsList">
      <path
        d="M14.28 20.76H5.38C5.27 20.76 5.21 20.69 5.18 20.66C5.13 20.59 5.12 20.5 5.16 20.39C5.18 20.35 5.26 20.28 5.38 20.28H5.47C6.66 20.28 7.63 19.31 7.63 18.12V12.74C7.63 11.13 8.26 9.62002 9.39 8.49002C10.52 7.36002 12.04 6.73002 13.64 6.73002C14.1 6.73002 14.58 6.78002 15.04 6.89002C17.71 7.49002 19.65 10.01 19.65 12.9V13.34C19.9 13.31 20.15 13.29 20.4 13.29C20.65 13.29 20.9 13.31 21.15 13.34V12.9C21.15 9.52002 18.98 6.45002 15.77 5.54002C15.79 5.45002 15.8 5.35002 15.8 5.24002C15.8 4.05002 14.83 3.08002 13.64 3.08002C12.45 3.08002 11.48 4.05002 11.48 5.24002C11.48 5.36002 11.49 5.46002 11.51 5.55002C8.4 6.47002 6.12 9.34002 6.12 12.75V18.13C6.12 18.49 5.83 18.79 5.46 18.79H5.37C4.65 18.79 3.98 19.22 3.74 19.9C3.31 21.12 4.2 22.27 5.37 22.27H11.48C11.48 22.27 11.48 22.29 11.48 22.3C11.48 23.49 12.45 24.46 13.64 24.46C14.43 24.46 15.11 24.03 15.49 23.4C14.9 22.64 14.47 21.75 14.28 20.77V20.76Z"
        fill="currentColor"
      />
      <path
        d="M24.3 18.73H21.15V15.58H19.65V18.73H16.5V20.23H19.65V23.38H21.15V20.23H24.3V18.73Z"
        fill="currentColor"
      />
    </g>
    <g v-else>
      <path
        d="M14.18 19.54C14.18 16.09 16.98 13.29 20.43 13.29C20.68 13.29 20.93 13.31 21.18 13.34V12.9C21.18 9.52002 19.01 6.45002 15.8 5.54002C15.82 5.45002 15.83 5.35002 15.83 5.24002C15.83 4.05002 14.86 3.08002 13.67 3.08002C12.48 3.08002 11.51 4.05002 11.51 5.24002C11.51 5.36002 11.52 5.46002 11.54 5.55002C8.43 6.47002 6.15 9.34002 6.15 12.75V18.13C6.15 18.49 5.86 18.79 5.49 18.79H5.4C4.68 18.79 4.01 19.22 3.77 19.9C3.34 21.12 4.23 22.27 5.4 22.27H11.51C11.51 22.27 11.51 22.29 11.51 22.3C11.51 23.49 12.48 24.46 13.67 24.46C14.46 24.46 15.14 24.03 15.52 23.4C14.69 22.34 14.19 21.01 14.19 19.56L14.18 19.54Z"
        fill="currentColor"
      />
      <path d="M24.33 18.73H16.53V20.23H24.33V18.73Z" fill="currentColor" />
    </g>
  </svg>
</template>

<style lang="scss" scoped>
.notification-icon {
  height: 28px;
  width: 28px;
}
</style>
