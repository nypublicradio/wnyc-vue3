import UIKit
import Capacitor

/// Minimal window scene delegate that bridges the UIScene lifecycle back to
/// Capacitor's traditional UIWindow + Main.storyboard setup.
class MainSceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        // Create the window and set root VC from Main.storyboard (same as Capacitor's default)
        let window = UIWindow(windowScene: windowScene)
        let storyboard = UIStoryboard(name: "Main", bundle: nil)
        window.rootViewController = storyboard.instantiateInitialViewController()
        self.window = window
        window.makeKeyAndVisible()

        // Also set on AppDelegate so existing code that references it still works
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.window = window
        }

        // Capacitor 8.5+: delivers cold-start URLs and universal links once plugins have loaded
        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    // Bridge URL opens (custom scheme deep links) to Capacitor — required for Scene lifecycle
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    // Bridge universal link opens to Capacitor — required for Scene lifecycle
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }

    func sceneDidBecomeActive(_ scene: UIScene) {
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.applicationDidBecomeActive(UIApplication.shared)
        }
    }

    func sceneWillResignActive(_ scene: UIScene) {
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.applicationWillResignActive(UIApplication.shared)
        }
    }

    func sceneDidEnterBackground(_ scene: UIScene) {
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.applicationDidEnterBackground(UIApplication.shared)
        }
    }

    func sceneWillEnterForeground(_ scene: UIScene) {
        if let appDelegate = UIApplication.shared.delegate as? AppDelegate {
            appDelegate.applicationWillEnterForeground(UIApplication.shared)
        }
    }
}
