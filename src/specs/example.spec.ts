import { assertEnvironment, relaunchApp } from '../helpers/Utils.js';
import Biometrics from '../helpers/Biometrics.js';
import Android from '../helpers/Android.js';
import SignIn from '../screenobjects/SignIn.js';
import Home from '../screenobjects/Home.js';
import Popup from '../screenobjects/components/Popup.js';

describe('Sign In Tests', () => {
  it('should fill sign in form and login', async () => {
    await SignIn.waitForIsShown(true);
    await SignIn.submitSignInForm({
      username: assertEnvironment('USER_USERNAME'),
      password: assertEnvironment('USER_PASSWORD'),
      rememberMe: false,
    });

    expect(await Home.isDisplayed()).toBe(true);
  });

  it('should expect user to not be remembered', async () => {
    await relaunchApp(assertEnvironment('BUNDLE_ID'));
    expect(await Home.screen.isDisplayed()).toBe(false);
  });
});



describe('Sign In With Biometric Tests', () => {
  it('should give biometrics permission and login with biometrics', async () => {
    await SignIn.waitForIsShown(true);
    await SignIn.tapOnSignInWithBiometricsButton();

    if (await Popup.isDisplayed()) {
        if (driver.isIOS) {
          await driver.toggleEnrollTouchId(true);
        } else {
          await Android.enableBiometricLogin();
        }
  
        await relaunchApp(assertEnvironment('BUNDLE_ID'));
  
        await SignIn.waitForIsShown(true);
        await SignIn.tapOnSignInWithBiometricsButton();
    }

      await Biometrics.submitBiometricSignIn(true);
      expect(await Home.isDisplayed()).toBe(true);
  });
});