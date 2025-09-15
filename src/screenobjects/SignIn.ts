import App from './App.js';
import { getByTestId } from '../helpers/Utils.js';

const SCREEN_SELECTOR = 'signIn:view.container';

class SignIn extends App {
  constructor() {
    super(SCREEN_SELECTOR);
  }

  get screen() {
    return getByTestId(SCREEN_SELECTOR);
  }

  private get usernameField() {
    return getByTestId('signIn:field.username');
  }

  private get passwordField() {
    return getByTestId('signIn:field.password');
  }

  private get signInButton() {
    return getByTestId('signIn:button.signIn');
  }

  private get signInWithBiometrics() {
    return getByTestId('signIn:button.signInWithBiometrics');
  }

  private get rememberMeCheckbox() {
    return getByTestId('signIn:checkbox.rememberMe');
  }

  async tapOnSignInButton() {
    await this.signInButton.click();
  }

  async tapOnSignInWithBiometricsButton() {
    await this.signInWithBiometrics.click();
  }

  async toggleRememberMeCheckbox(value: boolean) {
    const checkbox = this.rememberMeCheckbox;

    if (!(await checkbox.isDisplayed())) {
      return;
    }

    const currentValue = await checkbox.getAttribute('enabled');

    if (currentValue === value.toString()) {
      return;
    }

    await this.rememberMeCheckbox.click();
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

    if (await driver.isKeyboardShown()) {
      await this.screen.click();
    }

    (this.signInButton).scrollIntoView();
    await this.toggleRememberMeCheckbox(rememberMe);
    await this.signInButton.click();
  }
}

export default new SignIn();
