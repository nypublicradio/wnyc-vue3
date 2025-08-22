<script setup>
import { onMounted } from "vue"
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
  toggleAskNotificationPermissions,
  getAndSetUserProfile,
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
import { useProfileApi } from "~/composables/useProfileApi"
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
const stationsMenuData = ref([])
const client = useSupabaseClient()

const defaultStreamRef = ref(null)
const textSizeRef = ref(null)

//const isApple = currentUser.value?.app_metadata?.provider === 'apple'
//const isGoogle = currentUser.value?.app_metadata?.provider === 'google'
const isEmail = currentUser.value?.app_metadata?.provider === "email"
const isDisabled = computed(() => {
  return !isEmail
})

const { toggleOneSignalUserTag, masterNotificationChannelsArray } = useOneSignal()
const { profile: profileData, loading: isLoading, error, fetchProfile, formatCurrency, formatDate } = useProfileApi()

// main function to update the toast component
const showMessage = (mySeverity = "success", myMessage = "Settings updated.") => {
  globalToast.value = {
    severity: mySeverity,
    summary: myMessage,
    life: 3000,
  }
}

// formats the station list for the dropdown
const initializeStationList = (val) => {
  const tempMenuData = []

  val.forEach((station) => {
    tempMenuData.push({
      id: station.station,
      label: station.station,
      name: station.title,
      station: station.station,
      code: station.title,
      slug: station.slug,
      image: station.image,
      times: `${station.timeStart} - ${station.timeEnd}`,
    })
  })
  stationsMenuData.value = tempMenuData
}
// handles updating the profile settings in supabase and local storage
const updateProfile = async () => {
  // update supabase and local storage
  if (currentUser.value && currentUserProfile.value) {
    await client
      .from("profiles")
      .upsert({
        id: currentUser.value.id,
        updated_at: new Date().toISOString(),
        name: currentUserProfile.value.name,
        // pronouns: pronouns.value,
        // continuous_play: continuousPlay.value,
        default_live_stream: currentUserProfile.value.default_live_stream,
        dark_mode: currentUserProfile.value.dark_mode,
        receive_general_notifications:
          currentUserProfile.value.receive_general_notifications,
        one_signal_notification_channels:
          currentUserProfile.value.one_signal_notification_channels,
        text_size: currentUserProfile.value.text_size,
        autodownload: currentUserProfile.value.autodownload,
      })
      .match({ id: currentUser.value.id })
    if (error) {
      showMessage("error", "Settings update failed.")
    } else {
      showMessage()
    }
  } else {
    const currentUserProfileSTRING = JSON.stringify(currentUserProfile.value)
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

onMounted(async () => {
  await initializeStationList(allCurrentStations.value)
  
  // Fetch user profile if user is authenticated
  if (currentUser.value) {
    await getAndSetUserProfile()
    
    // Fetch profile data from /api/profile if user has a Salesforce ID
    if (currentUserProfile.value?.salesforce_id) {
      await fetchProfile(currentUserProfile.value.salesforce_id)
    } else if (currentUser.value?.email) {
      // Try email lookup if no Salesforce ID is available
      await fetchProfile(undefined, currentUser.value.email)
    }
  }
})

watch(currentUserProfile.value, () => {
  updateProfile()
})

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
    currentUserProfile.value.receive_general_notifications &&
    masterNotificationChannelsArray.value.length > 0 &&
    isApp.value
  )
})
</script>

<template>
  <div class="settings -mt-2">
    <section class="user">
      <SUser :disabled="isDisabled" :isEmail="isEmail" />
    </section>
    <section v-if="currentUser" class="user-preferences p-0">
      <div class="flex s-title-holder">
        <i :class="`${accountHeader.icon}`"></i>
        <div class="s-title">{{ accountHeader.label }}</div>
      </div>
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
    </section>
    
    <!-- Member Profile Section -->
    <section v-if="currentUser && profileData" class="member-profile p-0">
      <div class="flex s-title-holder">
        <i class="mr-2 pi pi-user"></i>
        <div class="s-title">Member Profile</div>
      </div>
      
      <SBox label="Member Name" :ripple="false">
        <p>{{ profileData.name || 'N/A' }}</p>
      </SBox>
      
      <SBox label="Active Sustainer" :ripple="false">
        <p :class="profileData.isActiveSustainer ? 'text-green-600' : 'text-gray-500'">
          {{ profileData.isActiveSustainer ? 'Yes' : 'No' }}
        </p>
      </SBox>
      
      <SBox v-if="profileData.lastDonationDate" label="Last Donation" :ripple="false">
        <div class="text-right">
          <p>{{ formatDate(profileData.lastDonationDate) }}</p>
          <p v-if="profileData.lastDonationAmount" class="text-sm opacity-75">
            {{ formatCurrency(profileData.lastDonationAmount) }}
          </p>
        </div>
      </SBox>
      
      <div v-if="profileData.activeRecurringDonations && profileData.activeRecurringDonations.length > 0">
        <SBox 
          v-for="(donation, index) in profileData.activeRecurringDonations" 
          :key="donation.springboardId"
          :label="`Active Donation ${index + 1}`" 
          :ripple="false"
        >
          <div class="text-right">
            <p class="font-medium">{{ donation.brand }}</p>
            <p>{{ formatCurrency(donation.amount) }}</p>
            <p class="text-sm opacity-75">Next charge: {{ formatDate(donation.nextChargeDate) }}</p>
            <p class="text-xs opacity-60">Member since: {{ formatDate(donation.membershipStartDate) }}</p>
          </div>
        </SBox>
      </div>
    </section>
    
    <!-- Loading state for member profile -->
    <section v-else-if="currentUser && isLoading" class="member-profile p-0">
      <div class="flex s-title-holder">
        <i class="mr-2 pi pi-user"></i>
        <div class="s-title">Member Profile</div>
      </div>
      <SBox label="Loading member data..." :ripple="false">
        <div class="flex justify-end">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
      </SBox>
    </section>
    
    <!-- Error state for member profile -->
    <section v-else-if="currentUser && error" class="member-profile p-0">
      <div class="flex s-title-holder">
        <i class="mr-2 pi pi-user"></i>
        <div class="s-title">Member Profile</div>
      </div>
      <SBox label="Unable to load member data" :ripple="false">
        <p class="text-red-500 text-right">{{ error }}</p>
      </SBox>
    </section>
    
    <section class="listening-preferences p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Listening Preferences</div>
      </div>
      <SBox
        label="Default stream"
        class="cursor-pointer"
        @click="clickThisMenu(defaultStreamRef)"
      >
        <DropupMenu
          ref="defaultStreamRef"
          id="default-stream"
          v-model="currentUserProfile.default_live_stream"
          :options="stationsMenuData"
          optionLabel="station"
          placeholder="Select a station"
          label="Default stream"
          width="auto"
          @change="onUpdateStation"
          blockClick
          checkMark
        />
      </SBox>
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
    <section class="display p-0">
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
    <section class="wnyc p-0">
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
    <section class="footer mb-4">
      <WnycLogo style="fill: var(--bw-toggle)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.settings {
  section {
    margin-bottom: 30px;
  }

  .s-title-holder {
    padding: 0 1.25rem;
    margin-bottom: 8px;

    .s-title {
      font-size: 13px;
      text-transform: uppercase;
      opacity: 0.7;
      color: var(--p-text-color);
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

  .member-profile {
    .text-green-600 {
      color: #059669;
    }
    
    .text-gray-500 {
      color: #6b7280;
    }
    
    .text-red-500 {
      color: #dc2626;
    }
    
    .text-right {
      text-align: right;
    }
    
    .text-sm {
      font-size: 0.875rem;
    }
    
    .text-xs {
      font-size: 0.75rem;
    }
    
    .opacity-75 {
      opacity: 0.75;
    }
    
    .opacity-60 {
      opacity: 0.6;
    }
    
    .font-medium {
      font-weight: 500;
    }
    
    .flex {
      display: flex;
    }
    
    .justify-end {
      justify-content: flex-end;
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
