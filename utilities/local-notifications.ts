import { LocalNotifications } from "@capacitor/local-notifications"
import { useCurrentStreamStation } from "~/composables/states"

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
    console.log('entry =', entry)
    if (entry.active) {
        await LocalNotifications.schedule(notificationBody)
        setPendingLocalNotifications()
    } else {
        console.log('should cancel notification')
        await LocalNotifications.cancel(notificationBody)
        setPendingLocalNotifications()
    }


}