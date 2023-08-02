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
} from '~/composables/states.ts'
import VInputSwitch from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VInputSwitch.vue'
import { updateAllLiveStreams } from '~/composables/data/liveStream'

const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()

const textSizeOptions = useTextSizeOption()

const allCurrentStations = useAllCurrentStations()
const stationsMenuData = ref([])
const client = useSupabaseClient()

const isApple = currentUser.value?.app_metadata?.provider === 'apple'
const isDisabled = computed(() => {
  if (isApple) {
    return false
  } else if (currentUser.value?.app_metadata?.provider !== 'email') {
    return true
  } else {
    return false
  }
})

const isMessage = ref(false)
const severity = ref('success')
const theMessage = ref('Settings updated')

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
    //console.log('supabase update')
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
    //console.log('local storage update')
    localStorage.setItem(
      'localUserProfile',
      JSON.stringify(currentUserProfile.value)
    )
    setTimeout(() => {
      showMessage()
    }, 1000)
  }
}

const tempPassword = ref('')
const tempEmail = ref(currentUser.value?.email)

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

// handles tracking the station change event
const onUpdateStation = () => {
  trackClickEvent(
    'Click Tracking - Default stream',
    'Settings Sidebar - Listening Preferences',
    currentUserProfile.value.default_live_stream
  )
}

// handles the message when users click on the disabled fields
const onClickDisabled = () => {
  showMessage('warn', 'Your authentication provider controls this field.')
}
</script>

<template>
  <div class="settings m-2">
    <section class="user">
      <SUser :disabled="isDisabled" />
    </section>
    <section v-if="currentUser" class="user-preferences p-0">
      <div class="s-title">Account</div>
      <SBox label="Name">
        <SField
          label="Tap to add a name"
          :disabled="isDisabled"
          v-model:data="currentUserProfile.name"
          @onDisabled="onClickDisabled"
        />
      </SBox>
      <SBox label="Email">
        <SField
          label="Tap to add an email"
          email
          :disabled="isDisabled || isApple"
          v-model:data="tempEmail"
          @submit="updateUserEmail"
          @onDisabled="onClickDisabled"
        />
      </SBox>
      <SBox label="Password">
        <SField
          label="************"
          password
          :disabled="isDisabled || isApple"
          v-model:data="tempPassword"
          @submit="updateUserPassword"
          @onDisabled="onClickDisabled"
        />
      </SBox>
      <!-- v-model:data="currentUser?.password" -->
    </section>
    <section class="listening-preferences p-0">
      <div class="s-title">Listening Preferences</div>
      <SBox label="Autodownload">
        <VInputSwitch
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
      <div class="s-title">Notifications</div>
      <SBox label="General">
        <VInputSwitch
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
      <div class="s-title">Display</div>
      <SBox label="Text size">
        <SDropdown
          v-model:data="currentUserProfile.text_size"
          :options="textSizeOptions"
          @change="onUpdateTextSize"
        />
      </SBox>
      <SBox label="Dark theme">
        <VInputSwitch
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
      <SBox
        label="About WNYC"
        link="https://www.wnyc.org/"
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
        link="https://www.wnyc.org/"
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
        link="https://www.wnyc.org/"
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
        link="https://pledge.wnyc.org/support/wnyc?utm_source=wnyc&utm_medium=wnyc&utm_campaign=donate-button"
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
  .s-title {
    margin-bottom: 8px;
    padding: 0 1.25rem;
    font-size: 13px;
    text-transform: uppercase;
    opacity: 0.7;
    color: var(--text-color);
  }
  .user {
  }
  .preferences {
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
    top: 0;
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
