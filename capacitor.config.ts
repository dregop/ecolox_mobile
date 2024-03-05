import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Ecolox',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    useLegacyBridge: true
  }
};

export default config;
