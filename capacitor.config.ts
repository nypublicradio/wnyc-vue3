import type { CapacitorConfig } from '@capacitor/cli'
import { wnycAutoConfig } from '@nypublicradio/wnyc-auto/config'

const config: CapacitorConfig = {
  appId: 'org.wnyc.android',
  appName: 'wnyc-app-android',
  webDir: 'dist',
  backgroundColor: "#d4d4d4",
  android: {
    overrideUserAgent: `${process.env.USER_AGENT}`,
    appendUserAgent: 'Android-WNYC-App',
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true,
  },
  ios: {
    overrideUserAgent: `${process.env.USER_AGENT}`,
    appendUserAgent: 'iOS-WNYC-App',
    handleApplicationNotifications: false,
    allowsInlineMediaPlayback: true,
  },
  plugins: {
    BackgroundMode: {
      enabled: true,
      silent: false,
      hidden: false,
      resume: true,
      wakeup: true,
      title: "Playing audio",
      text: "WNYC is playing content",
      icon: "icon",
      keepAlive: true,
      disableWebViewOptimizations: true
    },
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    StatusBar: {
      overlaysWebView: true,
      //style: "DEFAULT",
      //backgroundColor: "#e01e3f",
    },
    SplashScreen: {
      splashBackgroundColor: "#e01e3f",
      iconBackgroundColor: "#e01e3f",
      launchShowDuration: 5000,
      launchAutoHide: true,
      launchFadeOutDuration: 500,
      backgroundColor: "#e01e3f",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_notification_default",
      iconColor: "#de1e3d",
      sound: "notification.wav"
    },
    // Player branding (the plugin itself is app-agnostic)
    RemoteStreamer: {
      // Keep these exact strings: stream analytics may parse them
      userAgent: {
        ios: 'WNYC-App/iOS {appVersion}; {deviceModel}; iOS {osVersion}',
        android: 'WNYC-App/{appVersion} (Android {osVersion}; {deviceModel})',
      },
      defaultTitle: 'WNYC',
      android: {
        notification: {
          smallIcon: 'ic_stat_wnyc', // android/app/src/main/res/drawable/ic_stat_wnyc.xml
          channelName: 'Playback',
        },
      },
    },
    // CarPlay + Android Auto. Values live in @nypublicradio/wnyc-auto's
    // config/wnyc-auto.config.json; this picks the environment for the build.
    WnycAuto: wnycAutoConfig({
      environment: process.env.ENV === 'prod' ? 'prod' : 'demo',
      overrides: { bffBaseUrl: process.env.BFF_URL },
    }),
  }
}

export default config
