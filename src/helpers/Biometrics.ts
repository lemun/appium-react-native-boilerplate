import { assertEnvironment, getByClass, getByText, executeInHomeScreenContext } from './Utils.js';

class Biometrics {
  private get iosAllowBiometrics() {
    return getByClass('**/XCUIElementTypeButton[`name == "Allow" OR name == "OK"`]');
  }

  private get androidAllowBiometrics() {
    return getByText('Touch the fingerprint sensor');
  }

  async submitBiometricSignIn(successful: boolean) {
    if (driver.isIOS) {
      return await this.allowIosBiometricUsage(successful);
    }

    return await this.allowAndroidBiometricUsage(
      successful ? Number(assertEnvironment('DEFAULT_PIN')) : Number(assertEnvironment('INCORRECT_PIN')),
    );
  }

  async allowAndroidBiometricUsage(fingerprintId: number) {
    await this.androidAllowBiometrics.waitForDisplayed({ timeout: 3 * 1000 });
    await driver.fingerPrint(fingerprintId);
  }

  async allowIosBiometricUsage(successful: boolean) {
    await executeInHomeScreenContext(async () => {
      try {
        await this.iosAllowBiometrics
          .waitForDisplayed({ timeout: 3 * 1000 })
          .then(async () => await this.iosAllowBiometrics.click());
      } catch (error) {
        /* do nothing */
      }
    });

    return driver.touchId(successful);
  }
}

export default new Biometrics();
