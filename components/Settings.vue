<script setup>
import { onMounted } from "vue"
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
  toggleAskNotificationPermissions,
  initializeStationList,
  //toSystemSettings,
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
  useGlobalToast,
} from "~/composables/states.ts"
import { Preferences } from "@capacitor/preferences"
import { localUserProfileKey } from "~/composables/globals"
import { updateLiveStream } from "~/composables/data/liveStream"
import useOneSignal from "~/composables/useOneSignal"
const globalToast = useGlobalToast()
const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const textSizeOptions = useTextSizeOption()
const editProfileSideBar = useEditProfileSideBar()
const isLiveStream = useIsLiveStream()
const isApp = useIsApp()
const accountDeleteSideBar = useAccountDeleteSideBar()

const allCurrentStations = useAllCurrentStations()
const client = useSupabaseClient()

const defaultStreamRef = ref(null)
const textSizeRef = ref(null)

//const isApple = currentUser.value?.app_metadata?.provider === 'apple'
//const isGoogle = currentUser.value?.app_metadata?.provider === 'google'
const isEmail = currentUser.value?.app_metadata?.provider === "email"
const isDisabled = computed(() => {
  return currentUser.value?.app_metadata?.provider !== "email"
})

const { toggleOneSignalUserTag, masterNotificationChannelsArray } = useOneSignal()

// main function to update the toast component
const showMessage = (mySeverity = "success", myMessage = "Settings updated.") => {
  globalToast.value = {
    severity: mySeverity,
    summary: myMessage,
    life: 3000,
  }
}

// handles updating the profile settings in supabase and local storage
const updateProfile = async (newProfile) => {
  // update supabase and local storage
  if (currentUser.value && newProfile) {
    const { error } = await client
      .from("profiles")
      .upsert({
        id: currentUser.value.id,
        updated_at: new Date().toISOString(),
        name: newProfile.name,
        // pronouns: pronouns.value,
        // continuous_play: continuousPlay.value,
        default_live_stream: newProfile.default_live_stream,
        dark_mode: newProfile.dark_mode,
        receive_general_notifications: newProfile.receive_general_notifications,
        one_signal_notification_channels: newProfile.one_signal_notification_channels,
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
    const currentUserProfileSTRING = JSON.stringify(newProfile)
    await Preferences.set({
      key: localUserProfileKey,
      value: currentUserProfileSTRING,
    })
    setTimeout(() => {
      showMessage()
    }, 1000)
  }
}

const tempEmail = shallowRef(currentUser.value?.email)

// handles setting the font size and tracking the event
const onUpdateTextSize = (data) => {
  setFontSize(data.pixel)
  trackClickEvent("Click Tracking - Test size", "Settings Sidebar - Display", data.label)
}

// handles tracking the station change event
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

// fire edit profile sidebar if the user clicks on a field
const editField = (field) => {
  if (!isDisabled.value) {
    editProfileSideBar.value = true
    trackClickEvent(
      "Click Tracking - edit user profile",
      "Settings Sidebar - Account",
      `${field} field clicked`
    )
  }
}
// handles the dropdown menu click event
const clickThisMenu = (ref) => {
  ref.toggleDrawer()
}

// handles the notification switch change event
const handleNotificationChange = async (e) => {
  await toggleAskNotificationPermissions()
  trackClickEvent(
    "Click Tracking - General notification switch",
    "Settings Sidebar - Notifications",
    e
  )
}

// handles the notification channel switch change events
const handleNotificationChannelChange = (channel) => {
  const key = channel.key
  const val = currentUserProfile.value.one_signal_notification_channels.find(
    (c) => c.key === channel.key
  ).value

  trackClickEvent(
    "Click Tracking - Notification Channel switch",
    "Settings Sidebar - Notifications",
    `${key}: ${val}`
  )
  // update the user tag in OneSignal
  toggleOneSignalUserTag(key, val)

  //supabase user profile is updated by the watch that triggers updateProfile()
}

// handle the delete account sidebar when the user clicks on the delete account link
const onDeleteAccountClick = () => {
  trackClickEvent(
    "Click Tracking - delete account",
    "Delete Account Sidebar - user section"
  )
  accountDeleteSideBar.value = true
}

// show the notification types section if the user has notifications enabled, is an app, and the topics are available
const showNotificationTypes = computed(() => {
  return (
    isApp &&
    currentUserProfile.value?.receive_general_notifications &&
    masterNotificationChannelsArray.value?.length > 0
  )
})

watch(
  currentUserProfile,
  (newProfile, oldProfile) => {
    if (oldProfile) updateProfile(newProfile)
  },
  { deep: true, immediate: false }
)
</script>

<template>
  <div class="settings -mt-2">
    <div class="user pl-4 pb-6 md:pl-0">
      <SUser
        :disabled="isDisabled"
        :isEmail="isEmail"
        size="xlarge"
        text-size="text-lg md:text-4xl lg:text-5xl"
      />
    </div>
    <section v-if="currentUser" class="user-preferences p-0">
      <div class="flex s-title-holder">
        <i :class="`${accountHeader.icon}`"></i>
        <div class="s-title">{{ accountHeader.label }}</div>
      </div>
      <div class="block md:hidden">
        <SBox
          v-if="currentUserProfile?.name"
          label="Name"
          @click="editField('name')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">{{ currentUserProfile?.name }}</p>
        </SBox>
        <SBox
          label="Email"
          @click="editField('email')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">{{ tempEmail }}</p>
        </SBox>
        <SBox
          label="Password"
          v-if="isEmail"
          @click="editField('password')"
          :clickable="!isDisabled"
          :ripple="!isDisabled"
        >
          <p :class="[{ disabled: isDisabled }]">*********</p>
        </SBox>
      </div>
      <!-- >= md break point -->
      <div class="hidden md:flex account-info mb-6 grid grid-lggutter mobile-lggutter">
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Name</p>
                <p>{{ currentUserProfile?.name }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField()"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">
                  Email <span><i :class="`${accountHeader.icon}`"></i></span>
                </p>
                <p>{{ currentUserProfile?.email }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField()"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Password</p>
                <p class="mt-2">••••••••••</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="editField()"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Member Center Section -->
    <section v-if="currentUser" class="member-center p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Member Center</div>
      </div>

      <SBoxEmpty :clickable="false" :ripple="false" class="py-2">
        <MemberCenter />
      </SBoxEmpty>
    </section>

    <section class="listening-preferences p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Listening Preferences</div>
      </div>
      <SBox
        v-if="currentUserProfile && allCurrentStations?.length > 0"
        label="Default stream"
        class="md:hidden cursor-pointer"
        @click="clickThisMenu(defaultStreamRef)"
      >
        <DropupMenu
          ref="defaultStreamRef"
          v-model="currentUserProfile.default_live_stream"
          :options="initializeStationList(allCurrentStations)"
          optionLabel="station"
          placeholder="Select a station"
          label="Default stream"
          width="auto"
          @change="onUpdateStation"
          blockClick
          checkMark
        />
      </SBox>
      <div class="hidden md:flex account-info mb-6 grid grid-lggutter">
        <div class="col-12 md:col-6">
          <div class="card">
            <div class="flex justify-content-between flex-wrap align-items-end">
              <div>
                <p class="font-bold">Default Stream</p>
                <p>{{ currentUserProfile?.default_live_stream }}</p>
              </div>
              <Button
                v-if="!isDisabled"
                severity="secondary"
                variant="link"
                class="link -mb-1 -ml-2"
                @click="clickThisMenu(defaultStreamRef)"
                label="Update"
                size="small"
              ></Button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section v-if="isApp" class="notifications p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Notifications</div>
      </div>
      <SBox label="Allow Notifications" :ripple="false">
        <VToggleSwitch
          yes="ON"
          no="OFF"
          v-model:data="currentUserProfile.receive_general_notifications"
          @change="handleNotificationChange"
        />
      </SBox>
    </section>
    <section v-if="showNotificationTypes" class="notifications p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Notification Types</div>
      </div>

      <SBox
        v-for="channel in masterNotificationChannelsArray"
        :label="channel.label"
        :description="channel.description"
        :key="channel.key"
        :ripple="false"
      >
        <VToggleSwitch
          yes="ON"
          no="OFF"
          v-model:data="
            currentUserProfile.one_signal_notification_channels.find(
              (c) => c.key === channel.key
            ).value
          "
          @change="handleNotificationChannelChange(channel)"
        />
      </SBox>
      <!-- 
      <SBox
        label="System options"
        :ripple="true"
        @click="
          () => {
            toSystemSettings()
            trackClickEvent(
              'Click Tracking - System options',
              'Settings Sidebar',
              'System options'
            )
          }
        "
      ></SBox> -->
    </section>
    <section v-if="isApp" class="display p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Display</div>
      </div>
      <!-- <pre class="text-xs">{{ currentUserProfile }}</pre> -->
      <SBox label="Text size" class="cursor-pointer" @click="clickThisMenu(textSizeRef)">
        <DropupMenu
          ref="textSizeRef"
          id="text-size"
          v-model="currentUserProfile.text_size"
          :options="textSizeOptions"
          optionLabel="label"
          placeholder="Select a Text Size"
          label="Text Size"
          width="auto"
          blockClick
          checkMark
          @change="onUpdateTextSize"
        />
      </SBox>
      <SBox label="Dark theme" :ripple="false">
        <VToggleSwitch
          yes="ON"
          no="OFF"
          v-model:data="currentUserProfile.dark_mode"
          @change="
            () => {
              setDarkMode(currentUserProfile.dark_mode)
              trackClickEvent(
                'Click Tracking - Dark theme',
                'Settings Sidebar - Display',
                currentUserProfile.dark_mode
              )
            }
          "
        />
      </SBox>
    </section>
    <section v-if="isApp" class="wnyc p-0">
      <div class="flex s-title-holder">
        <div class="s-title">WNYC</div>
      </div>
      <!-- <SBox
        label="Member Center"
        link="https://pledge.wnyc.org/user/email-link"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Member Center',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox> -->
      <SBox
        label="Donate"
        :link="config.public.SETTINGS_MENU_DONATION_URL"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent('Click Tracking - Donate', 'Settings Sidebar - links', link)
          }
        "
      ></SBox>
      <SBox
        label="Submit app feedback"
        link="https://www.surveymonkey.com/r/wnyc-app-feedback-settings-menu"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Submit app feedback',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Get tech support"
        link="https://newyorkpublicradio.my.site.com/wnyc/s/topic/0TO5f0000009Eq7GAE/website-app-help"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Get tech support',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Contact us"
        link="https://newyorkpublicradio.my.site.com/wnyc/s/"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Contact Us',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        v-if="currentUser"
        :is-route="true"
        label="Delete account"
        :ripple="false"
        @click="onDeleteAccountClick"
      >
      </SBox>
    </section>
    <section v-if="isApp" class="footer mb-4">
      <WnycLogo style="fill: var(--bw-toggle)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings {
  @include media(">=md") {
    padding: 0.75rem 1.5rem;
  }
  section {
    margin-bottom: 30px;
  }

  .s-title-holder {
    margin-bottom: 1rem;

    .s-title {
      @include font-config($type-header2);
      @include media("<md") {
        font-size: 1rem;
        padding: 0 1.25rem;
      }
    }

    .pi {
      color: var(--p-text-color);
    }
  }

  .user-preferences {
    p.disabled {
      opacity: 60%;
      cursor: default !important;
      pointer-events: none;
      user-select: none;
    }
  }

  .footer {
    text-align: center;

    .wnyc-logo {
      width: 60px;
      height: auto;
      margin-bottom: 10px;
      fill: var(--p-surface-950);
    }
  }

  .p-inplace {
    .p-inplace-display {
      @include font-config($type-paragraph1);
    }
  }

  .p-button.p-button-icon-only {
    width: 2.357rem;
    padding: 0.5rem 0;
  }

  .settings-message {
    position: absolute;
    top: calc(env(safe-area-inset-top) + 40px);
    left: 0;
    right: 0;
  }
  .card {
    background: var(--p-surface-0);
    border-radius: 10px;
    padding: 2rem 1.5rem;
    @include media("<md") {
      padding: 1rem 1.5rem;
    }
  }
}
</style>

<style lang="scss">
.settings {
  .p-inplace {
    margin-right: -1rem;
    width: 80%;

    .p-inplace-display {
      width: 100%;
      position: relative;
      display: block;
      text-align: right;
      @include font-config($type-paragraph1);
    }

    .p-inplace-content {
      display: flex;
      justify-content: flex-end;

      .p-inputtext {
        // text-align: right;
        // width: 100%;
        @include font-config($type-paragraph1);
      }
    }
  }

  .p-button.p-button-icon-only {
    width: 2.357rem;
    padding: 0.5rem 0;
  }
}
</style>
