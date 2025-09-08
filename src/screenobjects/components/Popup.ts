import { getByTestId } from '../../helpers/Utils.js';

class Popup {
  private get popupContainer() {
    return getByTestId('popup:view.container');
  }

  async isDisplayed(): Promise<boolean> {
    return await this.popupContainer.isDisplayed();
  }
}

export default new Popup();
