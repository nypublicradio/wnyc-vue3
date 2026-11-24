import { computed, watch } from "vue"
import { useDialog } from "primevue/usedialog"
import { Preferences } from "@capacitor/preferences"
import {
  trackClickEvent,
  setFontSize,
  toggleAskNotificationPermissions,
  getCustomStationLabel,
} from "~/utilities/helpers"
import {
  useAllCurrentStations,
  useTextSizeOption,
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
  useIsLiveStream,
  useIsApp,
  useAccountDeleteSideBar,
  useSettingSideBar,
  useGlobalToast,
  useMasterNotificationChannelsArray,
} from "~/composables/states"
import { localUserProfileKey } from "~/composables/globals"
import { updateLiveStream } from "~/composables/data/liveStream"
import useOneSignal from "~/composables/useOneSignal"
import { useMembership } from "~/composables/useMembership"
import { useBreakpoints } from "~/composables/useBreakpoints"

// state and handlers for the Settings view; saves every profile change to supabase (logged in) or local preferences
export const useProfileSetting = () => {
  const globalToast = useGlobalToast()
  const currentUser = useCurrentUser()
  const currentUserProfile = useCurrentUserProfile()
  const textSizeOptions = useTextSizeOption()
  const editProfileSideBar = useEditProfileSideBar()
  const isLiveStream = useIsLiveStream()
  const isApp = useIsApp()
  const { isMobileBreakpoint } = useBreakpoints()
  const accountDeleteSideBar = useAccountDeleteSideBar()
  const settingSideBar = useSettingSideBar()
  const masterNotificationChannelsArray = useMasterNotificationChannelsArray()
  const allCurrentStations = useAllCurrentStations()
  const client = useSupabaseClient()
  const dialog = useDialog()
  const { dialogProps } = useMembership()

  const isEmail = computed(
    () => currentUser.value?.app_metadata?.provider === "email"
  )
  const isDisabled = computed(() => !isEmail.value)

  // Only initialize OneSignal on client-side to avoid SSR errors
  let toggleOneSignalUserTag = null
  if (process.client) {
    toggleOneSignalUserTag = useOneSignal().toggleOneSignalUserTag
  }

  const showMessage = (
    mySeverity = "success",
    myMessage = "Settings updated."
  ) => {
    globalToast.value = {
      severity: mySeverity,
      summary: myMessage,
      life: 3000,
    }
  }

  const updateProfile = async (newProfile) => {
    if (currentUser.value && newProfile) {
      const { error } = await client
        .from("profiles")
        .upsert({
          id: currentUser.value.id,
          updated_at: new Date().toISOString(),
          name: newProfile.name,
          default_live_stream: newProfile.default_live_stream,
          continuous_play: newProfile.continuous_play,
          dark_mode: newProfile.dark_mode,
          receive_general_notifications:
            newProfile.receive_general_notifications,
          one_signal_notification_channels:
            newProfile.one_signal_notification_channels,
          text_size: newProfile.text_size,
          autodownload: newProfile.autodownload,
        })
        .match({ id: currentUser.value.id })
      if (error) {
        showMessage("error", "Settings update failed.")
      } else {
        showMessage()
      }
    } else {
      await Preferences.set({
        key: localUserProfileKey,
        value: JSON.stringify(newProfile),
      })
      setTimeout(() => {
        showMessage()
      }, 1000)
    }
  }

  const tempEmail = computed(() => currentUser.value?.email)

  const onUpdateTextSize = (data) => {
    setFontSize(data.pixel)
    trackClickEvent(
      "Click Tracking - Test size",
      "Settings Sidebar - Display",
      data.label
    )
  }

  const onUpdateStation = (data) => {
    // if not playing, update the live stream so the home page updates with the new default stream
    if (!isLiveStream.value) {
      updateLiveStream(data.slug)
    }
    trackClickEvent(
      "Click Tracking - Default stream",
      "Settings Sidebar - Listening Preferences",
      data.station
    )
  }

  const accountHeader = computed(() => {
    switch (currentUser.value?.app_metadata?.provider) {
      case "google":
        return {
          label: "Google Account",
          icon: "mr-2 pi pi-google",
          type: "google",
        }
      case "apple":
        return { label: "Apple Account", icon: "mr-2 pi pi-apple", type: "apple" }
      default:
        return { label: "Account", icon: "", type: null }
    }
  })

  // edit profile dialog for web and sidebar for app
  const editField = async (field) => {
    if (!isDisabled.value) {
      if (isMobileBreakpoint.value) {
        editProfileSideBar.value = true
      } else {
        const { default: EditProfile } = await import(
          "~/components/EditProfile.vue"
        )

        const dialogRef = dialog.open(EditProfile, {
          props: dialogProps,
          emits: {
            onClose: () => {
              dialogRef.close()
            },
          },
        })
      }
      trackClickEvent(
        "Click Tracking - edit user profile",
        "Settings Sidebar - Account",
        `${field} field clicked`
      )
    }
  }

  const handleNotificationChange = async (e) => {
    await toggleAskNotificationPermissions()
    trackClickEvent(
      "Click Tracking - General notification switch",
      "Settings Sidebar - Notifications",
      e
    )
  }

  // the profile itself is saved by the watch below
  const handleNotificationChannelChange = (channel) => {
    if (!currentUserProfile.value?.one_signal_notification_channels) return

    const key = channel.key
    const val = currentUserProfile.value.one_signal_notification_channels.find(
      (c) => c.key === channel.key
    )?.value

    trackClickEvent(
      "Click Tracking - Notification Channel switch",
      "Settings Sidebar - Notifications",
      `${key}: ${val}`
    )
    toggleOneSignalUserTag(key, val)
  }

  const onDeleteAccountClick = () => {
    trackClickEvent(
      "Click Tracking - delete account",
      "Delete Account Sidebar - user section"
    )
    accountDeleteSideBar.value = true
  }

  const onUpdateContinuousPlay = () => {
    trackClickEvent(
      "Click Tracking - Continuous play",
      "Settings Sidebar - Listening Preferences",
      currentUserProfile.value?.continuous_play
    )
  }

  const showNotificationTypes = computed(() => {
    return (
      isApp.value &&
      currentUserProfile.value?.receive_general_notifications &&
      masterNotificationChannelsArray.value?.length > 0 &&
      Array.isArray(currentUserProfile.value?.one_signal_notification_channels)
    )
  })

  const customDefaultStationLabel = computed(() => {
    return getCustomStationLabel(currentUserProfile.value?.default_live_stream)
  })

  // app-only nav buttons at the top of the settings sidebar
  const onNavButtons = (route) => {
    navigateTo(route)

    trackClickEvent(
      "Click Tracking - app settings nav button",
      "Settings Sidebar - nav buttons",
      route
    )
    settingSideBar.value = false
  }

  // skips the null -> profile transition so loading a profile does not save it back
  watch(
    currentUserProfile,
    (newProfile, oldProfile) => {
      if (oldProfile) updateProfile(newProfile)
    },
    { deep: true, immediate: false }
  )

  return {
    currentUser,
    currentUserProfile,
    isApp,
    allCurrentStations,
    textSizeOptions,
    masterNotificationChannelsArray,
    isEmail,
    isDisabled,
    tempEmail,
    accountHeader,
    showNotificationTypes,
    customDefaultStationLabel,
    editField,
    onUpdateTextSize,
    onUpdateStation,
    onUpdateContinuousPlay,
    handleNotificationChange,
    handleNotificationChannelChange,
    onDeleteAccountClick,
    onNavButtons,
  }
}
