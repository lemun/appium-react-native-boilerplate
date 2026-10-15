import TabBar from '../screenobjects/components/TabBar.ts';
import LoginScreen from '../screenobjects/LoginScreen.ts';
import WebView from '../helpers/WebView.ts';

const SITE = { url: 'https://webdriver.io/' };

describe('WebView (hybrid) context switching', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.open('Webview');
  });

  it('automates the web page inside the native app', async () => {
    await WebView.within(SITE, async () => {
      expect(await driver.getTitle()).toContain('WebdriverIO');

      await driver.url('https://webdriver.io/docs/gettingstarted');
      await WebView.waitForDocumentReady();
      await expect($('h1')).toHaveText('Getting Started');
    });

    // Back in the native context: native selectors work again.
    await TabBar.open('Login');
    await LoginScreen.waitForIsShown();
  });
});
