# Appium Boilerplate (React Native, TypeScript)

[![CI/CD Pipeline](https://github.com/lemun/appium-react-native-boilerplate/workflows/CI/CD%20Pipeline/badge.svg)](https://github.com/lemun/appium-react-native-boilerplate/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Appium](https://img.shields.io/badge/Appium-662d91?style=for-the-badge&logo=detox&logoColor=white)](https://github.com/appium/appium)
[![WebDriverIO](https://img.shields.io/badge/-WebdriverIO-EA5906?style=for-the-badge&logo=webdriverio&logoColor=white)](https://github.com/webdriverio/webdriverio)
[![Mocha](https://img.shields.io/badge/-Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)](https://mochajs.org)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
**React Native Appium boilerplate** with strictly-typed Screen Objects, cross-platform element selector utility, and ready-to-run WebDriverIO configs for Android & iOS.

## **Technologies**
- **TypeScript** - Strictly typed framework implementation
- **WebdriverIO** - Test runner and automation library
- **Appium** - Cross-platform mobile automation (iOS & Android)
- **Mocha** - Test framework with lifecycle hooks and reporters

## Quickstart (5 minutes)
1) Clone
```bash
git clone https://github.com/lemun/appium-react-native-boilerplate.git && cd appium-react-native-boilerplate
```

2) Install deps
```bash
npm i && npm i -g appium
```

3) Create .env (copy the template and fill in values)
```bash
cp .env.example .env
# Edit .env with your specific values
```

4) Validate your setup
```bash
npm run setup:validate
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


### **Running Tests**

Run Android tests:
```bash
npm run android
```

Run iOS tests:
```bash
npm run ios
```

Run code quality checks:
```bash
npm run validate        # Run linting and formatting checks
npm run lint           # Run ESLint only
npm run format         # Auto-format code with Prettier
```

### **Project Structure**
```
src/
├── helpers/           # Utility functions and cross-platform helpers
│   ├── Utils.ts      # Generic helper methods and element selectors
│   ├── Biometrics.ts # Biometric authentication handling
│   └── Android.ts    # Android-specific automation helpers
├── screenobjects/     # Page Object Model implementation
│   ├── App.ts        # Base screen class with common functionality
│   ├── components/   # Reusable UI components
│   └── *.ts          # Individual screen objects
└── specs/            # Test specifications
    └── *.spec.ts     # Test files
```

### **Key Features**
- 🔄 **Cross-platform**: Single codebase for iOS and Android
- 📱 **Biometric Testing**: Built-in support for fingerprint/Face ID testing
- 🎯 **Type Safety**: Full TypeScript implementation with strict typing
- 🔧 **Flexible Configuration**: Environment-based configuration management
- 📊 **Page Objects**: Clean, maintainable test structure using POM pattern
- ⚡ **Ready to Use**: Pre-configured WebDriverIO and Appium setup
- 🚀 **CI/CD Ready**: GitHub Actions workflow included
- 📝 **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks

### **Development**

This project includes modern development tools and practices:

- **ESLint**: Code linting with TypeScript and WebDriverIO rules
- **Prettier**: Code formatting for consistent style
- **Husky**: Git hooks for automated quality checks
- **GitHub Actions**: CI/CD pipeline with automated testing
- **Setup Validation**: Cross-platform environment validation

### **Prerequisites**

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Appium** (install globally: `npm i -g appium`)

**For Android testing:**
- Android SDK with `ANDROID_HOME` environment variable set
- Android emulator or physical device
- ADB in PATH

**For iOS testing (macOS only):**
- Xcode with Command Line Tools
- iOS Simulator
- `xcrun` command available

---

**Contributing:** Pull requests are welcome! Please ensure your code follows the existing patterns, passes all quality checks (`npm run validate`), and includes appropriate tests.
