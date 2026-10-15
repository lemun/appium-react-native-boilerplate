# Appium Boilerplate (React Native, TypeScript)

[![CI](https://github.com/lemun/appium-react-native-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/lemun/appium-react-native-boilerplate/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Appium](https://img.shields.io/badge/Appium_3-662d91?style=for-the-badge&logo=appium&logoColor=white)](https://appium.io)
[![WebdriverIO](https://img.shields.io/badge/WebdriverIO_10-EA5906?style=for-the-badge&logo=webdriverio&logoColor=white)](https://webdriver.io)
[![Mocha](https://img.shields.io/badge/Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)](https://mochajs.org)

Cross-platform (iOS + Android) end-to-end tests for React Native apps with **WebdriverIO 10**, **Appium 3** and
**Mocha**, written in strict TypeScript. Specs run against the public
[WebdriverIO native demo app](https://github.com/webdriverio/native-demo-app) (a React Native / Expo app), so you can
clone the repo and run them without your own app. Swap in your app with one environment variable.

> **Status:** the specs are written against demo app v2.2.0 and pass typecheck, lint and unit tests. They have not
> yet been run on a simulator or emulator in this revision.

## What the specs cover

| Spec                       | What it shows                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| `navigation.spec.ts`       | Tab bar navigation and a side menu, using typed screen objects                              |
| `login.spec.ts`            | Login and sign-up forms, inline validation errors, native alerts                            |
| `forms.spec.ts`            | Text input, switch state per platform, the native picker, enabled vs disabled buttons       |
| `swipe.spec.ts`            | Horizontal carousel swipes (W3C Actions) and scrolling to an element below the fold         |
| `drag-and-drop.spec.ts`    | Solving a 3x3 drag-and-drop puzzle                                                          |
| `webview.spec.ts`          | Hybrid testing: find the right WebView context, automate the page, return to native         |
| `data-persistence.spec.ts` | Relaunching the app: persisted storage survives, in-memory state does not                   |
| `biometrics.spec.ts`       | Face ID / Touch ID on iOS simulators, fingerprint on Android emulators (match and no match) |

## Stack

- **WebdriverIO 10** (`@wdio/cli`, local runner, Mocha framework, spec + Allure reporters, Appium service)
- **Appium 3** with the **XCUITest** and **UiAutomator2** drivers, installed as project dependencies (no global install)
- **TypeScript 6** in strict mode (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `erasableSyntaxOnly`)
- **ESLint 10** flat config (`typescript-eslint` strict type-checked + `eslint-plugin-wdio`) and **Prettier 3**
- **Allure 3** for HTML reports, Node's built-in test runner for offline unit tests
- **Node.js 24 LTS** (`.nvmrc`; Node >= 22.19 works)

## Quickstart

1. Clone and install. Appium and both drivers come from `package.json`, nothing is installed globally.

   ```bash
   git clone https://github.com/lemun/appium-react-native-boilerplate.git
   cd appium-react-native-boilerplate
   nvm install   # optional: uses .nvmrc (Node 24)
   npm ci
   ```

2. Download the demo app (pinned to v2.2.0, SHA-256 verified, saved to the git-ignored `apps/` folder):

   ```bash
   npm run app:download -- ios       # iOS simulator build, ~16 MB
   npm run app:download -- android   # Android APK, ~124 MB
   ```

3. Optional: create `.env` from the template. Every variable has a default, so an empty file is fine.

   ```bash
   cp .env.example .env
   ```

4. Check your setup. The doctor is read-only and tells you exactly what to fix (Xcode, simulator, Android SDK,
   emulator, app binaries).

   ```bash
   npm run doctor            # both platforms
   npm run doctor -- ios     # one platform
   ```

5. Run the suite:

   ```bash
   npm run ios       # boots the simulator named IOS_DEVICE_NAME (default "iPhone 17 Pro")
   npm run android   # uses the running emulator/device, or boots ANDROID_AVD
   ```

   Run one spec with `npm run ios -- --spec src/specs/login.spec.ts`.

6. Open the HTML report (Allure 3, no Java required):

   ```bash
   npm run report
   ```

## Environment variables

All optional; see [`.env.example`](.env.example). WebdriverIO loads `.env` automatically.

| Key                                       | Default             | What it is                                                                 |
| ----------------------------------------- | ------------------- | -------------------------------------------------------------------------- |
| `IOS_DEVICE_NAME`                         | `iPhone 17 Pro`     | Simulator name: `xcrun simctl list devices available`                      |
| `IOS_PLATFORM_VERSION`                    | (any)               | iOS runtime, for example `26.5`: `xcrun simctl list runtimes`              |
| `IOS_UDID`                                |                     | Pin one exact simulator                                                    |
| `IOS_BIOMETRIC_TYPE`                      | `faceId`            | `touchId` for Touch ID devices                                             |
| `ANDROID_AVD`                             |                     | AVD to boot: `emulator -list-avds`. Without it, start an emulator yourself |
| `ANDROID_DEVICE_NAME`                     | `Android Emulator`  | Label for the device                                                       |
| `ANDROID_PLATFORM_VERSION`                | (any)               | Android version, for example `15`                                          |
| `ANDROID_UDID`                            |                     | Pick one device when several are listed by `adb devices`                   |
| `DEVICE_PIN`                              | `1234`              | Screen-lock PIN set by the Android fingerprint enrollment helper           |
| `FINGERPRINT_ID` / `WRONG_FINGERPRINT_ID` | `1` / `2`           | Enrolled and unknown emulator fingerprints                                 |
| `APP_PATH`                                | demo app in `apps/` | Your own `.app`/`.zip` (simulator build) or `.apk`                         |
| `APP_ID`                                  | demo app id         | Bundle id / package name of `APP_PATH` (used to relaunch the app)          |
| `APP_LOCALE`                              | `en`                | Locale of the UI copy used in assertions                                   |
| `SPEC_FILE_RETRIES`                       | `0`                 | Retry a failed spec file N times                                           |

## Scripts

| Command                                   | What it does                                                |
| ----------------------------------------- | ----------------------------------------------------------- |
| `npm run ios` / `npm run android`         | Run the E2E suite (WebdriverIO starts and stops Appium)     |
| `npm run app:download [-- ios\|android]`  | Download and verify the pinned demo app                     |
| `npm run doctor` (alias `setup:validate`) | Read-only environment check with fixes                      |
| `npm run typecheck`                       | `tsc --noEmit` over specs, helpers, configs and scripts     |
| `npm run lint` / `lint:fix`               | ESLint (type-aware)                                         |
| `npm run format` / `format:check`         | Prettier                                                    |
| `npm run test:unit`                       | Offline unit tests (`node --test`)                          |
| `npm run validate`                        | typecheck + lint + format check + unit tests (what CI runs) |
| `npm run report`                          | Build and open the Allure report from `allure-results/`     |

## Project structure

```
src/
├── config/
│   ├── demoApp.ts            # pinned demo app version, asset names, checksums, app ids
│   ├── appPath.ts            # APP_PATH / APP_ID resolution with actionable errors
│   └── appiumServer.test.ts  # offline check of the Appium server flags (loopback, insecure features)
├── helpers/
│   ├── Utils.ts              # cross-platform selectors, relaunchApp, executeInHomeScreenContext
│   ├── WebView.ts            # find, enter and leave the right WebView context
│   ├── Biometrics.ts         # Face ID / Touch ID / fingerprint via the drivers' mobile: commands
│   ├── Android.ts            # Android Settings automation: PIN + fingerprint enrollment
│   ├── Keyboard.ts           # hide the keyboard on both platforms
│   └── TranslationManager.ts # typed UI-copy lookup with locale fallback (+ unit test)
├── i18n/                     # UI copy used in assertions (en.json)
├── screenobjects/
│   ├── AppScreen.ts          # base class: root element + waitForIsShown
│   ├── *Screen.ts            # one class per screen
│   └── components/           # TabBar, NativeAlert, Picker
└── specs/                    # *.spec.ts
scripts/                      # download-app.ts, doctor.ts (run by Node's TypeScript support)
wdio.conf.ts                  # shared config: loopback-only Appium service, Mocha, reporters, failure screenshots
wdio.ios.conf.ts / wdio.android.conf.ts
```

## How screen objects are structured

Each screen extends `AppScreen` with the id of its root element. Element getters stay private; specs only call
intention-revealing methods, and assertions read user-facing copy from `src/i18n` instead of hard-coding it.

```ts
class LoginScreen extends AppScreen {
  constructor() {
    super('Login-screen');
  }

  private get emailField() {
    return getByAccessibilityId('input-email');
  }

  private get passwordField() {
    return getByAccessibilityId('input-password');
  }

  private get loginButton() {
    return getByAccessibilityId('button-LOGIN');
  }

  async submitLoginForm({ email, password }: Credentials): Promise<void> {
    await this.emailField.setValue(email);
    await this.passwordField.setValue(password);
    await hideKeyboard(this.root);
    await this.loginButton.scrollIntoView({ scrollableElement: this.root });
    await this.loginButton.click();
  }
}
```

```ts
it('logs in with valid credentials', async () => {
  await LoginScreen.submitLoginForm(VALID);

  await NativeAlert.waitForIsShown();
  expect(await NativeAlert.text()).toBe(`${t('login.success.title')}\n${t('login.success.message')}`);
});
```

### Selectors in React Native

| In your app              | Helper                                                 | iOS               | Android         |
| ------------------------ | ------------------------------------------------------ | ----------------- | --------------- |
| `testID="x"`             | `getByTestId('x')`                                     | accessibility id  | `resource-id`   |
| `accessibilityLabel="x"` | `getByAccessibilityId('x')`                            | accessibility id  | `content-desc`  |
| visible text             | `getByText` / `getByTextContains` / `getByTextMatches` | `label` predicate | UiSelector text |

The demo app sets `testID` on iOS and `accessibilityLabel` on Android, so its screen objects use
`getByAccessibilityId`. WebdriverIO 10 selectors are strict: `$()` throws when more than one element matches, so
selectors must be unique (use `$$()` for lists).

## Testing your own React Native app

1. Build a simulator `.app` (zip it or point at the folder) or a debug `.apk`.
2. Set `APP_PATH` and `APP_ID` in `.env`.
3. Replace the screen objects and specs with your screens; keep the helpers, components and configs.

## CI

`.github/workflows/ci.yml` runs `npm run validate` on every push and pull request. A manual run
(`workflow_dispatch` with **android-e2e** checked) also runs the full suite on an Android emulator with
[`reactivecircus/android-emulator-runner`](https://github.com/ReactiveCircus/android-emulator-runner) and uploads
logs, screenshots and Allure results as an artifact.

## Security

- **The Appium server listens on `127.0.0.1` only.** Appium's default is `0.0.0.0` (every network interface).
  `appiumService()` in `wdio.conf.ts` always passes `--address 127.0.0.1`, so other machines on the network cannot
  reach the server. The test runner connects over loopback too.
- **One insecure Appium feature, on Android only:** `uiautomator2:adb_shell`. `wdio.android.conf.ts` enables it
  because the Android fingerprint enrollment in `src/helpers/Android.ts` sets a screen-lock PIN and opens Settings
  with `mobile: shell`. `biometrics.spec.ts` needs that enrollment. The iOS config enables no insecure features. If
  you drop the biometrics spec on Android, remove `allowInsecure` from `wdio.android.conf.ts` as well.
- `src/config/appiumServer.test.ts` starts neither Appium nor a device. It runs each platform config through
  `@wdio/appium-service` and Appium's own CLI parser, then checks the address and the insecure features the server
  would actually get. It runs in `npm run validate`.
- `npm audit` still reports advisories inside the Appium drivers' bundled dependencies, which npm cannot update or
  override. [SECURITY.md](SECURITY.md) lists each one and explains why none of them is reachable in this setup.

## Credits

The demo app and parts of the helpers (fingerprint enrollment, `relaunchApp`, `executeInHomeScreenContext`, the
WebView context approach) build on the MIT-licensed
[webdriverio/appium-boilerplate](https://github.com/webdriverio/appium-boilerplate) and
[webdriverio/native-demo-app](https://github.com/webdriverio/native-demo-app). See [LICENSE](LICENSE).
