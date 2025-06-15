import * as THREE from 'three';
import { Spaceship } from '../entities/Spaceship';
import { AsteroidField } from '../entities/AsteroidField';
import { ParticleSystem } from '../systems/ParticleSystem';
import { AudioManager } from '../systems/AudioManager';
import { GameHUD } from '../ui/GameHUD';
import { AuthenticationScreen } from '../ui/AuthenticationScreen';
import { GameState } from './GameState';
import { WeaponSystem } from '../entities/WeaponSystem';
import { BossAsteroid } from '../entities/BossAsteroid';
import { PlayerInput, GameConfig, PlayerData } from '../../types/GameTypes';

export class Game {
  private canvas: HTMLCanvasElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  
  // Game entities
  private spaceship: Spaceship | null = null;
  private asteroidField: AsteroidField | null = null;
  private particleSystem: ParticleSystem | null = null;
  private starField: THREE.Points | null = null;
  private weaponSystem: WeaponSystem | null = null;
  private bossAsteroid: BossAsteroid | null = null;
  
  // Game systems
  private audioManager: AudioManager;
  private gameHUD: GameHUD;
  private authScreen: AuthenticationScreen;
  private gameState: GameState;
  
  // Input and state
  private keys: { [key: string]: boolean } = {};
  private isGameRunning: boolean = false;
  private isPaused: boolean = false;
  private redFlashIntensity: number = 0;
  
  // Mobile controls
  private isMobile: boolean = false;
  private touchStartPosition: { x: number; y: number } | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    this.clock = new THREE.Clock();
    
    // Initialize systems
    this.audioManager = new AudioManager();
    this.gameHUD = new GameHUD();
    this.authScreen = new AuthenticationScreen();
    this.gameState = new GameState();
    
    // Detect mobile
    this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    this.init();
    this.setupEventListeners();
  }

  private init(): void {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    // Setup scene
    this.scene.background = new THREE.Color(0x000011);
    this.scene.fog = new THREE.Fog(0x000011, 50, 200);
    
    // Setup camera
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);
    
    // Create lighting
    this.setupLighting();
    
    // Create starfield
    this.createStarField();
    
    // Initialize game entities
    this.spaceship = new Spaceship(this.scene);
    this.asteroidField = new AsteroidField(this.scene);
    this.particleSystem = new ParticleSystem(this.scene);
    this.weaponSystem = new WeaponSystem(this.scene);
    this.bossAsteroid = new BossAsteroid(this.scene);
    
    // Initialize UI
    this.gameHUD.init();
    this.authScreen.init();
    
    // Setup authentication callback
    this.authScreen.onLoginSuccess = (userData: PlayerData) => {
      this.gameState.setPlayerData(userData);
      this.showStartScreen();
    };
    
    // Check if user is already logged in
    if (this.authScreen.isLoggedIn()) {
      const userData = this.authScreen.getCurrentUser();
      if (userData) {
        this.gameState.setPlayerData(userData);
      }
      this.showStartScreen();
    } else {
      this.authScreen.show();
    }
  }

  private setupLighting(): void {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);
    
    // Directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    this.scene.add(directionalLight);
    
    // Point light for dynamic lighting
    const pointLight = new THREE.PointLight(0x4488ff, 0.7, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);
    
    // Ship lights
    const shipLight = new THREE.SpotLight(0x00ffff, 0.8, 30, Math.PI / 6, 0.3);
    shipLight.position.set(0, 2, 5);
    shipLight.target.position.set(0, 0, -10);
    this.scene.add(shipLight);
    this.scene.add(shipLight.target);
  }

  private createStarField(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: false
    });
    
    const starVertices = [];
    const starColors = [];
    
    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
      
      // Add some color variation
      const color = new THREE.Color();
      color.setHSL(Math.random() * 0.1 + 0.55, 0.5, 0.5 + Math.random() * 0.5);
      starColors.push(color.r, color.g, color.b);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    
    starMaterial.vertexColors = true;
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Touch events for mobile
    if (this.isMobile) {
      this.setupMobileControls();
    }
    
    // Mouse events for desktop
    this.canvas.addEventListener('click', (event) => this.onMouseClick(event));
  }

  private setupMobileControls(): void {
    // Create mobile control overlay
    const controlsOverlay = document.createElement('div');
    controlsOverlay.id = 'mobile-controls';
    controlsOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 500;
    `;

    // Movement joystick (left side)
    const moveStick = document.createElement('div');
    moveStick.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      width: 120px;
      height: 120px;
      border: 3px solid rgba(0, 255, 0, 0.3);
      border-radius: 50%;
      pointer-events: auto;
      background: rgba(0, 0, 0, 0.3);
    `;

    const moveKnob = document.createElement('div');
    moveKnob.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 40px;
      height: 40px;
      background: rgba(0, 255, 0, 0.6);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    moveStick.appendChild(moveKnob);

    // Fire button (right side)
    const fireButton = document.createElement('button');
    fireButton.style.cssText = `
      position: absolute;
      bottom: 20px;
      right: 20px;
      width: 80px;
      height: 80px;
      border: 3px solid rgba(255, 0, 0, 0.6);
      border-radius: 50%;
      background: rgba(255, 0, 0, 0.3);
      color: rgba(255, 255, 255, 0.8);
      font-size: 12px;
      pointer-events: auto;
    `;
    fireButton.textContent = 'FIRE';

    // Boost button
    const boostButton = document.createElement('button');
    boostButton.style.cssText = `
      position: absolute;
      bottom: 120px;
      right: 20px;
      width: 60px;
      height: 60px;
      border: 2px solid rgba(0, 255, 255, 0.6);
      border-radius: 50%;
      background: rgba(0, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.8);
      font-size: 10px;
      pointer-events: auto;
    `;
    boostButton.textContent = 'BOOST';

    controlsOverlay.appendChild(moveStick);
    controlsOverlay.appendChild(fireButton);
    controlsOverlay.appendChild(boostButton);
    document.body.appendChild(controlsOverlay);

    // Touch event handlers
    this.setupMobileTouchHandlers(moveStick, moveKnob, fireButton, boostButton);
  }

  private setupMobileTouchHandlers(
    moveStick: HTMLElement, 
    moveKnob: HTMLElement, 
    fireButton: HTMLElement, 
    boostButton: HTMLElement
  ): void {
    // Movement stick handlers
    moveStick.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.touchStartPosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    });

    moveStick.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!this.touchStartPosition) return;

      const touch = e.touches[0];
      const rect = moveStick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const deltaX = touch.clientX - centerX;
      const deltaY = touch.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const maxDistance = rect.width / 2 - 20;
      
      const constrainedDistance = Math.min(distance, maxDistance);
      const angle = Math.atan2(deltaY, deltaX);
      
      const knobX = Math.cos(angle) * constrainedDistance;
      const knobY = Math.sin(angle) * constrainedDistance;
      
      moveKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
      
      // Set movement keys based on knob position
      this.keys['KeyW'] = knobY < -10;
      this.keys['KeyS'] = knobY > 10;
      this.keys['KeyA'] = knobX < -10;
      this.keys['KeyD'] = knobX > 10;
    });

    moveStick.addEventListener('touchend', (e) => {
      e.preventDefault();
      moveKnob.style.transform = 'translate(-50%, -50%)';
      this.keys['KeyW'] = false;
      this.keys['KeyS'] = false;
      this.keys['KeyA'] = false;
      this.keys['KeyD'] = false;
      this.touchStartPosition = null;
    });

    // Fire button
    fireButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys['ClickFire'] = true;
    });

    fireButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys['ClickFire'] = false;
    });

    // Boost button
    boostButton.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.keys['Space'] = true;
    });

    boostButton.addEventListener('touchend', (e) => {
      e.preventDefault();
      this.keys['Space'] = false;
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keys[event.code] = true;
    
    switch (event.code) {
      case 'KeyP':
        if (this.isGameRunning) this.togglePause();
        break;
      case 'KeyR':
        if (this.gameState.gameOver) {
          this.restartGame();
        } else if (this.isPaused) {
          this.togglePause();
        }
        break;
      case 'F11':
        this.toggleFullscreen();
        event.preventDefault();
        break;
      case 'Escape':
        if (this.isGameRunning) this.togglePause();
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }

  private onMouseClick(event: MouseEvent): void {
    if (this.isGameRunning && !this.isPaused && this.weaponSystem) {
      this.keys['ClickFire'] = true;
      // Reset after a short delay
      setTimeout(() => {
        this.keys['ClickFire'] = false;
      }, 100);
    }
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private togglePause(): void {
    this.isPaused = !this.isPaused;
    this.gameHUD.showPauseScreen(this.isPaused);
    if (this.isPaused) {
      this.audioManager.pauseAll();
    } else {
      this.audioManager.resumeAll();
    }
  }

  private toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }

  private showStartScreen(): void {
    this.gameHUD.showStartScreen();
  }

  public startGame(config: GameConfig): void {
    this.isGameRunning = true;
    this.gameState.reset();
    this.gameState.difficulty = config.difficulty;
    
    // Reset entities
    this.spaceship?.reset();
    this.asteroidField?.reset();
    this.particleSystem?.reset();
    this.weaponSystem = new WeaponSystem(this.scene);
    
    // Update spaceship model based on selection
    if (config.selectedShip !== undefined && this.spaceship) {
      this.spaceship.setShipModel(config.selectedShip);
    }
    
    // Hide start screen and show HUD
    this.gameHUD.hideStartScreen();
    this.gameHUD.show();
    
    // Start background music
    this.audioManager.playBackgroundMusic();
    
    // Start game loop
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.isGameRunning) return;
    
    requestAnimationFrame(() => this.gameLoop());
    
    if (this.isPaused) return;
    
    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render();
  }

  private update(deltaTime: number): void {
    // Update game time and score
    this.gameState.gameTime += deltaTime;
    this.gameState.distance += deltaTime * 10; // Approximate distance based on time
    this.gameState.score = Math.floor(this.gameState.gameTime * 10 + this.gameState.distance / 10);
    
    // Process input
    const input = this.processInput();
    
    // Update entities
    this.spaceship?.update(deltaTime, input);
    this.asteroidField?.update(deltaTime, this.gameState);
    this.particleSystem?.update(deltaTime);
    this.weaponSystem?.update(deltaTime);
    
    // Update boss if active
    if (this.bossAsteroid && this.gameState.getCurrentLevelData().hasBoss) {
      const shipPos = this.spaceship?.getPosition();
      if (shipPos) {
        this.bossAsteroid.update(deltaTime, shipPos);
      }
    }
    
    // Update camera to follow spaceship
    this.updateCamera();
    
    // Check collisions
    this.checkCollisions();
    
    // Update red flash effect
    if (this.redFlashIntensity > 0) {
      this.redFlashIntensity = Math.max(0, this.redFlashIntensity - deltaTime * 2);
      this.renderer.domElement.style.filter = `sepia(1) hue-rotate(-60deg) saturate(2) brightness(${1 + this.redFlashIntensity})`;
    } else {
      this.renderer.domElement.style.filter = 'none';
    }
    
    // Update HUD
    this.gameHUD.update(this.gameState, this.spaceship, this.bossAsteroid);
    
    // Animate starfield
    if (this.starField) {
      this.starField.rotation.z += 0.0001;
      this.starField.rotation.y += 0.00005;
    }
    
    // Update difficulty and check level progression
    this.updateDifficulty();
    this.checkMissionProgress();
  }

  private processInput(): PlayerInput {
    return {
      forward: this.keys['KeyW'] || this.keys['ArrowUp'],
      backward: this.keys['KeyS'] || this.keys['ArrowDown'],
      left: this.keys['KeyA'] || this.keys['ArrowLeft'],
      right: this.keys['KeyD'] || this.keys['ArrowRight'],
      boost: this.keys['Space'],
      fire: this.keys['ClickFire'] || this.keys['ShiftLeft'] || this.keys['ShiftRight']
    };
  }

  private updateCamera(): void {
    if (!this.spaceship) return;
    
    const shipPosition = this.spaceship.getPosition();
    const targetPosition = new THREE.Vector3(
      shipPosition.x,
      shipPosition.y + 5,
      shipPosition.z + 10
    );
    
    this.camera.position.lerp(targetPosition, 0.05);
    this.camera.lookAt(shipPosition.x, shipPosition.y, shipPosition.z - 5);
  }

  private checkCollisions(): void {
    if (!this.spaceship || !this.asteroidField) return;
    
    const shipPosition = this.spaceship.getPosition();
    const shipRadius = 1.5;
    
    // Check asteroid collisions
    const asteroids = this.asteroidField.getAsteroids();
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      const distance = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z)
        .distanceTo(asteroid.position);
      
      if (distance < shipRadius + asteroid.userData.radius) {
        this.handleAsteroidCollision(asteroid, i);
        break;
      }
    }
    
    // Check pickup collisions
    const pickups = this.asteroidField.getPickups();
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pickup = pickups[i];
      const distance = new THREE.Vector3(shipPosition.x, shipPosition.y, shipPosition.z)
        .distanceTo(pickup.position);
      
      if (distance < shipRadius + 1) {
        this.handlePickupCollision(pickup, i);
      }
    }
    
    // Check weapon projectile collisions
    if (this.weaponSystem) {
      const projectiles = this.weaponSystem.getProjectiles();
      for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        
        // Check against asteroids
        for (let j = asteroids.length - 1; j >= 0; j--) {
          const asteroid = asteroids[j];
          const distance = projectile.mesh.position.distanceTo(asteroid.position);
          
          if (distance < 0.5 + asteroid.userData.radius) {
            // Hit asteroid
            this.particleSystem?.createExplosion(asteroid.position, 0xffaa00);
            this.asteroidField.removeAsteroid(j);
            this.weaponSystem.removeProjectile(i);
            this.gameState.enemiesDestroyed++;
            this.gameState.addExperience(10);
            this.audioManager.playHitSound();
            break;
          }
        }
        
        // Check against boss
        if (this.bossAsteroid) {
          const bossPos = this.bossAsteroid.getPosition();
          const distance = projectile.mesh.position.distanceTo(
            new THREE.Vector3(bossPos.x, bossPos.y, bossPos.z)
          );
          
          if (distance < this.bossAsteroid.getRadius()) {
            this.weaponSystem.removeProjectile(i);
            const defeated = this.bossAsteroid.takeDamage(25);
            this.particleSystem?.createExplosion(
              new THREE.Vector3(bossPos.x, bossPos.y, bossPos.z), 
              0xff4400
            );
            
            if (defeated) {
              this.gameState.addExperience(500);
              this.gameState.score += 1000;
              this.bossAsteroid.deactivate();
            }
          }
        }
      }
    }
    
    // Handle weapon firing
    const input = this.processInput();
    if (input.fire && this.weaponSystem && this.spaceship) {
      const shipPos = this.spaceship.getPosition();
      const shipRotation = this.spaceship.getRotation();
      const direction = new THREE.Vector3(0, 0, -1).applyEuler(shipRotation);
      
      this.weaponSystem.fire(shipPos, direction);
      this.audioManager.playFireSound();
    }
  }

  private handleAsteroidCollision(asteroid: THREE.Mesh, index: number): void {
    // Create explosion effect
    this.particleSystem?.createExplosion(asteroid.position, 0xff4400);
    
    // Red flash effect
    this.redFlashIntensity = 0.5;
    
    // Play collision sound
    this.audioManager.playCollisionSound();
    
    // Damage spaceship
    this.spaceship?.takeDamage();
    
    // Remove asteroid
    this.asteroidField?.removeAsteroid(index);
    
    // Check game over
    if (this.spaceship && this.spaceship.getShields() <= 0) {
      this.gameOver();
    }
  }

  private handlePickupCollision(pickup: THREE.Mesh, index: number): void {
    const type = pickup.userData.type;
    
    switch (type) {
      case 'fuel':
        this.spaceship?.addFuel(25);
        this.audioManager.playPickupSound();
        break;
      case 'shield':
        this.spaceship?.addShield();
        this.audioManager.playPickupSound();
        break;
      case 'score':
        this.gameState.score += 100;
        this.audioManager.playPickupSound();
        break;
      case 'xp':
        this.gameState.addExperience(50);
        this.audioManager.playPickupSound();
        break;
      case 'weapon':
        // Future: weapon upgrades
        this.audioManager.playPickupSound();
        break;
    }
    
    // Create pickup effect
    this.particleSystem?.createPickupEffect(pickup.position, pickup.material.color);
    
    // Remove pickup
    this.asteroidField?.removePickup(index);
  }

  private updateDifficulty(): void {
    const time = this.gameState.gameTime;
    const baseDifficulty = this.gameState.getDifficultyMultiplier();
    
    // Increase spawn rate and speed over time
    if (this.asteroidField) {
      this.asteroidField.setSpawnRate(Math.min(0.5 + (time / 30) * baseDifficulty, 2.0));
      this.asteroidField.setAsteroidSpeed(Math.min(5 + (time / 20) * baseDifficulty, 15));
    }
    
    // Activate boss at certain intervals
    const levelData = this.gameState.getCurrentLevelData();
    if (levelData.hasBoss && time > 60 && this.bossAsteroid) {
      this.bossAsteroid.activate();
    }
  }

  private checkMissionProgress(): void {
    this.gameState.checkMissionProgress();
  }

  private gameOver(): void {
    this.isGameRunning = false;
    this.gameState.gameOver = true;
    
    // Create final explosion
    if (this.spaceship) {
      this.particleSystem?.createExplosion(this.spaceship.getPosition(), 0xff0000, 50);
    }
    
    // Play game over sound
    this.audioManager.playGameOverSound();
    this.audioManager.stopBackgroundMusic();
    
    // Update player stats
    this.gameState.updateStats(this.gameState.score, this.gameState.gameTime);
    
    // Show game over screen
    this.gameHUD.showGameOverScreen(this.gameState.score);
    
    // Save high score
    this.saveHighScore();
  }

  public restartGame(): void {
    this.gameState.gameOver = false;
    this.isPaused = false;
    this.gameHUD.hideGameOverScreen();
    
    const config: GameConfig = {
      difficulty: this.gameState.difficulty,
      selectedShip: this.gameState.playerData?.currentShip || 0
    };
    
    this.startGame(config);
  }

  private saveHighScore(): void {
    const scores = JSON.parse(localStorage.getItem('asteroidNavigatorScores') || '[]');
    scores.push({
      score: this.gameState.score,
      difficulty: this.gameState.difficulty,
      date: new Date().toISOString(),
      playerName: this.gameState.playerData?.username || 'Anonymous'
    });
    scores.sort((a: any, b: any) => b.score - a.score);
    scores.splice(10); // Keep only top 10
    localStorage.setItem('asteroidNavigatorScores', JSON.stringify(scores));
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose(): void {
    this.isGameRunning = false;
    
    // Dispose of systems
    this.audioManager.dispose();
    this.gameHUD.dispose();
    this.authScreen.dispose();
    this.weaponSystem?.dispose();
    this.bossAsteroid?.dispose();
    
    // Clean up Three.js resources
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });
    
    this.renderer.dispose();
    
    // Remove mobile controls if they exist
    const mobileControls = document.getElementById('mobile-controls');
    if (mobileControls) {
      mobileControls.remove();
    }
  }
}