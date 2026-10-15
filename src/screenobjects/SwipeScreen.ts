import AppScreen from './AppScreen.ts';
import { getByAccessibilityId, getByTestId, getByText } from '../helpers/Utils.ts';

/** Card titles in carousel order, as rendered (upper case). */
export const CAROUSEL_CARDS = [
  'FULLY OPEN SOURCE',
  'GREAT COMMUNITY',
  'JS.FOUNDATION',
  'SUPPORT VIDEOS',
  'EXTENDABLE',
  'COMPATIBLE',
] as const;

export type CarouselCard = (typeof CAROUSEL_CARDS)[number];

class SwipeScreen extends AppScreen {
  constructor() {
    super('Swipe-screen');
  }

  /** `testID="Carousel"` without an accessibility label: accessibility id on iOS, resource-id on Android. */
  private get carousel() {
    return getByTestId('Carousel');
  }

  /** The logo that is hidden below the fold until you swipe up. */
  get hiddenLogo() {
    return getByAccessibilityId('WebdriverIO logo');
  }

  async swipeCarousel(direction: 'left' | 'right'): Promise<void> {
    await driver.swipe({ direction, scrollableElement: this.carousel, percent: 0.8 });
  }

  /**
   * The active card is the one whose left edge is closest to the carousel's left edge
   * (one card is fully visible, the next one peeks in from the right).
   */
  async activeCard(): Promise<CarouselCard> {
    const carouselX = (await this.carousel.getLocation()).x;
    let best: { card: CarouselCard; distance: number } | undefined;

    for (const card of CAROUSEL_CARDS) {
      const title = getByText(card);

      if (!(await title.isDisplayed())) {
        continue;
      }

      const distance = Math.abs((await title.getLocation()).x - carouselX);

      if (!best || distance < best.distance) {
        best = { card, distance };
      }
    }

    if (!best) {
      throw new Error('No carousel card title is visible');
    }

    return best.card;
  }

  /** Swipe up through the screen until the hidden logo is visible. */
  async revealHiddenLogo(): Promise<void> {
    await this.hiddenLogo.scrollIntoView({ direction: 'down', scrollableElement: this.root, maxScrolls: 5 });
  }
}

export default new SwipeScreen();
