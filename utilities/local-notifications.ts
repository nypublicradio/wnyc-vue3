import { LocalNotifications } from "@capacitor/local-notifications"
import { useCurrentStreamStation, useAllowLocalNotifications, useGlobalToast } from "~/composables/states"
import { getDate } from "~/utilities/helpers"

// local notifications list state
export const usePendingLocalNotifications = () => useState('usePendingLocalNotifications', () => null)

export const setPendingLocalNotifications = async () => {
    const pendingLocalNotifications = usePendingLocalNotifications()
    pendingLocalNotifications.value = await LocalNotifications.getPending()
}

const checkNotificationsList = (entry) => {
    const pendingLocalNotifications = usePendingLocalNotifications()
    return pendingLocalNotifications.value?.notifications.some(
        (notification) => notification.extra.id === entry.id
    ) || false;
}

export const scheduleLocalNotification = async (entry) => {
    const idNumber = entry.id.split(":")
    const id = idNumber[1]
    const allowLocalNotifications = useAllowLocalNotifications()
    const currentStreamStation = useCurrentStreamStation()
    const globalToast = useGlobalToast()

    const notificationBody = {
        notifications: [
            {
                title: `${entry.attributes.parentTitle} is starting now!`,
                body: entry.attributes.scheduleEventTitle,
                id,
                schedule: { at: new Date(entry.attributes.start) },
                //schedule: { at: new Date(Date.now() + 5000) },
                sound: "notification.wav",
                actionTypeId: "route-live",
                extra: entry,
                channelId: currentStreamStation.value,
            },
        ],
    }
    if (allowLocalNotifications.value) {
        if (!checkNotificationsList(entry)) {
            await LocalNotifications.schedule(notificationBody)
            setPendingLocalNotifications()
            globalToast.value = {
                severity: "success",
                summary: `Notification set for ${getDate(
                    entry.attributes.start,
                    "h:mm a EEE, MMM do "
                )}`,
                life: 3000,
                closable: true,
            }

        } else {
            await LocalNotifications.cancel(notificationBody)
            setPendingLocalNotifications()
        }
    } else {
        // ask permissions and try again
        await LocalNotifications.requestPermissions().then((result) => {
            if (result.display === "granted") {
                allowLocalNotifications.value = true

                globalToast.value = {
                    severity: "success",
                    summary: "Local notifications are now enabled. Please try again.",
                    life: 3000,
                    closable: true,
                }
            } else {
                allowLocalNotifications.value = false
            }
        })
    }
}
