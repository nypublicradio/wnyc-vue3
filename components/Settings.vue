<script setup>
import { onMounted } from 'vue'
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
  getTextSizePixel,
  getTextSizeLabel,
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
  successMessage.value = false
  errorMessage.value = false
  const { error } = await client
    .from('profiles')
    .upsert({
      id: currentUser.value.id,
      updated_at: new Date().toISOString(),
      first_name: fullName.value,
      last_name: fullName.value,
      pronouns: pronouns.value,
      continuous_play: continuousPlay.value,
      default_live_stream: defaultLiveStream.value,
      dark_mode: dark_mode.value,
      receive_general_notifications: receive_general_notifications.value,
      text_size: text_size.value,
      autodownload: autodownload.value,
    })
    .match({ id: currentUser.value.id })
  if (error) {
    console.log(error)
    errorMessage.value = true
  } else {
    successMessage.value = true
  }
}

onMounted(async () => {
  await updateAllLiveStreams()
  await initializeStationList(allCurrentStations.value)
})
</script>

<template>
  <div class="settings m-2">
    <section class="user">
      <SUser />
    </section>
    <section v-if="currentUser" class="user-preferences p-0">
      <div class="s-title">Account</div>
      <SBox label="First name">
        <SField
          label="Tap to add a first name"
          v-model:data="currentUserProfile.first_name"
        />
      </SBox>
      <SBox label="Last name">
        <SField
          label="Tap to add a last name"
          v-model:data="currentUserProfile.last_name"
        />
      </SBox>
      <SBox label="Email">
        <SField
          label="Tap to add an email"
          email
          v-model:data="currentUser.email"
        />
      </SBox>
      <SBox label="Password">
        <SField label="************" password />
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
          @change="
            () => {
              setFontSize(getTextSizePixel(currentUserProfile.value.text_size))

              trackClickEvent(
                'Click Tracking - Test size',
                'Settings Sidebar - Display',
                getTextSizeLabel
              )
            }
          "
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
