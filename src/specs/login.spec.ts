import TabBar from '../screenobjects/components/TabBar.ts';
import NativeAlert from '../screenobjects/components/NativeAlert.ts';
import LoginScreen from '../screenobjects/LoginScreen.ts';
import { t } from '../i18n/index.ts';

const VALID = { email: 'test.user@example.com', password: 'Sup3rS3cret!' };

describe('Login and sign-up forms', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.open('Login');
    await LoginScreen.waitForIsShown();
  });

  it('logs in with valid credentials', async () => {
    await LoginScreen.openLoginForm();
    await LoginScreen.submitLoginForm(VALID);

    await NativeAlert.waitForIsShown();
    expect(await NativeAlert.text()).toBe(`${t('login.success.title')}\n${t('login.success.message')}`);
    await NativeAlert.dismiss('OK');
  });

  it('rejects an invalid email and a short password', async () => {
    await LoginScreen.openLoginForm();
    await LoginScreen.submitLoginForm({ email: 'not-an-email', password: 'short' });

    expect(await LoginScreen.isValidationErrorShown(t('login.error.email'))).toBe(true);
    expect(await LoginScreen.isValidationErrorShown(t('login.error.password'))).toBe(true);
  });

  it('signs up with matching passwords', async () => {
    await LoginScreen.openSignUpForm();
    await LoginScreen.submitSignUpForm(VALID);

    await NativeAlert.waitForIsShown();
    expect(await NativeAlert.text()).toBe(`${t('signUp.success.title')}\n${t('signUp.success.message')}`);
    await NativeAlert.dismiss('OK');
  });

  it('refuses a sign-up when the passwords differ', async () => {
    await LoginScreen.openSignUpForm();
    await LoginScreen.submitSignUpForm({ ...VALID, repeatPassword: 'Different123!' });

    expect(await LoginScreen.isValidationErrorShown(t('signUp.error.repeatPassword'))).toBe(true);
    await NativeAlert.waitForIsShown(false, 3_000);
  });
});
