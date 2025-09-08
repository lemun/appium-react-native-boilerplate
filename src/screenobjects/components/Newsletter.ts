import { getAllByTestId, getByTestId } from '../../helpers/Utils.js';

class Newsletter {
  private get newsletterContainer() {
    return getByTestId('newsletter:view.container');
  }

  private get newsletterContinueButton() {
    return getAllByTestId('newsletter:button.continue');
  }

  private get newsletterFinishButton() {
    return getByTestId('newsletter:button.finish');
  }

  async isDisplayed(): Promise<boolean> {
    try {
      await this.newsletterContainer.waitForDisplayed({ timeout: 2500 });

      return true;
    } catch {
      return false;
    }
  }

  async tapOnContinueButton(slideNumber: number) {
    await this.newsletterContinueButton[slideNumber].click();
  }

  async tapOnFinishButton() {
    await this.newsletterFinishButton.click();
  }

  async closeNewsletter(): Promise<void> {
    await this.navigateNewsletter();
  }

  private async navigateNewsletter(slideNumber: number = 0): Promise<void> {
    if (!(await this.isDisplayed())) return;

    if (await this.newsletterFinishButton.isDisplayed()) {
      await this.tapOnFinishButton();

      return;
    }

    if (driver.isAndroid) {
      await this.tapOnContinueButton(0);
    } else {
      await this.tapOnContinueButton(slideNumber);
    }

    await this.navigateNewsletter(slideNumber + 1);
  }
}

export default new Newsletter();
