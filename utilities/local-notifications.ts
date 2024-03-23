import { LocalNotifications } from "@capacitor/local-notifications"

// local notifications list state
export const usePendingLocalNotifications = () => useState('usePendingLocalNotifications', () => null)

export const setPendingLocalNotifications = async () => {
    const pendingLocalNotifications = usePendingLocalNotifications()
    pendingLocalNotifications.value = await LocalNotifications.getPending()

}


export const scheduleLocalNotification = async (entry) => {
    const idNumber = entry.id.split(":")
    const id = idNumber[1]
    console.log('working date =', new Date(Date.now() + 5000))
    console.log('my date =', new Date(entry.attributes.start))
    await LocalNotifications.schedule({
        notifications: [
            {
                title: `${entry.attributes.parentTitle} is starting now!`,
                body: entry.attributes.scheduleEventTitle,
                id,
                //schedule: { at: new Date(entry.attributes.start), allowWhileIdle: true },
                schedule: { at: new Date(Date.now() + 5000) },
                sound: "notification.wav",
                actionTypeId: "route-live",
                extra: entry,
            },
        ],
    })
    setPendingLocalNotifications()
}