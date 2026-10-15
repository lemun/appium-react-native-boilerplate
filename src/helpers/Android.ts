import { envOr, getByTextMatches, isShownWithin } from './Utils.ts';

const STEP_TIMEOUT = 10_000;

/**
 * Android emulator Settings automation: set a screen-lock PIN and enroll a fingerprint, so apps that
 * gate login behind `BiometricPrompt` can be tested. The wizard differs per Android version; the steps
 * below cover Android 9 to 14+ on Google (Pixel) system images. OEM skins use other labels.
 */
class AndroidSettings {
  private get platformVersion(): number {
    const capabilities = driver.capabilities as Record<string, unknown>;
    const version = capabilities['platformVersion'] ?? capabilities['appium:platformVersion'];

    return typeof version === 'string' || typeof version === 'number' ? Number.parseInt(String(version), 10) : 0;
  }

  private text(pattern: string) {
    return getByTextMatches(`(?i)${pattern}`);
  }

  private async tap(pattern: string): Promise<void> {
    const element = this.text(pattern);
    await element.waitForDisplayed({ timeout: STEP_TIMEOUT });
    await element.click();
  }

  private async shell(command: string, args: string[] = []): Promise<void> {
    // Requires the Appium server to run with `--allow-insecure uiautomator2:adb_shell` (see wdio.android.conf.ts).
    await driver.execute('mobile: shell', { command, args });
  }

  private async reEnterPin(pin: string): Promise<void> {
    await this.text('Re-enter your PIN').waitForDisplayed({ timeout: STEP_TIMEOUT });
    await this.shell('input', ['text', pin]);
    await this.shell('input', ['keyevent', '66']);
  }

  private async touchSensor(fingerprintId: number, prompt: string): Promise<void> {
    await this.text(prompt).waitForDisplayed({ timeout: STEP_TIMEOUT });
    await driver.execute('mobile: fingerprint', { fingerprintId });
  }

  private async dismissScreenLockNotification(): Promise<void> {
    if (await isShownWithin(this.text('Set screen lock'), 2_000)) {
      await this.tap('Dismiss');
    }
  }

  /** Set a device PIN (`DEVICE_PIN`, default 1234) and enroll `fingerprintId` through the Settings wizard. */
  async enrollFingerprint(fingerprintId: number): Promise<void> {
    const pin = envOr('DEVICE_PIN', '1234');

    await this.shell('locksettings', ['set-pin', pin]);
    await this.shell('am', ['start', '-a', 'android.settings.SECURITY_SETTINGS']);

    if (this.platformVersion >= 14) {
      await this.text('Device unlock.*').waitForDisplayed({ timeout: STEP_TIMEOUT });
      await this.dismissScreenLockNotification();
      await this.tap('Device unlock');
      await this.tap('.*Fingerprint.*');
    } else {
      await this.tap('.*Fingerprint.*');
    }

    if (this.platformVersion >= 10) {
      await this.reEnterPin(pin);

      if (this.platformVersion >= 14) {
        await this.tap('Pixel Imprint');
      }

      if (this.platformVersion >= 12) {
        await this.tap('MORE');
        await this.tap('I AGREE');
      } else {
        await this.tap('NEXT');
      }
    } else {
      await this.tap('NEXT');
      await this.reEnterPin(pin);
    }

    await this.touchSensor(fingerprintId, 'Touch the sensor.*');
    await this.touchSensor(fingerprintId, 'Put your finger.*');
    await this.touchSensor(fingerprintId, 'Keep lifting.*');
    await this.tap('DONE');
  }
}

export default new AndroidSettings();
