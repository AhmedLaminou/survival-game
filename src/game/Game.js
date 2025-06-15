import * as THREE from 'three';
import { Spaceship } from './entities/Spaceship.js';
import { AsteroidField } from './entities/AsteroidField.js';
import { ParticleSystem } from './systems/ParticleSystem.js';
import { AudioManager } from './systems/AudioManager.js';
import { GameHUD } from './ui/GameHUD.js';
import { GameState } from './GameState.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    this.clock = new THREE.Clock();
    
    // Game entities
    this.spaceship = null;
    this.asteroidField = null;
    this.particleSystem = null;
    this.starField = null;
    
    // Game systems
    this.audioManager = new AudioManager();
    this.gameHUD = new GameHUD();
    this.gameState = new GameState();
    
    // Input handling
    this.keys = {};
    this.isGameRunning = false;
    this.isPaused = false;
    
    this.init();
    this.setupEventListeners();
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
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
    
    // Initialize HUD
    this.gameHUD.init();
    
    // Show start screen
    this.showStartScreen();
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    
    // Directional light (main light)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
    
    // Point light for dynamic lighting
    const pointLight = new THREE.PointLight(0x4488ff, 0.5, 100);
    pointLight.position.set(0, 0, 10);
    this.scene.add(pointLight);
  }

  createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      transparent: true,
      opacity: 0.8
    });
    
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    this.starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(this.starField);
  }

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Touch events for mobile
    document.addEventListener('touchstart', (event) => this.onTouchStart(event));
    document.addEventListener('touchend', (event) => this.onTouchEnd(event));
  }

  onKeyDown(event) {
    this.keys[event.code] = true;
    
    switch (event.code) {
      case 'KeyP':
        this.togglePause();
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
        break;
    }
  }

  onKeyUp(event) {
    this.keys[event.code] = false;
  }

  onTouchStart(event) {
    // Mobile controls simulation
    const touch = event.touches[0];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    if (touch.clientX < centerX / 2) {
      this.keys['KeyA'] = true;
    } else if (touch.clientX > centerX + centerX / 2) {
      this.keys['KeyD'] = true;
    }
    
    if (touch.clientY < centerY) {
      this.keys['KeyW'] = true;
    } else {
      this.keys['Space'] = true;
    }
  }

  onTouchEnd(event) {
    // Reset mobile controls
    this.keys['KeyA'] = false;
    this.keys['KeyD'] = false;
    this.keys['KeyW'] = false;
    this.keys['Space'] = false;
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.gameHUD.showPauseScreen(this.isPaused);
    if (this.isPaused) {
      this.audioManager.pauseAll();
    } else {
      this.audioManager.resumeAll();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  showStartScreen() {
    this.gameHUD.showStartScreen();
  }

  startGame(difficulty = 'normal') {
    this.isGameRunning = true;
    this.gameState.reset();
    this.gameState.difficulty = difficulty;
    
    // Reset entities
    this.spaceship.reset();
    this.asteroidField.reset();
    this.particleSystem.reset();
    
    // Hide start screen and show HUD
    this.gameHUD.hideStartScreen();
    this.gameHUD.show();
    
    // Start background music
    this.audioManager.playBackgroundMusic();
    
    // Start game loop
    this.gameLoop();
  }

  gameLoop() {
    if (!this.isGameRunning) return;
    
    requestAnimationFrame(() => this.gameLoop());
    
    if (this.isPaused) return;
    
    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.render();
  }

  update(deltaTime) {
    // Update game time
    this.gameState.gameTime += deltaTime;
    this.gameState.score = Math.floor(this.gameState.gameTime * 10);
    
    // Process input
    this.processInput(deltaTime);
    
    // Update entities
    this.spaceship.update(deltaTime);
    this.asteroidField.update(deltaTime, this.gameState);
    this.particleSystem.update(deltaTime);
    
    // Update camera to follow spaceship
    this.updateCamera();
    
    // Check collisions
    this.checkCollisions();
    
    // Update HUD
    this.gameHUD.update(this.gameState, this.spaceship);
    
    // Animate starfield
    if (this.starField) {
      this.starField.rotation.z += 0.0001;
    }
    
    // Increase difficulty over time
    this.updateDifficulty();
  }

  processInput(deltaTime) {
    if (!this.spaceship) return;
    
    const input = {
      forward: this.keys['KeyW'] || this.keys['ArrowUp'],
      backward: this.keys['KeyS'] || this.keys['ArrowDown'],
      left: this.keys['KeyA'] || this.keys['ArrowLeft'],
      right: this.keys['KeyD'] || this.keys['ArrowRight'],
      boost: this.keys['Space']
    };
    
    this.spaceship.processInput(input, deltaTime);
  }

  updateCamera() {
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

  checkCollisions() {
    if (!this.spaceship || !this.asteroidField) return;
    
    const shipPosition = this.spaceship.getPosition();
    const shipRadius = 1.5;
    
    // Check asteroid collisions
    const asteroids = this.asteroidField.getAsteroids();
    for (let i = asteroids.length - 1; i >= 0; i--) {
      const asteroid = asteroids[i];
      const distance = shipPosition.distanceTo(asteroid.position);
      
      if (distance < shipRadius + asteroid.userData.radius) {
        // Collision detected
        this.handleAsteroidCollision(asteroid, i);
        break;
      }
    }
    
    // Check pickup collisions
    const pickups = this.asteroidField.getPickups();
    for (let i = pickups.length - 1; i >= 0; i--) {
      const pickup = pickups[i];
      const distance = shipPosition.distanceTo(pickup.position);
      
      if (distance < shipRadius + 1) {
        this.handlePickupCollision(pickup, i);
      }
    }
  }

  handleAsteroidCollision(asteroid, index) {
    // Create explosion effect
    this.particleSystem.createExplosion(asteroid.position, 0xff4400);
    
    // Play collision sound
    this.audioManager.playCollisionSound();
    
    // Damage spaceship
    this.spaceship.takeDamage();
    
    // Remove asteroid
    this.asteroidField.removeAsteroid(index);
    
    // Check game over
    if (this.spaceship.shields <= 0) {
      this.gameOver();
    }
  }

  handlePickupCollision(pickup, index) {
    const type = pickup.userData.type;
    
    switch (type) {
      case 'fuel':
        this.spaceship.addFuel(25);
        this.audioManager.playPickupSound();
        break;
      case 'shield':
        this.spaceship.addShield();
        this.audioManager.playPickupSound();
        break;
      case 'score':
        this.gameState.score += 100;
        this.audioManager.playPickupSound();
        break;
    }
    
    // Create pickup effect
    this.particleSystem.createPickupEffect(pickup.position, pickup.material.color);
    
    // Remove pickup
    this.asteroidField.removePickup(index);
  }

  updateDifficulty() {
    const time = this.gameState.gameTime;
    const baseDifficulty = this.gameState.difficulty === 'easy' ? 0.5 : 
                          this.gameState.difficulty === 'hardcore' ? 2.0 : 1.0;
    
    // Increase spawn rate and speed over time
    this.asteroidField.spawnRate = Math.min(0.5 + (time / 30) * baseDifficulty, 2.0);
    this.asteroidField.asteroidSpeed = Math.min(5 + (time / 20) * baseDifficulty, 15);
  }

  gameOver() {
    this.isGameRunning = false;
    this.gameState.gameOver = true;
    
    // Create final explosion
    this.particleSystem.createExplosion(this.spaceship.getPosition(), 0xff0000, 50);
    
    // Play game over sound
    this.audioManager.playGameOverSound();
    this.audioManager.stopBackgroundMusic();
    
    // Show game over screen
    this.gameHUD.showGameOverScreen(this.gameState.score);
    
    // Save high score
    this.saveHighScore();
  }

  restartGame() {
    this.gameState.gameOver = false;
    this.isPaused = false;
    this.gameHUD.hideGameOverScreen();
    this.startGame(this.gameState.difficulty);
  }

  saveHighScore() {
    const scores = JSON.parse(localStorage.getItem('asteroidNavigatorScores') || '[]');
    scores.push({
      score: this.gameState.score,
      difficulty: this.gameState.difficulty,
      date: new Date().toISOString()
    });
    scores.sort((a, b) => b.score - a.score);
    scores.splice(10); // Keep only top 10
    localStorage.setItem('asteroidNavigatorScores', JSON.stringify(scores));
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.isGameRunning = false;
    this.audioManager.dispose();
    this.gameHUD.dispose();
    
    // Clean up Three.js resources
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    this.renderer.dispose();
  }
}