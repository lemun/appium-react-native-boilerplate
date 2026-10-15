import TabBar from '../screenobjects/components/TabBar.ts';
import NativeAlert from '../screenobjects/components/NativeAlert.ts';
import FormsScreen from '../screenobjects/FormsScreen.ts';
import { t } from '../i18n/index.ts';

describe('Form components', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.open('Forms');
    await FormsScreen.waitForIsShown();
  });

  it('echoes typed text', async () => {
    const text = 'Hello from Appium 3';

    await FormsScreen.typeText(text);

    await expect(FormsScreen.inputResult).toHaveText(text);
  });

  it('toggles the switch on and off', async () => {
    expect(await FormsScreen.isSwitchOn()).toBe(false);
    await expect(FormsScreen.switchText).toHaveText(t('forms.switch.turnOn'));

    await FormsScreen.toggleSwitch();
    expect(await FormsScreen.isSwitchOn()).toBe(true);
    await expect(FormsScreen.switchText).toHaveText(t('forms.switch.turnOff'));

    await FormsScreen.toggleSwitch();
    expect(await FormsScreen.isSwitchOn()).toBe(false);
  });

  it('selects a value from the native dropdown', async () => {
    for (const option of ['Appium is awesome', 'webdriver.io is awesome']) {
      await FormsScreen.selectDropdownOption(option);
      expect(await FormsScreen.dropdownValue()).toBe(option);
    }
  });

  it('shows an alert for the active button only', async () => {
    await FormsScreen.tapInactiveButton();
    await NativeAlert.waitForIsShown(false, 2_000);

    await FormsScreen.tapActiveButton();
    await NativeAlert.waitForIsShown();
    expect(await NativeAlert.text()).toBe(`${t('forms.alert.title')}\n${t('forms.alert.message')}`);
    await NativeAlert.dismiss('Ask me later');
  });
});
