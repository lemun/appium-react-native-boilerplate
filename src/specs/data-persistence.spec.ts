import TabBar from '../screenobjects/components/TabBar.ts';
import DataManagementScreen from '../screenobjects/DataManagementScreen.ts';
import { appId, sessionPlatform } from '../config/appPath.ts';
import { relaunchApp } from '../helpers/Utils.ts';
import { t } from '../i18n/index.ts';

async function openDataManagement(): Promise<void> {
  await TabBar.waitForTabBarShown();
  await TabBar.openFromMenu('data-management');
  await DataManagementScreen.waitForIsShown();
}

describe('App data across a relaunch', () => {
  before(openDataManagement);

  it('keeps persisted storage and drops in-memory state', async () => {
    const stamp = `run-${Date.now()}`;

    await DataManagementScreen.save('memory', `memory-${stamp}`);
    await DataManagementScreen.save('async', `async-${stamp}`);

    expect(await DataManagementScreen.storedValue('memory')).toBe(`memory-${stamp}`);
    expect(await DataManagementScreen.storedValue('async')).toBe(`async-${stamp}`);

    await relaunchApp(appId(sessionPlatform()));
    await openDataManagement();

    expect(await DataManagementScreen.storedValue('memory')).toBe(t('data.memory.empty'));
    expect(await DataManagementScreen.storedValue('async')).toBe(`async-${stamp}`);
  });

  it('clears persisted storage on request', async () => {
    await DataManagementScreen.clear('async');

    expect(await DataManagementScreen.storedValue('async')).toBe(t('data.persisted.empty'));
  });
});
