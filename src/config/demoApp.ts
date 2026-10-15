/**
 * The app under test: the public WebdriverIO native demo app (React Native / Expo).
 * https://github.com/webdriverio/native-demo-app
 *
 * The version is pinned so the screen objects and the binaries always match.
 * `npm run app:download` fetches these exact assets into `./apps` and verifies the checksums.
 * To test your own React Native app instead, point `APP_PATH` (and `APP_ID`) at it; see the README.
 */
export const DEMO_APP = {
  version: '2.2.0',
  releaseUrl: 'https://github.com/webdriverio/native-demo-app/releases/download/v2.2.0',
  android: {
    asset: 'android.wdio.native.app.v2.2.0.apk',
    sha256: 'fe1d605ce099c73d93f33e5cbcb0df0bea437ce57aaaaf156b3b0fa1ca54931d',
    appId: 'com.wdiodemoapp',
    activity: 'com.wdiodemoapp.MainActivity',
  },
  ios: {
    asset: 'ios.simulator.wdio.native.app.v2.2.0.zip',
    sha256: '84c7efda441f7a8ed37bb1527bae357de8a44a16f878996d52bdfd9d58a8c66a',
    appId: 'org.wdiodemoapp',
  },
} as const;

export type Platform = 'android' | 'ios';

/** Directory (relative to the repo root) that holds the downloaded binaries. Git-ignored. */
export const APPS_DIR = 'apps';
