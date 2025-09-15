import App from './App.js';
import { getByTestId } from '../helpers/Utils.js';
import Newsletter from './components/Newsletter.js';

const SCREEN_SELECTOR = 'home:view.container';

class Home extends App {
  constructor() {
    super(SCREEN_SELECTOR);
  }

  get screen() {
    return getByTestId(SCREEN_SELECTOR);
  }

  async isDisplayed(timeout: number = 30 * 1000): Promise<boolean> {
    return browser.waitUntil(
      async () => {
        if (await this.screen.isDisplayed()) {
          return true;
        }

        if (await Newsletter.isDisplayed()) {
          await Newsletter.closeNewsletter();
          await browser.pause(1000);

          return await this.screen.isDisplayed();
        }

        return false;
      },
      {
        timeout,
        timeoutMsg: `Home screen not displayed after ${timeout}ms. Newsletter handling was attempted.`,
        interval: 1000,
      },
    );
  }
}

export default new Home();
