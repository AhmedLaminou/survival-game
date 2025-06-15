export class GameHUD {
  constructor() {
    this.hudElement = null;
    this.startScreenElement = null;
    this.gameOverScreenElement = null;
    this.pauseScreenElement = null;
    
    this.scoreElement = null;
    this.shieldsElement = null;
    this.fuelElement = null;
    this.levelElement = null;
  }

  init() {
    this.createHUD();
    this.createStartScreen();
    this.createGameOverScreen();
    this.createPauseScreen();
  }

  createHUD() {
    this.hudElement = document.createElement('div');
    this.hudElement.id = 'game-hud';
    this.hudElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1000;
      font-family: 'Courier New', monospace;
      color: #00ff00;
      display: none;
    `;

    // Top bar with score and level
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      right: 20px;
      display: flex;
      justify-content: space-between;
      font-size: 18px;
      text-shadow: 0 0 10px #00ff00;
    `;

    this.scoreElement = document.createElement('div');
    this.scoreElement.textContent = 'SCORE: 0';
    
    this.levelElement = document.createElement('div');
    this.levelElement.textContent = 'LEVEL: 1';

    topBar.appendChild(this.scoreElement);
    topBar.appendChild(this.levelElement);

    // Bottom left - Shields
    const shieldsContainer = document.createElement('div');
    shieldsContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      font-size: 16px;
    `;

    const shieldsLabel = document.createElement('div');
    shieldsLabel.textContent = 'SHIELDS:';
    shieldsLabel.style.marginBottom = '5px';

    this.shieldsElement = document.createElement('div');
    this.shieldsElement.style.cssText = `
      display: flex;
      gap: 5px;
    `;

    shieldsContainer.appendChild(shieldsLabel);
    shieldsContainer.appendChild(this.shieldsElement);

    // Bottom right - Fuel
    const fuelContainer = document.createElement('div');
    fuelContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      font-size: 16px;
      width: 200px;
    `;

    const fuelLabel = document.createElement('div');
    fuelLabel.textContent = 'FUEL:';
    fuelLabel.style.marginBottom = '5px';

    this.fuelElement = document.createElement('div');
    this.fuelElement.style.cssText = `
      width: 100%;
      height: 20px;
      border: 2px solid #00ff00;
      background: rgba(0, 0, 0, 0.5);
      position: relative;
    `;

    const fuelBar = document.createElement('div');
    fuelBar.id = 'fuel-bar';
    fuelBar.style.cssText = `
      height: 100%;
      background: linear-gradient(90deg, #ff4400, #ffaa00, #00ff00);
      width: 100%;
      transition: width 0.3s ease;
    `;

    this.fuelElement.appendChild(fuelBar);
    fuelContainer.appendChild(fuelLabel);
    fuelContainer.appendChild(this.fuelElement);

    // Instructions
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      font-size: 12px;
      opacity: 0.7;
      line-height: 1.5;
    `;
    instructions.innerHTML = `
      W/S - Forward/Brake<br>
      A/D - Turn Left/Right<br>
      SPACE - Boost<br>
      P - Pause<br>
      F11 - Fullscreen
    `;

    this.hudElement.appendChild(topBar);
    this.hudElement.appendChild(shieldsContainer);
    this.hudElement.appendChild(fuelContainer);
    this.hudElement.appendChild(instructions);

    document.body.appendChild(this.hudElement);
  }

  createStartScreen() {
    this.startScreenElement = document.createElement('div');
    this.startScreenElement.id = 'start-screen';
    this.startScreenElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 17, 0.9);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      font-family: 'Courier New', monospace;
      color: #00ff00;
      text-align: center;
    `;

    const title = document.createElement('h1');
    title.textContent = 'ASTEROID NAVIGATOR';
    title.style.cssText = `
      font-size: 48px;
      margin-bottom: 10px;
      text-shadow: 0 0 20px #00ff00;
      animation: glow 2s ease-in-out infinite alternate;
    `;

    const subtitle = document.createElement('h2');
    subtitle.textContent = 'Deep Space Survival';
    subtitle.style.cssText = `
      font-size: 24px;
      margin-bottom: 40px;
      opacity: 0.8;
    `;

    const difficultyTitle = document.createElement('div');
    difficultyTitle.textContent = 'SELECT DIFFICULTY:';
    difficultyTitle.style.cssText = `
      font-size: 18px;
      margin-bottom: 20px;
    `;

    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 20px;
      margin-bottom: 40px;
    `;

    ['EASY', 'NORMAL', 'HARDCORE'].forEach((difficulty) => {
      const button = document.createElement('button');
      button.textContent = difficulty;
      button.style.cssText = `
        padding: 15px 30px;
        font-family: 'Courier New', monospace;
        font-size: 16px;
        background: transparent;
        border: 2px solid #00ff00;
        color: #00ff00;
        cursor: pointer;
        transition: all 0.3s ease;
        text-shadow: 0 0 10px #00ff00;
        pointer-events: auto;
      `;

      button.addEventListener('mouseenter', () => {
        button.style.background = '#00ff00';
        button.style.color = '#000';
        button.style.textShadow = 'none';
      });

      button.addEventListener('mouseleave', () => {
        button.style.background = 'transparent';
        button.style.color = '#00ff00';
        button.style.textShadow = '0 0 10px #00ff00';
      });

      button.addEventListener('click', () => {
        window.gameInstance.startGame(difficulty.toLowerCase());
      });

      buttonContainer.appendChild(button);
    });

    const instructions = document.createElement('div');
    instructions.style.cssText = `
      font-size: 14px;
      line-height: 1.6;
      opacity: 0.8;
      max-width: 600px;
    `;
    instructions.innerHTML = `
      Navigate your spaceship through an endless asteroid field.<br>
      Collect fuel and shield pickups to survive longer.<br>
      Avoid asteroids or take damage to your shields.<br><br>
      Use W/S to move, A/D to turn, and SPACE to boost.
    `;

    // Add CSS animation for glow effect
    const style = document.createElement('style');
    style.textContent = `
      @keyframes glow {
        from { text-shadow: 0 0 20px #00ff00; }
        to { text-shadow: 0 0 30px #00ff00, 0 0 40px #00ff00; }
      }
    `;
    document.head.appendChild(style);

    this.startScreenElement.appendChild(title);
    this.startScreenElement.appendChild(subtitle);
    this.startScreenElement.appendChild(difficultyTitle);
    this.startScreenElement.appendChild(buttonContainer);
    this.startScreenElement.appendChild(instructions);

    document.body.appendChild(this.startScreenElement);
  }

  createGameOverScreen() {
    this.gameOverScreenElement = document.createElement('div');
    this.gameOverScreenElement.id = 'game-over-screen';
    this.gameOverScreenElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 17, 0.9);
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 2000;
      font-family: 'Courier New', monospace;
      color: #ff4400;
      text-align: center;
    `;

    const gameOverTitle = document.createElement('h1');
    gameOverTitle.textContent = 'GAME OVER';
    gameOverTitle.style.cssText = `
      font-size: 48px;
      margin-bottom: 20px;
      text-shadow: 0 0 20px #ff4400;
    `;

    const finalScore = document.createElement('div');
    finalScore.id = 'final-score';
    finalScore.style.cssText = `
      font-size: 24px;
      margin-bottom: 30px;
      color: #00ff00;
    `;

    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART (R)';
    restartButton.style.cssText = `
      padding: 15px 30px;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      background: transparent;
      border: 2px solid #ff4400;
      color: #ff4400;
      cursor: pointer;
      transition: all 0.3s ease;
      margin-bottom: 20px;
      pointer-events: auto;
    `;

    restartButton.addEventListener('click', () => {
      window.gameInstance.restartGame();
    });

    const newGameButton = document.createElement('button');
    newGameButton.textContent = 'NEW GAME';
    newGameButton.style.cssText = `
      padding: 15px 30px;
      font-family: 'Courier New', monospace;
      font-size: 18px;
      background: transparent;
      border: 2px solid #00ff00;
      color: #00ff00;
      cursor: pointer;
      transition: all 0.3s ease;
      pointer-events: auto;
    `;

    newGameButton.addEventListener('click', () => {
      this.hideGameOverScreen();
      this.showStartScreen();
    });

    this.gameOverScreenElement.appendChild(gameOverTitle);
    this.gameOverScreenElement.appendChild(finalScore);
    this.gameOverScreenElement.appendChild(restartButton);
    this.gameOverScreenElement.appendChild(newGameButton);

    document.body.appendChild(this.gameOverScreenElement);
  }

  createPauseScreen() {
    this.pauseScreenElement = document.createElement('div');
    this.pauseScreenElement.id = 'pause-screen';
    this.pauseScreenElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 1500;
      font-family: 'Courier New', monospace;
      color: #ffaa00;
      text-align: center;
    `;

    const pauseTitle = document.createElement('h1');
    pauseTitle.textContent = 'PAUSED';
    pauseTitle.style.cssText = `
      font-size: 48px;
      text-shadow: 0 0 20px #ffaa00;
    `;

    const pauseInstructions = document.createElement('div');
    pauseInstructions.textContent = 'Press P or R to resume';
    pauseInstructions.style.cssText = `
      font-size: 18px;
      margin-top: 20px;
      opacity: 0.8;
    `;

    this.pauseScreenElement.appendChild(pauseTitle);
    this.pauseScreenElement.appendChild(pauseInstructions);

    document.body.appendChild(this.pauseScreenElement);
  }

  showStartScreen() {
    this.startScreenElement.style.display = 'flex';
  }

  hideStartScreen() {
    this.startScreenElement.style.display = 'none';
  }

  showGameOverScreen(score) {
    const finalScoreElement = this.gameOverScreenElement.querySelector('#final-score');
    finalScoreElement.textContent = `FINAL SCORE: ${score}`;
    this.gameOverScreenElement.style.display = 'flex';
  }

  hideGameOverScreen() {
    this.gameOverScreenElement.style.display = 'none';
  }

  showPauseScreen(show) {
    this.pauseScreenElement.style.display = show ? 'flex' : 'none';
  }

  show() {
    this.hudElement.style.display = 'block';
  }

  hide() {
    this.hudElement.style.display = 'none';
  }

  update(gameState, spaceship) {
    if (!this.scoreElement || !this.shieldsElement || !this.fuelElement) return;

    // Update score
    this.scoreElement.textContent = `SCORE: ${gameState.score}`;
    
    // Update level
    this.levelElement.textContent = `LEVEL: ${gameState.getCurrentLevel()}`;

    // Update shields
    this.shieldsElement.innerHTML = '';
    for (let i = 0; i < 3; i++) {
      const shield = document.createElement('div');
      shield.style.cssText = `
        width: 30px;
        height: 30px;
        border: 2px solid #00ff00;
        background: ${i < spaceship.shields ? '#00ff00' : 'transparent'};
        opacity: ${i < spaceship.shields ? '1' : '0.3'};
      `;
      this.shieldsElement.appendChild(shield);
    }

    // Update fuel bar
    const fuelBar = document.getElementById('fuel-bar');
    if (fuelBar) {
      const fuelPercentage = (spaceship.fuel / spaceship.maxFuel) * 100;
      fuelBar.style.width = `${fuelPercentage}%`;
    }
  }

  dispose() {
    if (this.hudElement) this.hudElement.remove();
    if (this.startScreenElement) this.startScreenElement.remove();
    if (this.gameOverScreenElement) this.gameOverScreenElement.remove();
    if (this.pauseScreenElement) this.pauseScreenElement.remove();
  }
}