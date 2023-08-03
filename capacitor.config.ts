import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.wnyc.android',
  appName: 'App',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
