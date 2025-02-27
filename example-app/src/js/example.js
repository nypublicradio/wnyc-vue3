import { capacitorIosNotificationSettings } from 'capacitor-ios-notification-settings';

window.testEcho = () => {
    const inputValue = document.getElementById("echoInput").value;
    capacitorIosNotificationSettings.echo({ value: inputValue })
}
