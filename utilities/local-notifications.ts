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
    const id = Number(idNumber[1])
    const allowLocalNotifications = useAllowLocalNotifications()
    const globalToast = useGlobalToast()

    const entryStartDate = await new Date(entry.attributes.start)
    const title = `${entry.attributes.parentTitle} is starting now on ${entry.station}!`

    const body = entry.attributes.scheduleEventTitle ? `${entry.attributes.scheduleEventTitle}` : ''
    const serializedEntry = JSON.stringify(entry);
    const parsedEntry = JSON.parse(serializedEntry);

    const notificationBody = {
        notifications: [
            {
                title,
                body,
                id,
                schedule: { at: entryStartDate, allowWhileIdle: true },
                //schedule: { at: new Date(Date.now() + 5000) },
                //sound: "notification.wav",
                actionTypeId: "route-live",
                extra: parsedEntry,
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

export const initLocalNotifications = async () => {
    setPendingLocalNotifications()
    // Method called when tapping on a push notification
    await LocalNotifications.addListener(
        "localNotificationActionPerformed",
        (notification) => {
            alert('local notifications action performed: ' + JSON.stringify(notification))
        }
    )
}
