import AppScreen from './AppScreen.ts';
import { getByAccessibilityId } from '../helpers/Utils.ts';

/** Puzzle positions: Left/Center/Right column, row 1-3. */
export type PieceId = `${'l' | 'c' | 'r'}${1 | 2 | 3}`;

export const ALL_PIECES: readonly PieceId[] = ['l1', 'c1', 'r1', 'l2', 'c2', 'r2', 'l3', 'c3', 'r3'];

class DragScreen extends AppScreen {
  constructor() {
    super('Drag-drop-screen');
  }

  private piece(id: PieceId) {
    return getByAccessibilityId(`drag-${id}`);
  }

  private dropZone(id: PieceId) {
    return getByAccessibilityId(`drop-${id}`);
  }

  private get retryButton() {
    return getByAccessibilityId('button-Retry');
  }

  private get renewButton() {
    return getByAccessibilityId('renew');
  }

  /** Drag a piece onto its matching drop zone (uses the W3C Actions based `dragAndDrop`). */
  async dropPiece(id: PieceId): Promise<void> {
    await this.piece(id).dragAndDrop(this.dropZone(id));
  }

  async isPieceInTray(id: PieceId): Promise<boolean> {
    return this.piece(id).isDisplayed();
  }

  async waitForPuzzleSolved(): Promise<void> {
    await this.retryButton.waitForDisplayed({ timeout: 10_000 });
  }

  async retry(): Promise<void> {
    await this.retryButton.click();
    await this.renewButton.waitForDisplayed();
  }
}

export default new DragScreen();
