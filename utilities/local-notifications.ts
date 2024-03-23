import { LocalNotifications } from "@capacitor/local-notifications"
import { J } from "vitest/dist/types-198fd1d9"
import { useCurrentStreamStation, useAllowLocalNotifications } from "~/composables/states"

// local notifications list state
export const usePendingLocalNotifications = () => useState('usePendingLocalNotifications', () => null)

export const setPendingLocalNotifications = async () => {
    console.log('setting')
    const pendingLocalNotifications = usePendingLocalNotifications()
    pendingLocalNotifications.value = await LocalNotifications.getPending()

}


export const scheduleLocalNotification = async (entry) => {
    const idNumber = entry.id.split(":")
    const id = idNumber[1]
    const allowLocalNotifications = useAllowLocalNotifications()
    const currentStreamStation = useCurrentStreamStation()
    console.log('currentStreamStation.value = ', currentStreamStation.value)
    const notificationBody = {
        notifications: [
            {
                title: `${entry.attributes.parentTitle} is starting now!`,
                body: entry.attributes.scheduleEventTitle,
                id,
                schedule: { at: new Date(entry.attributes.start), allowWhileIdle: true },
                sound: "notification.wav",
                actionTypeId: "route-live",
                extra: entry,
                channelId: currentStreamStation.value,
            },
        ],
    }
    alert('entry =' + JSON.stringify(entry))
    if (allowLocalNotifications.value) {
        if (entry.active) {
            await LocalNotifications.schedule(notificationBody)
            alert(JSON.stringify(await LocalNotifications.getPending()))
            setPendingLocalNotifications()

        } else {
            console.log('should cancel notification')
            await LocalNotifications.cancel(notificationBody)
            alert("remove =" + JSON.stringify(await LocalNotifications.getPending()))
            setPendingLocalNotifications()
        }
    }
}