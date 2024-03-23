import { LocalNotifications } from "@capacitor/local-notifications"
import { useCurrentStreamStation, useAllowLocalNotifications, useGlobalToast } from "~/composables/states"

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
    //alert('allowLocalNotifications.value = ' + JSON.stringify(allowLocalNotifications.value))
    if (allowLocalNotifications.value) {
        if (entry.active) {
            //alert(JSON.stringify(await LocalNotifications.getPending()))
            await LocalNotifications.schedule(notificationBody)

            setPendingLocalNotifications()

        } else {
            //alert("remove =" + JSON.stringify(await LocalNotifications.getPending()))
            console.log('should cancel notification')
            await LocalNotifications.cancel(notificationBody)

            setPendingLocalNotifications()
        }
    } else {
        // ask permissions and try again
        await LocalNotifications.requestPermissions().then((result) => {
            if (result.display === "granted") {
                allowLocalNotifications.value = true
                const globalToast = useGlobalToast()
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