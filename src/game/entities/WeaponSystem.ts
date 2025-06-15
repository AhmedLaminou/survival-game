import * as THREE from 'three';
import { Vector3 } from '../../types/GameTypes';

interface Projectile {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  damage: number;
}

export class WeaponSystem {
  private scene: THREE.Scene;
  private projectiles: Projectile[] = [];
  private fireRate: number = 0.2; // seconds between shots
  private lastFireTime: number = 0;
  private projectileSpeed: number = 50;
  private projectileGeometry: THREE.SphereGeometry;
  private projectileMaterial: THREE.MeshBasicMaterial;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.setupProjectileGeometry();
  }

  private setupProjectileGeometry(): void {
    this.projectileGeometry = new THREE.SphereGeometry(0.1, 8, 6);
    this.projectileMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      emissive: 0x004444,
      transparent: true,
      opacity: 0.8
    });
  }

  canFire(): boolean {
    return Date.now() - this.lastFireTime > this.fireRate * 1000;
  }

  fire(position: Vector3, direction: THREE.Vector3): void {
    if (!this.canFire()) return;

    const projectileMesh = new THREE.Mesh(
      this.projectileGeometry,
      this.projectileMaterial.clone()
    );

    projectileMesh.position.set(position.x, position.y, position.z);
    
    // Add glow effect
    const glowGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    projectileMesh.add(glow);

    this.scene.add(projectileMesh);

    const projectile: Projectile = {
      mesh: projectileMesh,
      velocity: direction.clone().multiplyScalar(this.projectileSpeed),
      lifetime: 3.0, // 3 seconds
      damage: 25
    };

    this.projectiles.push(projectile);
    this.lastFireTime = Date.now();
  }

  update(deltaTime: number): void {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Move projectile
      projectile.mesh.position.add(
        projectile.velocity.clone().multiplyScalar(deltaTime)
      );
      
      // Update lifetime
      projectile.lifetime -= deltaTime;
      
      // Remove expired projectiles
      if (projectile.lifetime <= 0 || projectile.mesh.position.length() > 200) {
        this.scene.remove(projectile.mesh);
        this.projectiles.splice(i, 1);
      }
    }
  }

  getProjectiles(): Projectile[] {
    return this.projectiles;
  }

  removeProjectile(index: number): void {
    if (index >= 0 && index < this.projectiles.length) {
      this.scene.remove(this.projectiles[index].mesh);
      this.projectiles.splice(index, 1);
    }
  }

  dispose(): void {
    this.projectiles.forEach(projectile => {
      this.scene.remove(projectile.mesh);
    });
    this.projectiles = [];
    this.projectileGeometry.dispose();
    this.projectileMaterial.dispose();
  }
}