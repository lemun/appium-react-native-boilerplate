import AndroidSettings from './Android.ts';
import { envOr, executeInHomeScreenContext, getByTextMatches, isShownWithin } from './Utils.ts';

export type IosBiometricType = 'faceId' | 'touchId';

/** Fingerprint ids registered on the emulator. Any other id is treated as a non-matching finger. */
export const FINGERPRINT = {
  enrolled: Number(envOr('FINGERPRINT_ID', '1')),
  unknown: Number(envOr('WRONG_FINGERPRINT_ID', '2')),
} as const;

/**
 * Cross-platform biometrics for simulators/emulators, built on the drivers' `mobile:` extensions:
 * - iOS (XCUITest): `mobile: enrollBiometric` and `mobile: sendBiometricMatch`
 * - Android (UiAutomator2, emulator only): `mobile: fingerprint`, after enrolling a fingerprint in Settings
 */
class Biometrics {
  private get iosType(): IosBiometricType {
    return envOr('IOS_BIOMETRIC_TYPE', 'faceId') === 'touchId' ? 'touchId' : 'faceId';
  }

  /** The system "Allow <app> to use Face ID?" prompt, shown once per install. */
  private get iosAllowPrompt() {
    return $('-ios class chain:**/XCUIElementTypeButton[`label == "Allow" OR label == "OK"`]');
  }

  private get androidPrompt() {
    return getByTextMatches('(?i)(Please log in|Login with.*|Touch the fingerprint sensor)');
  }

  /** Enroll biometrics on the device. On Android this walks the Settings fingerprint wizard. */
  async enroll(): Promise<void> {
    if (driver.isIOS) {
      await driver.execute('mobile: enrollBiometric', { isEnabled: true });

      return;
    }

    await AndroidSettings.enrollFingerprint(FINGERPRINT.enrolled);
  }

  /** Answer the biometric prompt the app just triggered, with a matching or a non-matching biometric. */
  async authenticate(successful: boolean): Promise<void> {
    if (driver.isIOS) {
      await this.acceptIosPermissionPrompt();
      await driver.execute('mobile: sendBiometricMatch', { type: this.iosType, match: successful });

      return;
    }

    await this.androidPrompt.waitForDisplayed({ timeout: 10_000 });
    await driver.execute('mobile: fingerprint', {
      fingerprintId: successful ? FINGERPRINT.enrolled : FINGERPRINT.unknown,
    });
  }

  /**
   * The Face ID permission alert belongs to SpringBoard, not to the app, so it is only reachable from the
   * home-screen context. It is shown once per install; when it is absent this is a no-op.
   */
  private async acceptIosPermissionPrompt(): Promise<void> {
    await executeInHomeScreenContext(async () => {
      if (await isShownWithin(this.iosAllowPrompt, 3_000)) {
        await this.iosAllowPrompt.click();
      }
    });
  }
}

export default new Biometrics();
