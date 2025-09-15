import { getByTestId } from '../helpers/Utils.js';

export default class App {
  private selector: string;

  constructor(selector: string) {
    this.selector = selector;
  }

  async waitForIsShown(isShown: boolean = true): Promise<boolean> {
    return await getByTestId(this.selector).waitForDisplayed({
      reverse: !isShown,
    });
  }
}
