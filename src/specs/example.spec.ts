import { assertEnvironment } from '../helpers/Utils.js';
import SignIn from '../screenobjects/SignIn.js';

describe('Sign In Tests', () => {
  it('should fill sign in form and login', async () => {
    await SignIn.waitForIsShown(true);
    await SignIn.submitSignInForm({
      username: assertEnvironment('USER_USERNAME'),
      password: assertEnvironment('USER_PASSWORD'),
      rememberMe: false,
    });
  });
});