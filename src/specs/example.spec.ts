import { assertEnvironment, relaunchApp } from '../helpers/Utils.js';
import SignIn from '../screenobjects/SignIn.js';
import Home from '../screenobjects/Home.js';

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