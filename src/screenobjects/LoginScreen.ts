import AppScreen from './AppScreen.ts';
import { getByAccessibilityId, getByText, isShownWithin } from '../helpers/Utils.ts';
import { hideKeyboard } from '../helpers/Keyboard.ts';

export type Credentials = { email: string; password: string };

class LoginScreen extends AppScreen {
  constructor() {
    super('Login-screen');
  }

  private get loginTab() {
    return getByAccessibilityId('button-login-container');
  }

  private get signUpTab() {
    return getByAccessibilityId('button-sign-up-container');
  }

  private get emailField() {
    return getByAccessibilityId('input-email');
  }

  private get passwordField() {
    return getByAccessibilityId('input-password');
  }

  private get repeatPasswordField() {
    return getByAccessibilityId('input-repeat-password');
  }

  private get loginButton() {
    return getByAccessibilityId('button-LOGIN');
  }

  private get signUpButton() {
    return getByAccessibilityId('button-SIGN UP');
  }

  private get biometricButton() {
    return getByAccessibilityId('button-biometric');
  }

  async openLoginForm(): Promise<void> {
    await this.loginTab.click();
    await this.repeatPasswordField.waitForDisplayed({ reverse: true });
  }

  async openSignUpForm(): Promise<void> {
    await this.signUpTab.click();
    await this.repeatPasswordField.waitForDisplayed();
  }

  async submitLoginForm({ email, password }: Credentials): Promise<void> {
    await this.emailField.setValue(email);
    await this.passwordField.setValue(password);
    await hideKeyboard(this.root);
    await this.loginButton.scrollIntoView({ scrollableElement: this.root });
    await this.loginButton.click();
  }

  async submitSignUpForm({ email, password, repeatPassword = password }: Credentials & { repeatPassword?: string }) {
    await this.emailField.setValue(email);
    await this.passwordField.setValue(password);
    await this.repeatPasswordField.setValue(repeatPassword);
    await hideKeyboard(this.root);
    await this.signUpButton.scrollIntoView({ scrollableElement: this.root });
    await this.signUpButton.click();
  }

  /** The biometric button is only rendered when Touch ID / Face ID / a fingerprint is enrolled. */
  async isBiometricButtonShown(timeout = 3_000): Promise<boolean> {
    return isShownWithin(this.biometricButton, timeout);
  }

  async tapBiometricButton(): Promise<void> {
    await this.biometricButton.click();
  }

  /** Whether an inline validation message with this exact text is visible. */
  async isValidationErrorShown(message: string, timeout = 5_000): Promise<boolean> {
    return isShownWithin(getByText(message), timeout);
  }
}

export default new LoginScreen();
