import TabBar from '../screenobjects/components/TabBar.ts';
import NativeAlert from '../screenobjects/components/NativeAlert.ts';
import LoginScreen from '../screenobjects/LoginScreen.ts';
import Biometrics from '../helpers/Biometrics.ts';
import { appId, sessionPlatform } from '../config/appPath.ts';
import { executeInHomeScreenContext, relaunchApp } from '../helpers/Utils.ts';
import { t } from '../i18n/index.ts';

async function openLogin(): Promise<void> {
  await TabBar.waitForTabBarShown();
  await TabBar.open('Login');
  await LoginScreen.waitForIsShown();
  await LoginScreen.openLoginForm();
}

/**
 * The demo app only renders the biometric button when the device has Face ID / Touch ID / a fingerprint
 * enrolled. Enrollment is done once per device: trivial on iOS simulators, a Settings wizard on Android.
 */
describe('Biometric login', () => {
  before(async function () {
    await openLogin();

    if (!(await LoginScreen.isBiometricButtonShown())) {
      await Biometrics.enroll();
      await relaunchApp(appId(sessionPlatform()));
      await openLogin();
    }

    if (!(await LoginScreen.isBiometricButtonShown(10_000))) {
      // Honest skip instead of a false failure, e.g. on Android images without the fingerprint wizard.
      this.skip();
    }
  });

  beforeEach(openLogin);

  it('logs in with a matching biometric', async () => {
    await LoginScreen.tapBiometricButton();
    await Biometrics.authenticate(true);

    await NativeAlert.waitForIsShown();
    expect(await NativeAlert.text()).toContain(t('login.success.title'));
    expect(await NativeAlert.text()).toMatch(/You are logged in through \w+!/);
    await NativeAlert.dismiss('OK');
  });

  it('does not log in with a non-matching biometric', async () => {
    await LoginScreen.tapBiometricButton();
    await Biometrics.authenticate(false);

    if (driver.isIOS) {
      // The "not recognized" sheet belongs to SpringBoard; cancel it from the home-screen context.
      await executeInHomeScreenContext(async () => {
        await NativeAlert.waitForIsShown();
        await NativeAlert.tapButton('Cancel');
      });
    } else {
      await NativeAlert.tapButton('Cancel');
    }

    await NativeAlert.waitForIsShown(false);
    await LoginScreen.waitForIsShown();
  });
});
