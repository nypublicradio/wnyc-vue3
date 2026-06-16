import UIKit
import CarPlay

/// CarPlay scene delegate — must be in the main app target so the runtime can
/// find it at scene-connection time (before dynamic frameworks may load).
/// Communicates with the plugin's CarPlayMediaManager via NotificationCenter.
@objc(CarPlaySceneDelegate)
class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {

    private var interfaceController: CPInterfaceController?

    @objc func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController
    ) {
        self.interfaceController = interfaceController

        // Notify the plugin (if loaded) that CarPlay is connected
        NotificationCenter.default.post(
            name: Notification.Name("CarPlayDidConnect"),
            object: interfaceController
        )
    }

    @objc func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didDisconnect interfaceController: CPInterfaceController
    ) {
        self.interfaceController = nil

        NotificationCenter.default.post(
            name: Notification.Name("CarPlayDidDisconnect"),
            object: nil
        )
    }
}
