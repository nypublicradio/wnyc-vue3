<script setup>
import { onMounted } from "vue"
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
  toggleAskNotificationPermisstions,
} from "~/utilities/helpers"
import {
  useAllCurrentStations,
  useTextSizeOption,
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
  useIsLiveStream,
  useIsApp,
} from "~/composables/states.ts"
import VInputSwitch from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VInputSwitch.vue"
import { Preferences } from "@capacitor/preferences"
import { localUserProfileKey } from "~/composables/globals"
import { updateLiveStream } from "~/composables/data/liveStream"
const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const textSizeOptions = useTextSizeOption()
const editProfileSideBar = useEditProfileSideBar()
const isLiveStream = useIsLiveStream()
const isApp = useIsApp()

const allCurrentStations = useAllCurrentStations()
const stationsMenuData = ref([])
const client = useSupabaseClient()

//const isApple = currentUser.value?.app_metadata?.provider === 'apple'
//const isGoogle = currentUser.value?.app_metadata?.provider === 'google'
const isEmail = currentUser.value?.app_metadata?.provider === "email"
const isDisabled = computed(() => {
  return !isEmail
})

const isMessage = shallowRef(false)
const severity = shallowRef("success")
const theMessage = shallowRef("Settings updated")

// main function to update the message component
const showMessage = async (mySverity = "success", myMessage = "Settings updated.") => {
  isMessage.value = false
  await nextTick()
  isMessage.value = true
  severity.value = mySverity
  theMessage.value = myMessage
}

// formats the station list for the dropdown
const initializeStationList = (val) => {
  const tempMenuData = []

  val.forEach((station) => {
    tempMenuData.push({
      label: station.title,
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

const updateProfile = async () => {
  // update supabase and local storage
  if (currentUser.value && currentUserProfile.value) {
    const { error } = await client
      .from("profiles")
      .upsert({
        id: currentUser.value.id,
        updated_at: new Date().toISOString(),
        name: currentUserProfile.value.name,
        // pronouns: pronouns.value,
        // continuous_play: continuousPlay.value,
        default_live_stream: currentUserProfile.value.default_live_stream.station,
        dark_mode: currentUserProfile.value.dark_mode,
        receive_general_notifications:
          currentUserProfile.value.receive_general_notifications,
        text_size: currentUserProfile.value.text_size.label,
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
})

watch(currentUserProfile.value, () => {
  updateProfile()
})

// handles setting the font size and tracking the event
const onUpdateTextSize = () => {
  setFontSize(currentUserProfile.value.text_size.pixel)

  trackClickEvent(
    "Click Tracking - Test size",
    "Settings Sidebar - Display",
    currentUserProfile.value.text_size.label
  )
}

// handles tracking the station change event
const onUpdateStation = () => {
  trackClickEvent(
    "Click Tracking - Default stream",
    "Settings Sidebar - Listening Preferences",
    currentUserProfile.value.default_live_stream.station
  )
  // if not playing, update the live stream so the home page updates with the new default stream
  if (!isLiveStream.value) {
    updateLiveStream(currentUserProfile.value.default_live_stream.slug)
  }
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

const clickThisId = (id) => {
  document.getElementById(id).click()
}

// handles the notification switch change event
const handleNotificationChange = async (e) => {
  await toggleAskNotificationPermisstions(e)
  trackClickEvent(
    "Click Tracking - General switch",
    "Settings Sidebar - Notifications",
    currentUserProfile.receive_general_notifications
  )
}
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
      >
        <p :class="[{ disabled: isDisabled }]">{{ currentUserProfile?.name }}</p>
      </SBox>
      <SBox label="Email" @click="editField('email')" :clickable="!isDisabled">
        <p :class="[{ disabled: isDisabled }]">{{ tempEmail }}</p>
      </SBox>
      <SBox
        label="Password"
        v-if="isEmail"
        @click="editField('password')"
        :clickable="!isDisabled"
      >
        <p :class="[{ disabled: isDisabled }]">*********</p>
      </SBox>
    </section>
    <section class="listening-preferences p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Listening Preferences</div>
      </div>
      <SBox label="Default stream" @labelClick="clickThisId('default-stream')">
        <DropupMenu
          id="default-stream"
          v-model:data.sync="currentUserProfile.default_live_stream"
          :options="stationsMenuData"
          optionLabel="station"
          placeholder="Select a station"
          label="Default stream"
          width="80%"
          class="-mr-2"
          @change="onUpdateStation"
        />
      </SBox>
    </section>
    <section v-if="isApp" class="notifications p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Notifications</div>
      </div>
      <SBox label="General" :ripple="false">
        <VInputSwitch
          yes="ON"
          no="OFF"
          static-width
          v-model:data.sync="currentUserProfile.receive_general_notifications"
          @change="handleNotificationChange"
        />
      </SBox>
    </section>
    <section class="display p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Display</div>
      </div>
      <SBox label="Text size" @labelClick="clickThisId('text-size')">
        <DropupMenu
          id="text-size"
          v-model:data.sync="currentUserProfile.text_size"
          :options="textSizeOptions"
          optionLabel="label"
          placeholder="Select a Text Size"
          label="Text Size"
          width="80%"
          class="-mr-2"
          @change="onUpdateTextSize"
        />
      </SBox>
      <SBox label="Dark theme" :ripple="false">
        <VInputSwitch
          yes="ON"
          no="OFF"
          static-width
          v-model:data.sync="currentUserProfile.dark_mode"
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
        link="https://newyorkpublicradio.my.site.com/wnyc/s/website-or-app-support"
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
        v-if="!isDisabled"
        label="Delete account"
        link="delete"
        :ripple="false"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Delete account',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
    </section>
    <section class="footer mb-4">
      <WnycLogo style="fill: var(--night)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section>
    <Transition name="zoom">
      <Message
        v-if="isMessage"
        class="settings-message"
        :severity="severity"
        :closable="false"
        :sticky="false"
        >{{ theMessage }}</Message
      >
    </Transition>
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
      color: var(--text-color);
    }
    .pi {
      color: var(--text-color);
    }
  }
  .user {
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
      fill: var(--night-500);
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
        text-align: right;
        width: 100%;
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
