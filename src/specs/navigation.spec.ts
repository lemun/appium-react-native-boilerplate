import TabBar, { type TabName } from '../screenobjects/components/TabBar.ts';
import type AppScreen from '../screenobjects/AppScreen.ts';
import HomeScreen from '../screenobjects/HomeScreen.ts';
import LoginScreen from '../screenobjects/LoginScreen.ts';
import FormsScreen from '../screenobjects/FormsScreen.ts';
import SwipeScreen from '../screenobjects/SwipeScreen.ts';
import DragScreen from '../screenobjects/DragScreen.ts';
import DataManagementScreen from '../screenobjects/DataManagementScreen.ts';

const TABS: [TabName, AppScreen][] = [
  ['Login', LoginScreen],
  ['Forms', FormsScreen],
  ['Swipe', SwipeScreen],
  ['Drag', DragScreen],
  ['Home', HomeScreen],
];

describe('Navigation', () => {
  before(async () => {
    await TabBar.waitForTabBarShown();
  });

  it('starts on the home screen', async () => {
    await HomeScreen.waitForIsShown();
  });

  for (const [tab, screen] of TABS) {
    it(`opens the ${tab} screen from the tab bar`, async () => {
      await TabBar.open(tab);
      await screen.waitForIsShown();
    });
  }

  it('opens a menu-only screen through the side menu', async () => {
    await TabBar.openFromMenu('data-management');
    await DataManagementScreen.waitForIsShown();
  });
});
