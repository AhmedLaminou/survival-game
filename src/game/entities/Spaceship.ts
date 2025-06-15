import * as THREE from 'three';
import { PlayerInput, Vector3 } from '../../types/GameTypes';

export class Spaceship {
  private scene: THREE.Scene;
  private mesh: THREE.Group | null = null;
  private engineParticles: THREE.Points | null = null;
  private shields: number = 3;
  private fuel: number = 100;
  private maxFuel: number = 100;
  private speed: number = 0;
  private maxSpeed: number = 15;
  private rotationSpeed: number = 2;
  private acceleration: number = 8;
  private deceleration: number = 4;
  private boostMultiplier: number = 2;
  private position: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private rotation: THREE.Euler = new THREE.Euler(0, 0, 0);
  private velocity: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private shipModel: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createSpaceship();
    this.createEngineParticles();
  }

  private createSpaceship(): void {
    this.mesh = new THREE.Group();
    this.buildShipModel(this.shipModel);
    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  private buildShipModel(modelId: number): void {
    if (!this.mesh) return;

    // Clear existing geometry
    this.mesh.clear();

    switch (modelId) {
      case 0: // Interceptor - fast and agile
        this.createInterceptor();
        break;
      case 1: // Cruiser - balanced
        this.createCruiser();
        break;
      case 2: // Battleship - heavy and slow
        this.createBattleship();
        break;
      case 3: // Stealth Fighter - advanced
        this.createStealthFighter();
        break;
      case 4: // Destroyer - ultimate
        this.createDestroyer();
        break;
      default:
        this.createInterceptor();
    }

    // Add ship lights
    this.addShipLights();
  }

  private createInterceptor(): void {
    if (!this.mesh) return;

    // Main body - sleek cone
    const bodyGeometry = new THREE.ConeGeometry(0.5, 3, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x4488ff,
      shininess: 100,
      emissive: 0x001122
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    body.position.z = -0.5;
    this.mesh.add(body);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(2, 0.1, 1);
    const wingMaterial = new THREE.MeshPhongMaterial({
      color: 0x2266aa,
      emissive: 0x001122
    });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-1, 0, 0.5);
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(1, 0, 0.5);
    this.mesh.add(leftWing);
    this.mesh.add(rightWing);

    // Engine nozzles
    this.addEngineNozzles([
      new THREE.Vector3(-0.8, 0, 1.2),
      new THREE.Vector3(0.8, 0, 1.2)
    ]);
  }

  private createCruiser(): void {
    if (!this.mesh) return;

    // Main hull
    const hullGeometry = new THREE.CylinderGeometry(0.3, 0.6, 4, 8);
    const hullMaterial = new THREE.MeshPhongMaterial({
      color: 0x44aa44,
      shininess: 80,
      emissive: 0x002200
    });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.rotation.z = Math.PI / 2;
    this.mesh.add(hull);

    // Command section
    const commandGeometry = new THREE.SphereGeometry(0.4, 8, 6);
    const commandMaterial = new THREE.MeshPhongMaterial({
      color: 0x66cc66,
      emissive: 0x003300
    });
    const command = new THREE.Mesh(commandGeometry, commandMaterial);
    command.position.z = -1.5;
    this.mesh.add(command);

    // Side pods
    this.addEngineNozzles([
      new THREE.Vector3(-0.5, 0, 1.8),
      new THREE.Vector3(0.5, 0, 1.8),
      new THREE.Vector3(0, 0, 2)
    ]);
  }

  private createBattleship(): void {
    if (!this.mesh) return;

    // Main body - large and imposing
    const bodyGeometry = new THREE.BoxGeometry(2, 1, 5);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xaa4444,
      shininess: 60,
      emissive: 0x220000
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.mesh.add(body);

    // Front section
    const frontGeometry = new THREE.ConeGeometry(0.8, 2, 6);
    const frontMaterial = new THREE.MeshPhongMaterial({
      color: 0xcc6666,
      emissive: 0x330000
    });
    const front = new THREE.Mesh(frontGeometry, frontMaterial);
    front.rotation.x = Math.PI / 2;
    front.position.z = -3.5;
    this.mesh.add(front);

    // Weapon turrets
    for (let i = 0; i < 4; i++) {
      const turretGeometry = new THREE.SphereGeometry(0.3, 6, 4);
      const turret = new THREE.Mesh(turretGeometry, bodyMaterial);
      turret.position.set((i % 2 === 0 ? -0.8 : 0.8), 0.6, -1 + i * 0.5);
      this.mesh.add(turret);
    }

    // Large engine array
    this.addEngineNozzles([
      new THREE.Vector3(-0.8, 0, 2.2),
      new THREE.Vector3(-0.4, 0, 2.4),
      new THREE.Vector3(0, 0, 2.5),
      new THREE.Vector3(0.4, 0, 2.4),
      new THREE.Vector3(0.8, 0, 2.2)
    ]);
  }

  private createStealthFighter(): void {
    if (!this.mesh) return;

    // Angular stealth body
    const bodyGeometry = new THREE.ConeGeometry(0.4, 3.5, 3);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0x2a2a2a,
      shininess: 200,
      emissive: 0x111111,
      transparent: true,
      opacity: 0.9
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    body.rotation.z = Math.PI / 6;
    this.mesh.add(body);

    // Stealth wings - angular
    const wingGeometry = new THREE.ConeGeometry(1, 0.8, 3);
    const wingMaterial = new THREE.MeshPhongMaterial({
      color: 0x1a1a1a,
      emissive: 0x050505,
      transparent: true,
      opacity: 0.8
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.rotation.z = Math.PI / 2;
    leftWing.position.set(-0.8, 0, 0.5);
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.rotation.z = -Math.PI / 2;
    rightWing.position.set(0.8, 0, 0.5);
    this.mesh.add(leftWing);
    this.mesh.add(rightWing);

    // Advanced engines
    this.addEngineNozzles([
      new THREE.Vector3(-0.6, 0, 1.5),
      new THREE.Vector3(0.6, 0, 1.5)
    ], 0x0088ff);
  }

  private createDestroyer(): void {
    if (!this.mesh) return;

    // Massive main hull
    const hullGeometry = new THREE.CylinderGeometry(0.4, 0.8, 6, 8);
    const hullMaterial = new THREE.MeshPhongMaterial({
      color: 0xffaa44,
      shininess: 100,
      emissive: 0x332200
    });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.rotation.z = Math.PI / 2;
    this.mesh.add(hull);

    // Command tower
    const towerGeometry = new THREE.BoxGeometry(1, 1.5, 2);
    const tower = new THREE.Mesh(towerGeometry, hullMaterial);
    tower.position.set(0, 0.5, -1);
    this.mesh.add(tower);

    // Multiple weapon systems
    for (let i = 0; i < 6; i++) {
      const weaponGeometry = new THREE.CylinderGeometry(0.1, 0.15, 1, 6);
      const weapon = new THREE.Mesh(weaponGeometry, hullMaterial);
      weapon.position.set(
        (i % 3 - 1) * 0.8,
        0.8,
        -2 + Math.floor(i / 3) * 2
      );
      this.mesh.add(weapon);
    }

    // Powerful engine cluster
    this.addEngineNozzles([
      new THREE.Vector3(-0.6, 0, 2.8),
      new THREE.Vector3(-0.3, 0, 3),
      new THREE.Vector3(0, 0, 3.2),
      new THREE.Vector3(0.3, 0, 3),
      new THREE.Vector3(0.6, 0, 2.8),
      new THREE.Vector3(-0.6, -0.3, 2.6),
      new THREE.Vector3(0.6, -0.3, 2.6)
    ], 0xff4400);
  }

  private addEngineNozzles(positions: THREE.Vector3[], glowColor: number = 0x00ffff): void {
    if (!this.mesh) return;

    positions.forEach(pos => {
      const nozzleGeometry = new THREE.CylinderGeometry(0.1, 0.2, 0.3, 6);
      const nozzleMaterial = new THREE.MeshPhongMaterial({
        color: 0x444444,
        emissive: glowColor,
        emissiveIntensity: 0.3
      });
      const nozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
      nozzle.position.copy(pos);
      this.mesh.add(nozzle);
      
      // Add glow effect
      const glowGeometry = new THREE.SphereGeometry(0.15, 8, 6);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.6
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.copy(pos);
      this.mesh.add(glow);
    });
  }

  private addShipLights(): void {
    if (!this.mesh) return;

    // Navigation lights
    const leftLight = new THREE.PointLight(0xff0000, 0.5, 10);
    leftLight.position.set(-1, 0, 0);
    this.mesh.add(leftLight);

    const rightLight = new THREE.PointLight(0x00ff00, 0.5, 10);
    rightLight.position.set(1, 0, 0);
    this.mesh.add(rightLight);

    const frontLight = new THREE.SpotLight(0xffffff, 1, 20, Math.PI / 6, 0.5);
    frontLight.position.set(0, 0, -2);
    frontLight.target.position.set(0, 0, -10);
    this.mesh.add(frontLight);
    this.mesh.add(frontLight.target);
  }

  private createEngineParticles(): void {
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 2;
      positions[i + 1] = (Math.random() - 0.5) * 2;
      positions[i + 2] = Math.random() * 3 + 1;
      
      velocities[i] = (Math.random() - 0.5) * 2;
      velocities[i + 1] = (Math.random() - 0.5) * 2;
      velocities[i + 2] = Math.random() * 5 + 5;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x00aaff,
      size: 0.3,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    
    this.engineParticles = new THREE.Points(particles, particleMaterial);
    this.engineParticles.visible = false;
    this.scene.add(this.engineParticles);
  }

  setShipModel(modelId: number): void {
    this.shipModel = modelId;
    this.buildShipModel(modelId);
    
    // Adjust stats based on ship model
    switch (modelId) {
      case 0: // Interceptor
        this.maxSpeed = 18;
        this.acceleration = 10;
        this.rotationSpeed = 3;
        break;
      case 1: // Cruiser
        this.maxSpeed = 15;
        this.acceleration = 8;
        this.rotationSpeed = 2;
        break;
      case 2: // Battleship
        this.maxSpeed = 12;
        this.acceleration = 6;
        this.rotationSpeed = 1.5;
        this.shields = 5; // More shields
        break;
      case 3: // Stealth Fighter
        this.maxSpeed = 20;
        this.acceleration = 12;
        this.rotationSpeed = 3.5;
        break;
      case 4: // Destroyer
        this.maxSpeed = 16;
        this.acceleration = 9;
        this.rotationSpeed = 2.2;
        this.shields = 4;
        this.maxFuel = 150; // More fuel
        break;
    }
  }

  update(deltaTime: number, input: PlayerInput): void {
    this.processMovement(deltaTime, input);
    this.updateEngineEffects(input);
    this.updatePosition(deltaTime);
  }

  private processMovement(deltaTime: number, input: PlayerInput): void {
    // Rotation
    if (input.left) {
      this.rotation.y += this.rotationSpeed * deltaTime;
    }
    if (input.right) {
      this.rotation.y -= this.rotationSpeed * deltaTime;
    }
    
    // Forward/backward movement
    const targetSpeed = input.forward ? this.maxSpeed : (input.backward ? -this.maxSpeed * 0.5 : 0);
    const speedDiff = targetSpeed - this.speed;
    const accel = speedDiff > 0 ? this.acceleration : this.deceleration;
    
    this.speed += speedDiff * accel * deltaTime;
    this.speed = THREE.MathUtils.clamp(this.speed, -this.maxSpeed * 0.5, this.maxSpeed);
    
    // Boost
    let currentSpeed = this.speed;
    if (input.boost && this.fuel > 0) {
      currentSpeed *= this.boostMultiplier;
      this.fuel = Math.max(0, this.fuel - 40 * deltaTime);
    }
    
    // Calculate velocity
    const direction = new THREE.Vector3(0, 0, -1).applyEuler(this.rotation);
    this.velocity = direction.multiplyScalar(currentSpeed);
  }

  private updateEngineEffects(input: PlayerInput): void {
    if (!this.engineParticles) return;
    
    const isThrusting = input.forward || input.boost;
    this.engineParticles.visible = isThrusting;
    
    if (isThrusting && this.mesh) {
      this.engineParticles.position.copy(this.mesh.position);
      this.engineParticles.rotation.copy(this.mesh.rotation);
      
      // Update particle intensity based on thrust
      const material = this.engineParticles.material as THREE.PointsMaterial;
      material.opacity = input.boost ? 1.0 : 0.6;
      material.color.setHex(input.boost ? 0xff4400 : 0x00aaff);
    }
  }

  private updatePosition(deltaTime: number): void {
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Update mesh transform
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.copy(this.rotation);
    }
    
    // Gradually restore fuel
    if (this.fuel < this.maxFuel) {
      this.fuel = Math.min(this.maxFuel, this.fuel + 20 * deltaTime);
    }
  }

  takeDamage(): void {
    if (this.shields > 0) {
      this.shields--;
      
      // Visual damage effect
      if (this.mesh) {
        this.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhongMaterial) {
            child.material.emissiveIntensity = 0.5;
            setTimeout(() => {
              child.material.emissiveIntensity = 0.1;
            }, 200);
          }
        });
      }
    }
  }

  addShield(): void {
    this.shields = Math.min(3, this.shields + 1);
  }

  addFuel(amount: number): void {
    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
  }

  reset(): void {
    this.position.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.speed = 0;
    this.shields = this.shipModel === 2 ? 5 : (this.shipModel === 4 ? 4 : 3);
    this.fuel = this.maxFuel;
    
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.copy(this.rotation);
    }
  }

  getPosition(): Vector3 {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z
    };
  }

  getRotation(): THREE.Euler {
    return this.rotation;
  }

  getShields(): number {
    return this.shields;
  }

  getFuel(): number {
    return this.fuel;
  }

  getMaxFuel(): number {
    return this.maxFuel;
  }

  dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (child.geometry) child.geometry.dispose();
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(material => material.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
      });
    }
    
    if (this.engineParticles) {
      this.scene.remove(this.engineParticles);
      this.engineParticles.geometry.dispose();
      if (this.engineParticles.material instanceof THREE.Material) {
        this.engineParticles.material.dispose();
      }
    }
  }
}