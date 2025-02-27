import Foundation
import Capacitor

/**
 * Please read the Capacitor iOS Plugin Development Guide
 * here: https://capacitorjs.com/docs/plugins/ios
 */
@objc(capacitorIosNotificationSettingsPlugin)
public class capacitorIosNotificationSettingsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "capacitorIosNotificationSettingsPlugin"
    public let jsName = "capacitorIosNotificationSettings"
    
    // Add the openNotificationSettings method to the pluginMethods array
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "echo", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "openNotificationSettings", returnType: CAPPluginReturnPromise)
    ]
    private let implementation = capacitorIosNotificationSettings()

    @objc func echo(_ call: CAPPluginCall) {
        let value = call.getString("value") ?? ""
        call.resolve([
            "value": implementation.echo(value)
        ])
    }

    @objc func openNotificationSettings(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            if #available(iOS 16.0, *) {
                if let appSettings = URL(string: UIApplication.openNotificationSettingsURLString), UIApplication.shared.canOpenURL(appSettings) {
                    UIApplication.shared.open(appSettings)
                    call.resolve()
                } else {
                    call.reject("Failed to open notification settings.")
                }
            } else {
                if let appSettings = URL(string: UIApplication.openSettingsURLString), UIApplication.shared.canOpenURL(appSettings) {
                    UIApplication.shared.open(appSettings)
                    call.resolve()
                } else {
                    call.reject("Failed to open notification settings.")
                }
            }
        }
    }
}