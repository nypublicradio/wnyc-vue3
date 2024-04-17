import { LocalNotifications } from "@capacitor/local-notifications"
import { useGlobalToast, useCurrentUserProfile } from "~/composables/states"
import { formatDate, toggleAskNotificationPermisstions } from "~/utilities/helpers"

// local notifications list state
export const usePendingLocalNotifications = () => useState('usePendingLocalNotifications', () => null)

// update the global state
export const setPendingLocalNotifications = async () => {
    const pendingLocalNotifications = usePendingLocalNotifications()
    pendingLocalNotifications.value = await LocalNotifications.getPending()
}

// check if the entry is in the local notifications list
const checkNotificationsList = (entry) => {
    const pendingLocalNotifications = usePendingLocalNotifications()
    return pendingLocalNotifications.value?.notifications.some(
        (notification) => notification.extra.id === entry.id
    ) || false;
}

// schedule a local notification
export const scheduleLocalNotification = async (entry) => {
    const idNumber = entry.id.split(":")
    const id = Number(idNumber[1])
    const currentUserProfile = useCurrentUserProfile()
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
                sound: "notification.wav",
                actionTypeId: "route-live",
                extra: parsedEntry,
            },
        ],
    }
    if (currentUserProfile.value.receive_general_notifications) {
        if (!checkNotificationsList(entry)) {
            await LocalNotifications.schedule(notificationBody)
            setPendingLocalNotifications()
            globalToast.value = {
                severity: "success",
                summary: `Notification set for ${formatDate(
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
        await toggleAskNotificationPermisstions()
    }
}

// initialize local notifications and add listener to handle when tapping on a notification and what the app should do
export const initLocalNotifications = async () => {
    setPendingLocalNotifications()
    // Method called when tapping on a push notification
    await LocalNotifications.addListener(
        "localNotificationActionPerformed",
        (/* notification */) => {
            //alert('local notifications action performed: ' + JSON.stringify(notification))

            // the notification object will contain the all the data that was added to the locaal notification. so in the future we can add more data to the notification and use it here to do whatever we want. As of now, we are just hard loading the LIVE page
            window.location.href = "/live"
        }
    )
}
