import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.servicemarket.app',
  appName: 'ServiceMarket',
  webDir: 'build',
  plugins: {
    GoogleAuth: {
      scopes: ["profile", "email"],
      clientId: "933749606851-jhheujg0vcb1c3ean6qn6m828n025g87.apps.googleusercontent.com",
      forceCodeForRefreshToken: true
    }
  }
};

export default config;
