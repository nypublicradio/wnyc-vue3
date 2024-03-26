import { Capacitor } from '@capacitor/core'
import { BatteryOptimization } from '@capawesome-team/capacitor-android-battery-optimization'

const isBatteryOptimizationEnabled = async () => {
    if (Capacitor.getPlatform() !== 'android') {
        return false
    }
    const { enabled } = await BatteryOptimization.isBatteryOptimizationEnabled()
    return enabled
}

const openBatteryOptimizationSettings = async () => {
    if (Capacitor.getPlatform() !== 'android') {
        return
    }
    await BatteryOptimization.openBatteryOptimizationSettings()
}

const requestIgnoreBatteryOptimization = async () => {
    if (Capacitor.getPlatform() !== 'android') {
        return
    }
    await BatteryOptimization.requestIgnoreBatteryOptimization()
}


export const initBatteryOptimizations = async () => {
    const isOptimized = await isBatteryOptimizationEnabled()
    if (isOptimized) {
        await requestIgnoreBatteryOptimization()
    }
}