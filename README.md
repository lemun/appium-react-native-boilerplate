# Appium Boilerplate (React Native, TypeScript)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Appium](https://img.shields.io/badge/Appium-662d91?style=for-the-badge&logo=detox&logoColor=white)](https://github.com/appium/appium)
[![WebDriverIO](https://img.shields.io/badge/-WebdriverIO-EA5906?style=for-the-badge&logo=webdriverio&logoColor=white)](https://github.com/webdriverio/webdriverio)
[![Mocha](https://img.shields.io/badge/-Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)](https://mochajs.org)
**React Native Appium boilreplate** with strictly-typed Screen Objects, cross-platform element selector utility, and ready-to-run WebDriverIO configs for Android & iOS.

## **Technologies**
- **TypeScript** - Strictly typed framework implementation
- **WebdriverIO** - Test runner and automation library
- **Appium** - Cross-platform mobile automation (iOS & Android)
- **Mocha** - Test framework with lifecycle hooks and reporters

## Quickstart (5 minutes)
1) Clone
```bash
git clone https://github.com/lemun/appium-boilerplate.git && cd appium-boilreplate
```

2) Install deps
```bash
npm i && npm i -g appium
```

3) Create .env (copy the template and fill in values)
```
```
| Key | Example | What it is / Where to get it |
|---|---|---|
| `ANDROID_DEVICE_NAME` | `Pixel_8_Pro_API_34` | AVD name (emulator) or device ID. List emulators: `emulator -list-avds`. List devices: `adb devices -l`. |
| `ANDROID_PLATFORM_VERSION` | `14` | Android OS version on the device/emulator. Check with `adb shell getprop ro.build.version.release` or see the AVD config. |
| `AUTO_GRANT_PERMISSIONS` | `true` | If `true`, Appium auto-grants runtime permissions on Android. |
| `DEFAULT_PIN` | `1234` | The PIN your tests enter for Biometrics. Use the value configured in your Android emulator. |
| `INCORRECT_PIN` | `1111` | Any value that is not the real device PIN. |
| `IOS_DEVICE_NAME` | `iPhone 15` | iOS Simulator name. See available devices with `xcrun simctl list devices`. |
| `IOS_PLATFORM_VERSION` | `17.5` | iOS runtime version. See with `xcrun simctl list runtimes` or in the Simulator app. |
| `AUTO_ACCEPT_ALERTS` | `true` | If `true`, Appium auto-accepts iOS system alerts (push permissions, etc.). |
| `REACT_NATIVE_PATH` | `../my-rn-app` | **Absolute Path to the React Native app under test** (absolute). |
| `BUNDLE_ID` | com.`company`.myapp | The app identifier |
| `USER_USERNAME` | `test.user@example.com` | Test account username |
| `USER_PASSWORD` | `SuperSecret123` | Password for the above test user. Prefer secrets in CI; `.env` is fine for local only. |

## **Highlights**

### **How are screen objects structured?**
All screens are modeled as strongly typed objects with reusable methods:

```typescript
// Declaring screen view TestID
const SCREEN_SELECTOR = 'signIn:view.container';

// Extending App (inherits waitForIsShown)
class SignIn extends App {
   constructor() {
    super(SCREEN_SELECTOR);
  }

  get screen() {
    return getByTestId(SCREEN_SELECTOR);
  }

  // Mapping private getters for TestIDs and selectors  
  private get usernameField() { return getByTestId('signIn:field.username'); }
  private get passwordField() { return getByTestId('signIn:field.password'); }
  private get signInButton() { return getByTestId('signIn:button.signIn'); }

  // Defining Public methods that perform user flows (tap, setValue, etc.)
  async tapOnSignInButton() {
    await this.signInButton.click();
  }

async submitSignInForm({
    username,
    password,
    rememberMe = true,
  }: {
    username: string;
    password: string;
    rememberMe?: boolean;
  }) {
    await this.usernameField.setValue(username);
    await this.passwordField.setValue(password);

    await this.signInButton.click();
}

```

### **Helpers and their purposes**
**Utils.ts:** Reusable, generic helper methods; mostly stateless and pure
**Biometrics.ts:** Handling of biometric prompts
**Android.ts:** Automates Android settings to enable fingerprint unlock via navigation of the setup wizard


---
**Work in progress:** I will continue writing and updating this section soon.
