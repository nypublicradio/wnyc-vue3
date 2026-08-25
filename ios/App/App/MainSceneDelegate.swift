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

        // Handle URLs that launched the app from a cold start (e.g. OAuth deep links)
        if let urlContext = connectionOptions.urlContexts.first {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                open: urlContext.url,
                options: [.openInPlace: urlContext.options.openInPlace]
            )
        }

        // Handle universal links that launched the app from a cold start
        if let userActivity = connectionOptions.userActivities.first {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                continue: userActivity,
                restorationHandler: { _ in }
            )
        }
    }

    // Bridge URL opens (custom scheme deep links) to Capacitor — required for Scene lifecycle
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let urlContext = URLContexts.first else { return }
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            open: urlContext.url,
            options: [.openInPlace: urlContext.options.openInPlace]
        )
    }

    // Bridge universal link opens to Capacitor — required for Scene lifecycle
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        _ = ApplicationDelegateProxy.shared.application(
            UIApplication.shared,
            continue: userActivity,
            restorationHandler: { _ in }
        )
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
