import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.wnyc.android',
  appName: 'wnyc-app-android',
  webDir: 'dist',
  backgroundColor: "#d4d4d4",
  server: {
    androidScheme: 'https'
  },
  plugins: {
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
    CapacitorCookies: {
      enabled: true
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
