<script setup>
import { trackClickEvent, getYear } from '~/utilities/helpers'
import { useSettingsData, useAllCurrentStations } from '~/composables/states.ts'
import VInputSwitch from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VInputSwitch.vue'

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})
const settingsData = useSettingsData()
const textSizeOptions = [
  { label: 'Small', value: 'small' },
  { label: 'Normal', value: 'normal' },
  { label: 'Large', value: 'large' },
]

const allCurrentStations = useAllCurrentStations()
const stationsMenuData = ref([])

const initializeSwitcher = (val) => {
  //alert('initializeSwitcher')
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

watch(
  allCurrentStations,
  (val) => {
    initializeSwitcher(val)
  },
  { immediate: true }
)

const emitClick = () => {
  trackClickEvent(
    'Click Tracking - Settings',
    'Settings',
    `toggle ${event.target.id}`
  )
}
</script>

<template>
  <div class="settings mt-5">
    <section class="user p-0"></section>
    <section class="user-preferences p-0">
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
        <VInputSwitch static-width @change="emitClick" />
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
        <VInputSwitch static-width @change="emitClick" />
      </SBox>
    </section>
    <section class="display p-0">
      <div class="s-title">Display</div>
      <SBox label="Text size">
        <SDropdown
          v-model:data.sync="settingsData.textsize"
          :options="textSizeOptions"
        />
      </SBox>
      <SBox label="Dark theme">
        <VInputSwitch static-width @change="emitClick" />
      </SBox>
    </section>
    <section class="wnyc p-0">
      <SBox label="About WNYC"></SBox>
      <SBox label="Submit Feedback"></SBox>
      <SBox label="Contact Us"></SBox>
      <SBox label="Donate"></SBox>
    </section>
    <section class="footer mb-4">
      <WnycLogo />
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
        width: 90%;
      }
    }
  }
  .p-button.p-button-icon-only {
    width: 2.357rem;
    padding: 0.5rem 0;
  }
}
</style>
