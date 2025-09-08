# Appium Boilerplate (React Native)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Appium](https://img.shields.io/badge/Appium-662d91?style=for-the-badge&logo=detox&logoColor=white)](https://github.com/appium/appium)
[![WebDriverIO](https://img.shields.io/badge/-WebdriverIO-EA5906?style=for-the-badge&logo=webdriverio&logoColor=white)](https://github.com/webdriverio/webdriverio)
[![Mocha](https://img.shields.io/badge/-Mocha-8D6748?style=for-the-badge&logo=mocha&logoColor=white)](https://mochajs.org)

## **Technologies**
- **TypeScript** - Strictly typed framework implementation
- **WebdriverIO** - Test runner and automation library
- **Appium** - Cross-platform mobile automation (iOS & Android)
- **Mocha** - Test framework with lifecycle hooks and reporters

## **Highlights**

### **1. Screen Object Pattern with Type Safety**
Screens are modeled as strongly typed objects with reusable commands:

```typescript
class SignIn extends App {
  private get usernameField() { return getByTestId('signIn:field.username'); }
  private get passwordField() { return getByTestId('signIn:field.password'); }
  private get signInButton() { return getByTestId('signIn:button.signIn'); }

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
---
**Work in progress:** I will continue writing and updating this section soon.
