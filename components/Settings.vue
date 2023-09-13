<script setup>
import { onMounted } from 'vue'
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
} from '~/utilities/helpers'
import {
  useAllCurrentStations,
  useTextSizeOption,
  useCurrentUser,
  useCurrentUserProfile,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsEpisodePlaying,
  useEditProfileSideBar,
} from '~/composables/states.ts'
import VInputSwitch from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VInputSwitch.vue'
import {
  updateAllLiveStreams,
  updateLiveStream,
} from '~/composables/data/liveStream'
import { Preferences } from '@capacitor/preferences'

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const textSizeOptions = useTextSizeOption()
const editProfileSideBar = useEditProfileSideBar()

const allCurrentStations = useAllCurrentStations()
const stationsMenuData = ref([])
const client = useSupabaseClient()

const isApple = currentUser.value?.app_metadata?.provider === 'apple'
const isGoogle = currentUser.value?.app_metadata?.provider === 'google'
const isEmail = currentUser.value?.app_metadata?.provider === 'email'
const isDisabled = computed(() => {
  return !isEmail
})

const isMessage = shallowRef(false)
const severity = shallowRef('success')
const theMessage = shallowRef('Settings updated')

// main function to update the message component
const showMessage = async (
  mySverity = 'success',
  myMessage = 'Settings updated.'
) => {
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

  if (currentUser.value) {
    const { error } = await client
      .from('profiles')
      .upsert({
        id: currentUser.value.id,
        updated_at: new Date().toISOString(),
        name: currentUserProfile.value.name,
        // pronouns: pronouns.value,
        // continuous_play: continuousPlay.value,
        default_live_stream:
          currentUserProfile.value.default_live_stream.station,
        dark_mode: currentUserProfile.value.dark_mode,
        receive_general_notifications:
          currentUserProfile.value.receive_general_notifications,
        text_size: currentUserProfile.value.text_size.label,
        autodownload: currentUserProfile.value.autodownload,
      })
      .match({ id: currentUser.value.id })
    if (error) {
      showMessage('error', 'Settings update failed.')
    } else {
      showMessage()
    }
  } else {
    const currentUserProfileSTRING = JSON.stringify(currentUserProfile.value)
    await Preferences.set({
      key: 'localUserProfile',
      value: currentUserProfileSTRING,
    })
    setTimeout(() => {
      showMessage()
    }, 1000)
  }
}

const tempPassword = shallowRef('')
const tempEmail = shallowRef(currentUser.value?.email)

// update the user's email with a message to confirm the change in an email
const updateUserEmail = async () => {
  const { error } = await client.auth.updateUser({
    email: tempEmail.value,
  })

  if (error) {
    showMessage('error', `Email update failed: ${error}`)
  } else {
    showMessage('success', 'A confirmation email has been sent to your inbox.')
    trackClickEvent(
      'Click Tracking - Email',
      'Settings Sidebar - Account',
      'Email confirmation sent'
    )
  }
}

// update the user's password
const updateUserPassword = async () => {
  const { error } = await client.auth.updateUser({
    password: tempPassword.value,
  })

  if (error) {
    showMessage('error', `Password update failed: ${error}`)
  } else {
    showMessage('success', 'Password updated.')
    trackClickEvent(
      'Click Tracking - Password',
      'Settings Sidebar - Account',
      'Password updated'
    )
  }
}

onMounted(async () => {
  await updateAllLiveStreams()
  await initializeStationList(allCurrentStations.value)
})

watch(currentUserProfile.value, () => {
  updateProfile()
})

// handles setting the font size and tracking the event
const onUpdateTextSize = () => {
  setFontSize(currentUserProfile.value.text_size.pixel)

  trackClickEvent(
    'Click Tracking - Test size',
    'Settings Sidebar - Display',
    currentUserProfile.value.text_size.label
  )
}

let initialNoPlayToggleFlag = false
// handles tracking the station change event
const onUpdateStation = async (event) => {
  await updateLiveStream(event.value.slug)

  if (isEpisodePlaying.value || initialNoPlayToggleFlag) {
    initialNoPlayToggleFlag = true
    currentEpisode.value = currentEpisodeHolder.value
  }

  trackClickEvent(
    'Click Tracking - Default stream',
    'Settings Sidebar - Listening Preferences',
    currentUserProfile.value.default_live_stream
  )
}

console.log('currentUser = ', currentUser.value)

const accountHeader = computed(() => {
  switch (currentUser.value?.app_metadata?.provider) {
    case 'google':
      return {
        label: 'Google Account',
        icon: 'mr-2 pi pi-google',
        type: 'google',
      }
    case 'apple':
      return { label: 'Apple Account', icon: 'mr-2 pi pi-apple', type: 'apple' }
    default:
      return { label: 'Account', icon: '', type: null }
  }
})

const editField = (field) => {
  if (!isDisabled.value) {
    editProfileSideBar.value = true
  }
}
</script>

<template>
  <div class="settings">
    <section class="user">
      <SUser :disabled="isDisabled" />
    </section>
    <section v-if="currentUser" class="user-preferences p-0">
      <div class="flex s-title-holder">
        <i :class="`${accountHeader.icon}`"></i>
        <div class="s-title">{{ accountHeader.label }}</div>
      </div>
      <SBox label="Name" @click="editField('name')">
        <p :class="[{ disabled: isDisabled }]">{{ currentUserProfile.name }}</p>
      </SBox>
      <SBox label="Email" @click="editField('email')">
        <p :class="[{ disabled: isDisabled }]">{{ tempEmail }}</p>
      </SBox>
      <SBox label="Password" v-if="isEmail" @click="editField('password')">
        <p :class="[{ disabled: isDisabled }]">*********</p>
      </SBox>
    </section>
    <section class="listening-preferences p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Listening Preferences</div>
      </div>
      <SBox label="Autodownload">
        <VInputSwitch
          yes="ON"
          no="OFF"
          static-width
          v-model:data="currentUserProfile.autodownload"
          @change="
            () => {
              trackClickEvent(
                'Click Tracking - Autodownload switch',
                'Settings Sidebar - Listening Preferences',
                currentUserProfile.autodownload
              )
            }
          "
        />
      </SBox>
      <SBox label="Default stream">
        <SDropdown
          v-model:data="currentUserProfile.default_live_stream"
          :options="stationsMenuData"
          optionLabel="station"
          @change="onUpdateStation"
        />
      </SBox>
    </section>
    <section class="notifications p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Notifications</div>
      </div>
      <SBox label="General">
        <VInputSwitch
          yes="ON"
          no="OFF"
          static-width
          v-model:data="currentUserProfile.receive_general_notifications"
          @change="
            () => {
              trackClickEvent(
                'Click Tracking - General switch',
                'Settings Sidebar - Notifications',
                currentUserProfile.receive_general_notifications
              )
            }
          "
        />
      </SBox>
    </section>
    <section class="display p-0">
      <div class="flex s-title-holder">
        <div class="s-title">Display</div>
      </div>
      <SBox label="Text size">
        <SDropdown
          v-model:data="currentUserProfile.text_size"
          :options="textSizeOptions"
          @change="onUpdateTextSize"
        />
      </SBox>
      <SBox label="Dark theme">
        <VInputSwitch
          yes="ON"
          no="OFF"
          static-width
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
      <SBox
        label="About WNYC"
        link="/about"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - About WNYC',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Submit Feedback"
        link="https://newyorkpublicradio.my.site.com/wnyc/s/"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Submit Feedback',
              'Settings Sidebar - links',
              link
            )
          }
        "
      ></SBox>
      <SBox
        label="Contact Us"
        link="https://newyorkpublicradio.my.site.com/wnyc/s/"
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
        label="Donate"
        link="https://pledge.wnyc.org/support/wnyc?utm_medium=redirect&utm_source=wnyc&utm_campaign=default&"
        @linkClick="
          (link) => {
            trackClickEvent(
              'Click Tracking - Donate',
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
      <p>Version X.X.XX (XXXXXX)</p>
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
