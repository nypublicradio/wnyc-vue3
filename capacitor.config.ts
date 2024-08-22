import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.wnyc.android',
  appName: 'wnyc-app-android',
  webDir: 'dist',
  backgroundColor: "#d4d4d4",
  android: {
    overrideUserAgent: `${process.env.USER_AGENT}`,
    appendUserAgent: 'Android-WNYC-App'
  },
  ios: {
    overrideUserAgent: `${process.env.USER_AGENT}`,
    appendUserAgent: 'iOS-WNYC-App',
  },
  plugins: {
    CapacitorCookies: {
      enabled: true,
    },
    CapacitorHttp: {
      enabled: true,
    },
    SplashScreen: {
      splashBackgroundColor: "#e01e3f",
      iconBackgroundColor: "#e01e3f",
      launchShowDuration: 1000,
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
  }
};

export default config;
