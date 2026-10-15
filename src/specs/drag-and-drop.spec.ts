import TabBar from '../screenobjects/components/TabBar.ts';
import DragScreen, { ALL_PIECES } from '../screenobjects/DragScreen.ts';

describe('Drag and drop', () => {
  beforeEach(async () => {
    await TabBar.waitForTabBarShown();
    await TabBar.open('Drag');
    await DragScreen.waitForIsShown();
  });

  it('solves the puzzle and resets it with Retry', async () => {
    for (const piece of ALL_PIECES) {
      await DragScreen.dropPiece(piece);
    }

    await DragScreen.waitForPuzzleSolved();
    await DragScreen.retry();

    for (const piece of ALL_PIECES) {
      expect(await DragScreen.isPieceInTray(piece)).toBe(true);
    }
  });
});
