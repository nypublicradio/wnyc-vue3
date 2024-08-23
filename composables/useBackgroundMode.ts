// composables/useBackgroundMode.js

import { ref } from 'vue';
import { BackgroundMode } from "bp-capacitor-background-mode"

export const useBackgroundMode = () => {
  const batteryDisabled = ref(false);

  const requestDisableBatteryOptimizations = async () => {
    if (!(await BackgroundMode.checkBatteryOptimizations()).disabled) {
      await BackgroundMode.requestDisableBatteryOptimizations().then((res) => {
        batteryDisabled.value = res.disabled;
      })
    } else {
      batteryDisabled.value = true;
    }
  };

  const addAppInBackgroundListener = async () => {
    await BackgroundMode.addListener("appInBackground", async () => {
      await BackgroundMode.moveToForeground()
      await BackgroundMode.wakeUp()
    })
  }

  const initBackgroundMode = async () => {

    await requestDisableBatteryOptimizations()
    if (batteryDisabled.value) {
      await BackgroundMode.disableWebViewOptimizations()
      await BackgroundMode.enable();
      await BackgroundMode.setSettings({
        silent: true,
        hidden: true,
      });
      await addAppInBackgroundListener()
      return true
    } else {
      return false
    }
  }

  return { initBackgroundMode };
};

