import * as THREE from 'three';

export class AsteroidField {
  constructor(scene) {
    this.scene = scene;
    this.asteroids = [];
    this.pickups = [];
    this.spawnRate = 0.5;
    this.asteroidSpeed = 5;
    this.lastSpawnTime = 0;
    this.lastPickupSpawnTime = 0;
    this.pickupSpawnRate = 3; // seconds
    
    // Pre-create geometries for performance
    this.asteroidGeometries = this.createAsteroidGeometries();
    this.asteroidMaterials = this.createAsteroidMaterials();
    this.pickupGeometries = this.createPickupGeometries();
    this.pickupMaterials = this.createPickupMaterials();
  }

  createAsteroidGeometries() {
    const geometries = [];
    
    // Sphere-based asteroids
    for (let i = 0; i < 5; i++) {
      const geometry = new THREE.SphereGeometry(1, 8 + i * 2, 6 + i * 2);
      // Add some noise to make it irregular
      const positions = geometry.attributes.position.array;
      for (let j = 0; j < positions.length; j += 3) {
        const vertex = new THREE.Vector3(positions[j], positions[j + 1], positions[j + 2]);
        vertex.normalize().multiplyScalar(1 + (Math.random() - 0.5) * 0.3);
        positions[j] = vertex.x;
        positions[j + 1] = vertex.y;
        positions[j + 2] = vertex.z;
      }
      geometry.computeVertexNormals();
      geometries.push(geometry);
    }
    
    // Icosahedron-based asteroids
    for (let i = 0; i < 3; i++) {
      const geometry = new THREE.IcosahedronGeometry(1, i);
      geometries.push(geometry);
    }
    
    return geometries;
  }

  createAsteroidMaterials() {
    const materials = [];
    const colors = [0x8B4513, 0x654321, 0x708090, 0x2F4F4F, 0x696969];
    
    colors.forEach(color => {
      materials.push(new THREE.MeshPhongMaterial({
        color: color,
        shininess: 10,
        transparent: true,
        opacity: 0.9
      }));
    });
    
    return materials;
  }

  createPickupGeometries() {
    return {
      fuel: new THREE.CylinderGeometry(0.3, 0.3, 1, 8),
      shield: new THREE.OctahedronGeometry(0.5),
      score: new THREE.TetrahedronGeometry(0.6)
    };
  }

  createPickupMaterials() {
    return {
      fuel: new THREE.MeshPhongMaterial({
        color: 0x00ff00,
        emissive: 0x002200,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      }),
      shield: new THREE.MeshPhongMaterial({
        color: 0x0088ff,
        emissive: 0x002244,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      }),
      score: new THREE.MeshPhongMaterial({
        color: 0xffaa00,
        emissive: 0x442200,
        shininess: 100,
        transparent: true,
        opacity: 0.8
      })
    };
  }

  spawnAsteroid() {
    const geometry = this.asteroidGeometries[Math.floor(Math.random() * this.asteroidGeometries.length)];
    const material = this.asteroidMaterials[Math.floor(Math.random() * this.asteroidMaterials.length)];
    
    const asteroid = new THREE.Mesh(geometry, material);
    
    // Random spawn position (off screen)
    const spawnSide = Math.random();
    if (spawnSide < 0.25) {
      // Top
      asteroid.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 20,
        -120
      );
    } else if (spawnSide < 0.5) {
      // Bottom
      asteroid.position.set(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 20,
        120
      );
    } else if (spawnSide < 0.75) {
      // Left
      asteroid.position.set(
        -120,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 200
      );
    } else {
      // Right
      asteroid.position.set(
        120,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 200
      );
    }
    
    // Random size
    const size = 0.5 + Math.random() * 2;
    asteroid.scale.setScalar(size);
    
    // Random rotation
    asteroid.rotation.set(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    );
    
    // Store movement data
    const direction = new THREE.Vector3().subVectors(
      new THREE.Vector3(0, 0, 0),
      asteroid.position
    ).normalize();
    
    asteroid.userData = {
      velocity: direction.multiplyScalar(this.asteroidSpeed + Math.random() * 5),
      rotationVelocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      radius: size,
      maxDistance: 150
    };
    
    this.asteroids.push(asteroid);
    this.scene.add(asteroid);
  }

  spawnPickup() {
    const types = ['fuel', 'shield', 'score'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    const geometry = this.pickupGeometries[type];
    const material = this.pickupMaterials[type];
    
    const pickup = new THREE.Mesh(geometry, material);
    
    // Spawn in a safe area (not too close to player)
    const angle = Math.random() * Math.PI * 2;
    const distance = 20 + Math.random() * 30;
    pickup.position.set(
      Math.cos(angle) * distance,
      (Math.random() - 0.5) * 10,
      Math.sin(angle) * distance
    );
    
    pickup.userData = {
      type: type,
      rotationSpeed: 2,
      bobSpeed: 3,
      bobAmount: 0.5,
      startY: pickup.position.y,
      time: 0
    };
    
    this.pickups.push(pickup);
    this.scene.add(pickup);
  }

  update(deltaTime, gameState) {
    const currentTime = gameState.gameTime;
    
    // Spawn asteroids
    if (currentTime - this.lastSpawnTime > 1 / this.spawnRate) {
      this.spawnAsteroid();
      this.lastSpawnTime = currentTime;
      
      // Occasionally spawn swarms
      if (Math.random() < 0.1) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => this.spawnAsteroid(), i * 200);
        }
      }
    }
    
    // Spawn pickups
    if (currentTime - this.lastPickupSpawnTime > this.pickupSpawnRate) {
      this.spawnPickup();
      this.lastPickupSpawnTime = currentTime;
    }
    
    // Update asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      
      // Move asteroid
      asteroid.position.add(
        asteroid.userData.velocity.clone().multiplyScalar(deltaTime)
      );
      
      // Rotate asteroid
      asteroid.rotation.x += asteroid.userData.rotationVelocity.x * deltaTime;
      asteroid.rotation.y += asteroid.userData.rotationVelocity.y * deltaTime;
      asteroid.rotation.z += asteroid.userData.rotationVelocity.z * deltaTime;
      
      // Remove if too far from origin
      if (asteroid.position.length() > asteroid.userData.maxDistance) {
        this.removeAsteroid(i);
      }
    }
    
    // Update pickups
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pickup = this.pickups[i];
      pickup.userData.time += deltaTime;
      
      // Rotate pickup
      pickup.rotation.y += pickup.userData.rotationSpeed * deltaTime;
      
      // Bob up and down
      pickup.position.y = pickup.userData.startY + 
        Math.sin(pickup.userData.time * pickup.userData.bobSpeed) * pickup.userData.bobAmount;
      
      // Remove after 20 seconds
      if (pickup.userData.time > 20) {
        this.removePickup(i);
      }
    }
  }

  removeAsteroid(index) {
    if (index >= 0 && index < this.asteroids.length) {
      this.scene.remove(this.asteroids[index]);
      this.asteroids.splice(index, 1);
    }
  }

  removePickup(index) {
    if (index >= 0 && index < this.pickups.length) {
      this.scene.remove(this.pickups[index]);
      this.pickups.splice(index, 1);
    }
  }

  getAsteroids() {
    return this.asteroids;
  }

  getPickups() {
    return this.pickups;
  }

  reset() {
    // Remove all asteroids
    this.asteroids.forEach(asteroid => {
      this.scene.remove(asteroid);
    });
    this.asteroids = [];
    
    // Remove all pickups
    this.pickups.forEach(pickup => {
      this.scene.remove(pickup);
    });
    this.pickups = [];
    
    // Reset spawn times
    this.lastSpawnTime = 0;
    this.lastPickupSpawnTime = 0;
    this.spawnRate = 0.5;
    this.asteroidSpeed = 5;
  }
}