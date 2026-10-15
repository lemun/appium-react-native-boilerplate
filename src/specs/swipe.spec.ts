import TabBar from '../screenobjects/components/TabBar.ts';
import SwipeScreen, { CAROUSEL_CARDS } from '../screenobjects/SwipeScreen.ts';

describe('Swipe gestures', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.open('Swipe');
    await SwipeScreen.waitForIsShown();
  });

  it('pages through the carousel horizontally', async () => {
    expect(await SwipeScreen.activeCard()).toBe(CAROUSEL_CARDS[0]);

    await SwipeScreen.swipeCarousel('left');
    expect(await SwipeScreen.activeCard()).toBe(CAROUSEL_CARDS[1]);

    await SwipeScreen.swipeCarousel('left');
    expect(await SwipeScreen.activeCard()).toBe(CAROUSEL_CARDS[2]);

    await SwipeScreen.swipeCarousel('right');
    expect(await SwipeScreen.activeCard()).toBe(CAROUSEL_CARDS[1]);
  });

  it('finds the logo hidden below the fold', async () => {
    expect(await SwipeScreen.hiddenLogo.isDisplayed()).toBe(false);

    await SwipeScreen.revealHiddenLogo();

    await expect(SwipeScreen.hiddenLogo).toBeDisplayed();
  });
});
