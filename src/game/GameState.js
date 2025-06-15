export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.score = 0;
    this.gameTime = 0;
    this.difficulty = 'normal';
    this.gameOver = false;
    this.level = 1;
    this.enemiesDestroyed = 0;
  }

  getDifficultyMultiplier() {
    switch (this.difficulty) {
      case 'easy': return 0.7;
      case 'hardcore': return 1.5;
      default: return 1.0;
    }
  }

  getCurrentLevel() {
    return Math.floor(this.gameTime / 30) + 1;
  }
}