import * as THREE from 'three';
import { Vector3 } from '../../types/GameTypes';

export class BossAsteroid {
  private scene: THREE.Scene;
  private mesh: THREE.Group;
  private health: number = 100;
  private maxHealth: number = 100;
  private position: THREE.Vector3;
  private targetPosition: THREE.Vector3;
  private moveSpeed: number = 3;
  private rotationSpeed: number = 0.5;
  private attackCooldown: number = 2.0;
  private lastAttackTime: number = 0;
  private isActive: boolean = false;
  private phase: number = 1; // Boss has 3 phases

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.position = new THREE.Vector3(0, 0, -50);
    this.targetPosition = new THREE.Vector3(0, 0, -30);
    this.createBossMesh();
  }

  private createBossMesh(): void {
    this.mesh = new THREE.Group();
    
    // Main body - large crystal-like structure
    const coreGeometry = new THREE.IcosahedronGeometry(4, 1);
    const coreMaterial = new THREE.MeshPhongMaterial({
      color: 0xff4400,
      emissive: 0x440000,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    this.mesh.add(core);

    // Rotating rings
    for (let i = 0; i < 3; i++) {
      const ringGeometry = new THREE.TorusGeometry(6 + i * 2, 0.5, 8, 20);
      const ringMaterial = new THREE.MeshPhongMaterial({
        color: 0x00ff88,
        emissive: 0x004422,
        transparent: true,
        opacity: 0.7
      });
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      ring.userData = { rotationSpeed: (i + 1) * 0.3 };
      this.mesh.add(ring);
    }

    // Weapon pods
    for (let i = 0; i < 6; i++) {
      const podGeometry = new THREE.SphereGeometry(1, 8, 6);
      const podMaterial = new THREE.MeshPhongMaterial({
        color: 0xff0044,
        emissive: 0x220011
      });
      const pod = new THREE.Mesh(podGeometry, podMaterial);
      
      const angle = (i / 6) * Math.PI * 2;
      pod.position.set(
        Math.cos(angle) * 8,
        Math.sin(angle) * 8,
        0
      );
      
      this.mesh.add(pod);
    }

    // Health bar background
    const healthBarBg = new THREE.PlaneGeometry(10, 1);
    const healthBarBgMaterial = new THREE.MeshBasicMaterial({
      color: 0x330000,
      transparent: true,
      opacity: 0.8
    });
    const healthBarBgMesh = new THREE.Mesh(healthBarBg, healthBarBgMaterial);
    healthBarBgMesh.position.set(0, 8, 0);
    this.mesh.add(healthBarBgMesh);

    // Health bar
    const healthBar = new THREE.PlaneGeometry(10, 0.8);
    const healthBarMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.9
    });
    const healthBarMesh = new THREE.Mesh(healthBar, healthBarMaterial);
    healthBarMesh.position.set(0, 8, 0.01);
    healthBarMesh.userData = { isHealthBar: true };
    this.mesh.add(healthBarMesh);

    this.mesh.position.copy(this.position);
    this.scene.add(this.mesh);
  }

  activate(): void {
    this.isActive = true;
    this.health = this.maxHealth;
    this.phase = 1;
  }

  deactivate(): void {
    this.isActive = false;
    this.scene.remove(this.mesh);
  }

  update(deltaTime: number, playerPosition: Vector3): void {
    if (!this.isActive) return;

    // Move towards target position
    this.position.lerp(this.targetPosition, deltaTime * 0.5);
    this.mesh.position.copy(this.position);

    // Rotate the boss
    this.mesh.rotation.y += this.rotationSpeed * deltaTime;

    // Rotate rings
    this.mesh.children.forEach(child => {
      if (child.userData.rotationSpeed) {
        child.rotation.z += child.userData.rotationSpeed * deltaTime;
      }
    });

    // Update health bar
    this.updateHealthBar();

    // AI behavior based on phase
    this.updateBehavior(deltaTime, playerPosition);

    // Attack pattern
    this.updateAttacks(deltaTime, playerPosition);
  }

  private updateBehavior(deltaTime: number, playerPosition: Vector3): void {
    const player = new THREE.Vector3(playerPosition.x, playerPosition.y, playerPosition.z);
    
    switch (this.phase) {
      case 1:
        // Phase 1: Move in figure-8 pattern
        const time = Date.now() * 0.001;
        this.targetPosition.set(
          Math.sin(time) * 15,
          Math.sin(time * 2) * 8,
          -30
        );
        break;
        
      case 2:
        // Phase 2: Chase player more aggressively
        this.targetPosition.lerp(player, 0.3);
        this.targetPosition.z = Math.max(this.targetPosition.z, -35);
        this.moveSpeed = 5;
        break;
        
      case 3:
        // Phase 3: Erratic movement
        if (Math.random() < 0.02) {
          this.targetPosition.set(
            (Math.random() - 0.5) * 40,
            (Math.random() - 0.5) * 20,
            -25 + Math.random() * 10
          );
        }
        this.moveSpeed = 8;
        break;
    }
  }

  private updateAttacks(deltaTime: number, playerPosition: Vector3): void {
    this.lastAttackTime += deltaTime;
    
    if (this.lastAttackTime > this.attackCooldown) {
      this.lastAttackTime = 0;
      
      // Different attack patterns per phase
      switch (this.phase) {
        case 1:
          this.launchSingleProjectile(playerPosition);
          break;
        case 2:
          this.launchTripleProjectile(playerPosition);
          break;
        case 3:
          this.launchSpreadProjectile(playerPosition);
          break;
      }
    }
  }

  private launchSingleProjectile(playerPosition: Vector3): void {
    // Implementation would create projectiles towards player
    // This is a placeholder for the attack system
  }

  private launchTripleProjectile(playerPosition: Vector3): void {
    // Implementation would create three projectiles in a spread
  }

  private launchSpreadProjectile(playerPosition: Vector3): void {
    // Implementation would create multiple projectiles in all directions
  }

  private updateHealthBar(): void {
    const healthBar = this.mesh.children.find(child => child.userData.isHealthBar);
    if (healthBar && healthBar instanceof THREE.Mesh) {
      const healthPercentage = this.health / this.maxHealth;
      healthBar.scale.x = healthPercentage;
      
      // Change color based on health
      if (healthPercentage > 0.6) {
        (healthBar.material as THREE.MeshBasicMaterial).color.setHex(0x00ff00);
      } else if (healthPercentage > 0.3) {
        (healthBar.material as THREE.MeshBasicMaterial).color.setHex(0xffff00);
      } else {
        (healthBar.material as THREE.MeshBasicMaterial).color.setHex(0xff0000);
      }
    }
  }

  takeDamage(amount: number): boolean {
    this.health -= amount;
    
    // Phase transitions
    if (this.health <= this.maxHealth * 0.66 && this.phase === 1) {
      this.phase = 2;
      this.attackCooldown = 1.5;
    } else if (this.health <= this.maxHealth * 0.33 && this.phase === 2) {
      this.phase = 3;
      this.attackCooldown = 1.0;
    }
    
    return this.health <= 0;
  }

  getPosition(): Vector3 {
    return {
      x: this.position.x,
      y: this.position.y,
      z: this.position.z
    };
  }

  getRadius(): number {
    return 6; // Collision radius
  }

  isDefeated(): boolean {
    return this.health <= 0;
  }

  getHealth(): number {
    return this.health;
  }

  getMaxHealth(): number {
    return this.maxHealth;
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
  }
}