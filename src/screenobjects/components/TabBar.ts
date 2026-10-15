import { getByAccessibilityId } from '../../helpers/Utils.ts';

/** Screens pinned to the bottom tab bar by default (accessibility labels). */
export type TabName = 'Home' | 'Webview' | 'Login' | 'Forms' | 'Swipe' | 'Drag';

/** Screens that are only reachable through the side menu by default (route names). */
export type MenuOnlyScreen = 'permissions' | 'data-management';

/**
 * The demo app's bottom tab bar plus the side menu behind its "Menu" tab.
 * Tab buttons carry an accessibility label; side-menu rows use `side-menu-item-<route>`.
 */
class TabBar {
  private tab(name: TabName | 'Menu') {
    return getByAccessibilityId(name);
  }

  private get sideMenuPanel() {
    return getByAccessibilityId('tab-side-menu-panel');
  }

  async waitForTabBarShown(timeout = 30_000): Promise<void> {
    await this.tab('Home').waitForDisplayed({ timeout });
  }

  async open(name: TabName): Promise<void> {
    await this.tab(name).click();
  }

  async openFromMenu(screen: MenuOnlyScreen): Promise<void> {
    await this.tab('Menu').click();
    await this.sideMenuPanel.waitForDisplayed();
    await getByAccessibilityId(`side-menu-item-${screen}`).click();
    await this.sideMenuPanel.waitForDisplayed({ reverse: true });
  }
}

export default new TabBar();
