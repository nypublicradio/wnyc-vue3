import NypublicradioWnycAuto

/// The CarPlay experience lives in @nypublicradio/wnyc-auto. This subclass keeps
/// the existing name used by Info.plist and AppDelegate's scene configuration.
/// It reads its settings natively, so CarPlay works on a cold launch without the WebView.
@objc(CarPlaySceneDelegate)
class CarPlaySceneDelegate: WnycCarPlaySceneDelegate {}
