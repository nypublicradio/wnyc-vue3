<script setup>
import { trackClickEvent, getYear } from '~/utilities/helpers'
import VInputSwitch from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VInputSwitch.vue'

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
//onMounted(() => {})
</script>

<template>
  <div class="settings mt-5">
    <section class="user p-0"></section>
    <section class="user-preferences p-0">
      <div class="s-title">Account</div>
      <SBox label="Name">Peter Gibbons</SBox>
      <SBox label="Email">peter.gibbons@initech.com</SBox>
      <SBox label="Password">***********</SBox>
    </section>
    <section class="listening-preferences p-0">
      <div class="s-title">Listening Preferences</div>
      <SBox label="Autodownload"
        ><VInputSwitch static-width @change="emitClick"
      /></SBox>
      <SBox label="Default stream">WNYC 93.9 FM</SBox>
    </section>
    <section class="notifications p-0">
      <div class="s-title">Notifications</div>
      <SBox label="General"
        ><VInputSwitch static-width @change="emitClick"
      /></SBox>
    </section>
    <section class="display p-0">
      <div class="s-title">Display</div>
      <SBox label="Text size">Normal</SBox>
      <SBox label="Dark theme"
        ><VInputSwitch static-width @change="emitClick"
      /></SBox>
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
}
</style>
