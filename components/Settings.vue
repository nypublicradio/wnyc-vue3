<script setup>
import { onMounted } from 'vue'
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
} from '~/utilities/helpers'
import {
  useSettingsData,
  useAllCurrentStations,
  useLoggedState,
  useTextSizeOption,
} from '~/composables/states.ts'
import VInputSwitch from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VInputSwitch.vue'
import { updateAllLiveStreams } from '~/composables/data/liveStream'

const settingsData = useSettingsData()
const textSizeOptions = useTextSizeOption()

const allCurrentStations = useAllCurrentStations()
const stationsMenuData = ref([])

const tempLoggedState = useLoggedState()

const initializeStationList = (val) => {
  console.log('initializeStationList')
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

onMounted(async () => {
  await updateAllLiveStreams()
  await initializeStationList(allCurrentStations.value)
})
</script>

<template>
  <div class="settings m-2">
    <section class="user">
      <SUser v-model:data.sync="tempLoggedState" />
    </section>
    <section v-if="tempLoggedState" class="user-preferences p-0">
      <div class="s-title">Account</div>
      <SBox label="Name">
        <SField
          label="Tap to add a name"
          v-model:data.sync="settingsData.name"
        />
      </SBox>
      <SBox label="Email">
        <SField
          label="Tap to add an email"
          email
          v-model:data.sync="settingsData.email"
        />
      </SBox>
      <SBox label="Password">
        <SField
          label="************"
          password
          v-model:data.sync="settingsData.password"
        />
      </SBox>
    </section>
    <section class="listening-preferences p-0">
      <div class="s-title">Listening Preferences</div>
      <SBox label="Autodownload">
        <VInputSwitch
          static-width
          v-model:data.sync="settingsData.autodownload"
          @change="
            () => {
              trackClickEvent(
                'Click Tracking - Autodownload switch',
                'Settings Sidebar - Listening Preferences',
                settingsData.autodownload
              )
            }
          "
        />
      </SBox>
      <SBox label="Default stream">
        <SDropdown
          v-model:data.sync="settingsData.defaultstream"
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
          v-model:data.sync="settingsData.notificationgeneral"
          @change="
            () => {
              trackClickEvent(
                'Click Tracking - General switch',
                'Settings Sidebar - Notifications',
                settingsData.notificationgeneral
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
          v-model:data.sync="settingsData.textsize"
          :options="textSizeOptions"
          @change="
            () => {
              setFontSize(settingsData.textsize.pixel)
              trackClickEvent(
                'Click Tracking - Test size',
                'Settings Sidebar - Display',
                settingsData.textsize.label
              )
            }
          "
        />
      </SBox>
      <SBox label="Dark theme">
        <VInputSwitch
          static-width
          v-model:data.sync="settingsData.darktheme"
          @change="
            () => {
              setDarkMode(settingsData.darktheme)
              trackClickEvent(
                'Click Tracking - Dark theme',
                'Settings Sidebar - Display',
                settingsData.darktheme
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
