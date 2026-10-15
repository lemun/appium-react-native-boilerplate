import type { ChainablePromiseElement } from 'webdriverio';
import { getByAccessibilityId } from '../helpers/Utils.ts';

/**
 * Base class for screen objects. A screen is identified by one root element; subclasses expose
 * private element getters and public, intention-revealing actions (never raw selectors).
 */
export default abstract class AppScreen {
  private readonly rootId: string;

  protected constructor(rootId: string) {
    this.rootId = rootId;
  }

  /** The root element that proves the screen is rendered. */
  get root(): ChainablePromiseElement {
    return getByAccessibilityId(this.rootId);
  }

  /** Wait for the screen to be shown (or, with `false`, to be gone). */
  async waitForIsShown(isShown = true, timeout?: number): Promise<void> {
    await this.root.waitForDisplayed({ reverse: !isShown, ...(timeout === undefined ? {} : { timeout }) });
  }

  async isShown(): Promise<boolean> {
    return this.root.isDisplayed();
  }
}
