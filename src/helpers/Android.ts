import { assertEnvironment, getByTextMatches } from './Utils.js';

class Android {
  private get androidDeviceUnlock() {
    return getByTextMatches('(?i)Device unlock.*');
  }

  private get androidSetScreenLock() {
    return getByTextMatches('(?i)Set screen lock');
  }

  private get androidDismiss() {
    return getByTextMatches('(?i)Dismiss');
  }

  private get androidFingerprintUnlock() {
    return getByTextMatches('(?i)Fingerprint.*');
  }

  private get androidReEnterPin() {
    return getByTextMatches('(?i)Re-enter your PIN');
  }

  private get androidMore() {
    return getByTextMatches('(?i)MORE');
  }

  private get androidIagree() {
    return getByTextMatches('(?i)I AGREE');
  }

  private get androidNext() {
    return getByTextMatches('(?i)NEXT');
  }

  private get androidDone() {
    return getByTextMatches('(?i)DONE');
  }

  private get androidPixelImprint() {
    return getByTextMatches('(?i)Pixel Imprint');
  }

  private get androidTouchTheSensor() {
    return getByTextMatches('(?i)Touch the sensor.*');
  }

  private get androidPutYourFinger() {
    return getByTextMatches('(?i)Put your finger.*');
  }

  private get androidKeepLifting() {
    return getByTextMatches('(?i)keep lifting.*');
  }

  private async tapOnAndroidDeviceUnlock() {
    await this.androidDeviceUnlock.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidDeviceUnlock.click();
  }

  private async tapOnAndroidFingerprintUnlock() {
    await this.androidFingerprintUnlock.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidFingerprintUnlock.click();
  }

  private async tapOnAndroidDismiss() {
    await this.androidDismiss.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidDismiss.click();
  }

  private async tapOnAndroidMore() {
    await this.androidMore.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidMore.click();
  }

  private async tapOnAndroidIagree() {
    await this.androidIagree.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidIagree.click();
  }

  private async tapOnAndroidNext() {
    await this.androidNext.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidNext.click();
  }

  private async tapOnAndroidDone() {
    await this.androidDone.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidDone.click();
  }

  private async tapOnAndroidPixelImprint() {
    await this.androidPixelImprint.waitForDisplayed({ timeout: 10 * 1000 });
    await this.androidPixelImprint.click();
  }

  private async setAndroidReEnterPin(pin: number) {
    await this.androidReEnterPin.waitForDisplayed({ timeout: 10 * 1000 });
    await this.executeAdbCommand(`input text ${pin} && input keyevent 66`);
  }

  private get platformVersion(): number {
    return parseInt(
      ('platformVersion' in driver.capabilities ? driver.capabilities.platformVersion : '9') as string,
      10,
    );
  }

  private async executeAdbCommand(adbCommand: string) {
    await driver.execute('mobile: shell', {
      command: adbCommand,
    });
  }

  private async fingerPrintWizard(pin: number) {
    if (this.platformVersion >= 10) {
      await this.postAndroidTenFingerPrintSetup(pin);
    } else {
      await this.tapOnAndroidNext();
      await this.setAndroidReEnterPin(pin);
    }

    await this.androidTouchTheSensor.waitForDisplayed({ timeout: 10 * 1000 });
    await driver.fingerPrint(pin);

    await this.androidPutYourFinger.waitForDisplayed({ timeout: 10 * 1000 });
    await driver.fingerPrint(pin);

    await this.androidKeepLifting.waitForDisplayed({ timeout: 10 * 1000 });
    await driver.fingerPrint(pin);

    await this.tapOnAndroidDone();
  }

  private async postAndroidTenFingerPrintSetup(pin: number) {
    await this.setAndroidReEnterPin(pin);

    if (this.platformVersion >= 14) {
      await this.tapOnAndroidPixelImprint();
    }

    if (this.platformVersion >= 12) {
      await this.tapOnAndroidMore();
      await this.tapOnAndroidIagree();
    } else {
      await this.tapOnAndroidNext();
    }
  }

  async enableBiometricLogin() {
    await this.executeAdbCommand(
      `am start -a android.settings.SECURITY_SETTINGS && locksettings set-pin ${assertEnvironment('DEFAULT_PIN')}`,
    );

    if (this.platformVersion >= 14) {
      await this.androidDeviceUnlock.waitForDisplayed({ timeout: 10 * 1000 });

      try {
        if (await this.androidSetScreenLock.isDisplayed()) {
          await this.tapOnAndroidDismiss();
        }
      } catch (error) {
        /* do nothing */
      }

      await this.tapOnAndroidDeviceUnlock();

      await this.tapOnAndroidFingerprintUnlock();
    } else {
      await this.tapOnAndroidPixelImprint();
    }

    await this.fingerPrintWizard(Number(assertEnvironment('DEFAULT_PIN')));
  }
}

export default new Android();
