import UIKit
import CarPlay
import NypublicradioCapacitorRemoteStreamer

/// CarPlay scene delegate — must be in the main app target so the runtime can
/// find it at scene-connection time (before dynamic frameworks may load).
/// Directly initializes CarPlayMediaManager so CarPlay works even when the
/// Capacitor WebView hasn't loaded yet (e.g. cold launch from CarPlay).
@objc(CarPlaySceneDelegate)
class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {

    private var interfaceController: CPInterfaceController?

    @objc func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController
    ) {
        self.interfaceController = interfaceController

        // Directly hand the controller to CarPlayMediaManager and build the UI.
        // This is the critical path — it must NOT depend on the Capacitor plugin
        // having loaded, because CarPlay can connect before the WebView is ready.
        CarPlayMediaManager.shared.interfaceController = interfaceController
        CarPlayMediaManager.shared.setupRootTemplate()

        // Also post the notification for backward compatibility / plugin listeners
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
        CarPlayMediaManager.shared.interfaceController = nil

        NotificationCenter.default.post(
            name: Notification.Name("CarPlayDidDisconnect"),
            object: nil
        )
    }
}
