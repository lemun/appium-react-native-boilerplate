import AppScreen from './AppScreen.ts';
import { getByAccessibilityId } from '../helpers/Utils.ts';
import { hideKeyboard } from '../helpers/Keyboard.ts';

/**
 * Storage tiers shown on the demo app's "Data management" screen:
 * - `memory`: React state, lost when the process dies
 * - `async`:  persisted key/value (AsyncStorage tier)
 * - `sqlite`: explicit SQLite table
 * - `secure`: Keychain (iOS) / Keystore (Android)
 */
export type StorageTier = 'memory' | 'async' | 'sqlite' | 'secure';

class DataManagementScreen extends AppScreen {
  constructor() {
    super('DataManagement-screen');
  }

  private input(tier: StorageTier) {
    return getByAccessibilityId(`data-${tier}-input`);
  }

  private readout(tier: StorageTier) {
    return getByAccessibilityId(`data-${tier}-readout`);
  }

  private saveButton(tier: StorageTier) {
    return getByAccessibilityId(`button-data-${tier}-save`);
  }

  private clearButton(tier: StorageTier) {
    return getByAccessibilityId(`button-data-${tier}-clear`);
  }

  async save(tier: StorageTier, value: string): Promise<void> {
    await this.input(tier).scrollIntoView({ scrollableElement: this.root });
    await this.input(tier).setValue(value);
    await hideKeyboard(this.readout(tier));
    await this.saveButton(tier).scrollIntoView({ scrollableElement: this.root });
    await this.saveButton(tier).click();
  }

  async clear(tier: StorageTier): Promise<void> {
    await this.clearButton(tier).scrollIntoView({ scrollableElement: this.root });
    await this.clearButton(tier).click();
  }

  /** The stored value as rendered by the app, including its "empty" placeholder text. */
  async storedValue(tier: StorageTier): Promise<string> {
    await this.readout(tier).scrollIntoView({ scrollableElement: this.root });

    return this.readout(tier).getText();
  }
}

export default new DataManagementScreen();
