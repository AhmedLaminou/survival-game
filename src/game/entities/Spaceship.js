import * as THREE from 'three';

export class Spaceship {
  constructor(scene) {
    this.scene = scene;
    this.mesh = null;
    this.engineParticles = null;
    this.shields = 3;
    this.fuel = 100;
    this.maxFuel = 100;
    this.speed = 0;
    this.maxSpeed = 15;
    this.rotationSpeed = 0;
    this.maxRotationSpeed = 3;
    this.position = new THREE.Vector3(0, 0, 0);
    this.rotation = 0;
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.lastDamageTime = 0;
    
    this.createSpaceship();
    this.createEngineParticles();
  }

  createSpaceship() {
    const group = new THREE.Group();
    
    // Main body (cylinder)
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.5, 2, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4488cc,
      shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.z = Math.PI / 2;
    group.add(body);
    
    // Nose cone
    const noseGeometry = new THREE.ConeGeometry(0.3, 1, 8);
    const noseMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x6699dd,
      shininess: 100
    });
    const nose = new THREE.Mesh(noseGeometry, noseMaterial);
    nose.position.x = 1.5;
    nose.rotation.z = -Math.PI / 2;
    group.add(nose);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(0.8, 0.1, 1.5);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x2266aa,
      shininess: 80
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.5, 0, 0.8);
    group.add(leftWing);
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(-0.5, 0, -0.8);
    group.add(rightWing);
    
    // Engine exhausts
    const exhaustGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.5, 6);
    const exhaustMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x444444,
      emissive: 0x222222
    });
    
    const leftExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    leftExhaust.position.set(-1.2, 0, 0.4);
    leftExhaust.rotation.z = Math.PI / 2;
    group.add(leftExhaust);
    
    const rightExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    rightExhaust.position.set(-1.2, 0, -0.4);
    rightExhaust.rotation.z = Math.PI / 2;
    group.add(rightExhaust);
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.4, 8, 6);
    const cockpitMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x88ccff,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.x = 0.5;
    cockpit.scale.set(1, 0.6, 0.8);
    group.add(cockpit);
    
    this.mesh = group;
    this.scene.add(this.mesh);
  }

  createEngineParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;
      
      colors[i * 3] = 1.0;     // R
      colors[i * 3 + 1] = 0.5; // G
      colors[i * 3 + 2] = 0.0; // B
      
      sizes[i] = Math.random() * 2 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    this.engineParticles = new THREE.Points(geometry, material);
    this.scene.add(this.engineParticles);
  }

  processInput(input, deltaTime) {
    const acceleration = 20;
    const rotationAcceleration = 10;
    const friction = 0.98;
    const boostMultiplier = 2;
    
    // Handle rotation
    if (input.left) {
      this.rotationSpeed += rotationAcceleration * deltaTime;
    }
    if (input.right) {
      this.rotationSpeed -= rotationAcceleration * deltaTime;
    }
    
    // Apply rotation friction
    this.rotationSpeed *= friction;
    this.rotationSpeed = Math.max(-this.maxRotationSpeed, Math.min(this.maxRotationSpeed, this.rotationSpeed));
    
    // Apply rotation
    this.rotation += this.rotationSpeed * deltaTime;
    
    // Handle forward/backward movement
    if (input.forward) {
      this.speed += acceleration * deltaTime;
    }
    if (input.backward) {
      this.speed -= acceleration * deltaTime * 0.5; // Braking is slower
    }
    
    // Handle boost
    if (input.boost && this.fuel > 0) {
      this.speed += acceleration * boostMultiplier * deltaTime;
      this.fuel -= 50 * deltaTime; // Consume fuel
      this.fuel = Math.max(0, this.fuel);
      
      // Enhanced engine particles when boosting
      this.updateEngineParticles(true);
    } else {
      this.updateEngineParticles(false);
    }
    
    // Apply speed limits and friction
    this.speed *= friction;
    this.speed = Math.max(-this.maxSpeed * 0.5, Math.min(this.maxSpeed, this.speed));
    
    // Calculate velocity based on rotation and speed
    const direction = new THREE.Vector3(
      Math.cos(this.rotation),
      0,
      Math.sin(this.rotation)
    );
    
    this.velocity.copy(direction).multiplyScalar(this.speed);
  }

  updateEngineParticles(boosting) {
    if (!this.engineParticles) return;
    
    const positions = this.engineParticles.geometry.attributes.position.array;
    const colors = this.engineParticles.geometry.attributes.color.array;
    const particleCount = positions.length / 3;
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      if (this.speed > 0.1 || boosting) {
        // Generate particles behind the ship
        const spread = boosting ? 0.8 : 0.4;
        const length = boosting ? 3 : 1.5;
        
        positions[i3] = this.position.x - Math.random() * length - 1;
        positions[i3 + 1] = this.position.y + (Math.random() - 0.5) * spread;
        positions[i3 + 2] = this.position.z + (Math.random() - 0.5) * spread;
        
        // Color variation for boost
        if (boosting) {
          colors[i3] = 0.5 + Math.random() * 0.5;     // R
          colors[i3 + 1] = Math.random() * 0.3;       // G
          colors[i3 + 2] = Math.random() * 0.8;       // B
        } else {
          colors[i3] = 1.0;                           // R
          colors[i3 + 1] = 0.3 + Math.random() * 0.4; // G
          colors[i3 + 2] = 0.0;                       // B
        }
      } else {
        // Hide particles when not moving
        positions[i3] = -1000;
        positions[i3 + 1] = -1000;
        positions[i3 + 2] = -1000;
      }
    }
    
    this.engineParticles.geometry.attributes.position.needsUpdate = true;
    this.engineParticles.geometry.attributes.color.needsUpdate = true;
  }

  update(deltaTime) {
    // Update position
    this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
    
    // Keep ship in bounds (wrap around)
    if (this.position.x > 100) this.position.x = -100;
    if (this.position.x < -100) this.position.x = 100;
    if (this.position.z > 100) this.position.z = -100;
    if (this.position.z < -100) this.position.z = 100;
    
    // Update mesh position and rotation
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.y = this.rotation;
      
      // Add slight banking when turning
      this.mesh.rotation.z = -this.rotationSpeed * 0.5;
      
      // Damage effect
      if (Date.now() - this.lastDamageTime < 1000) {
        this.mesh.material = this.mesh.children[0].material;
        const flash = Math.sin(Date.now() * 0.02) > 0;
        this.mesh.visible = flash;
      } else {
        this.mesh.visible = true;
      }
    }
    
    // Regenerate fuel slowly
    this.fuel = Math.min(this.maxFuel, this.fuel + 10 * deltaTime);
  }

  takeDamage() {
    this.shields = Math.max(0, this.shields - 1);
    this.lastDamageTime = Date.now();
  }

  addFuel(amount) {
    this.fuel = Math.min(this.maxFuel, this.fuel + amount);
  }

  addShield() {
    this.shields = Math.min(3, this.shields + 1);
  }

  getPosition() {
    return this.position.clone();
  }

  reset() {
    this.shields = 3;
    this.fuel = 100;
    this.speed = 0;
    this.rotationSpeed = 0;
    this.position.set(0, 0, 0);
    this.rotation = 0;
    this.velocity.set(0, 0, 0);
    this.lastDamageTime = 0;
    
    if (this.mesh) {
      this.mesh.position.copy(this.position);
      this.mesh.rotation.set(0, 0, 0);
      this.mesh.visible = true;
    }
  }
}
