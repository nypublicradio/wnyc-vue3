import { ref } from 'vue';
import { Capacitor } from "@capacitor/core"
import { BackgroundMode } from "bp-capacitor-background-mode"

// composable to handle the background mode for android only
export const useBackgroundMode = () => {
  const batteryDisabled = ref(false);

  // Request to disable battery optimizations
  const requestDisableBatteryOptimizations = async () => {
    if (!(await BackgroundMode.checkBatteryOptimizations()).disabled) {
      await BackgroundMode.requestDisableBatteryOptimizations().then((res) => {
        batteryDisabled.value = res.disabled;
      })
    } else {
      batteryDisabled.value = true;
    }
  };

  // Initialize background mode
  const initBackgroundMode = async () => {

    // first request to disable battery optimizations
    await requestDisableBatteryOptimizations()
    // if battery optimizations are disabled, enable background mode and return true
    if (batteryDisabled.value) {
      await BackgroundMode.disableWebViewOptimizations()
      await BackgroundMode.enable();
      await BackgroundMode.setSettings({
        silent: true,
        hidden: true,
      });
      return true
    } else {
      return false
    }
  }

  // Disable background mode once the sleep timer is over, so the app stops keeping itself awake in the background
  const disableBackgroundMode = async () => {
    if (Capacitor.getPlatform() !== "android") return
    await BackgroundMode.disable()
  }

  return { initBackgroundMode, disableBackgroundMode };
};

