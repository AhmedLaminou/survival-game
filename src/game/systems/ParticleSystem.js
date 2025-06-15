import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.explosions = [];
  }

  createExplosion(position, color = 0xff4400, particleCount = 30) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Initial positions (all at explosion center)
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      // Random velocities in all directions
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      velocities[i * 3] = velocity.x;
      velocities[i * 3 + 1] = velocity.y;
      velocities[i * 3 + 2] = velocity.z;
      
      // Color variations
      const baseColor = new THREE.Color(color);
      const variation = 0.3;
      colors[i * 3] = Math.min(1, baseColor.r + (Math.random() - 0.5) * variation);
      colors[i * 3 + 1] = Math.min(1, baseColor.g + (Math.random() - 0.5) * variation);
      colors[i * 3 + 2] = Math.min(1, baseColor.b + (Math.random() - 0.5) * variation);
      
      // Random sizes
      sizes[i] = Math.random() * 3 + 1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 3,
      transparent: true,
      opacity: 1.0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const explosion = new THREE.Points(geometry, material);
    explosion.userData = {
      life: 1.0,
      maxLife: 1.0,
      velocities: velocities,
      originalSizes: [...sizes]
    };
    
    this.explosions.push(explosion);
    this.scene.add(explosion);
  }

  createPickupEffect(position, color) {
    const particleCount = 15;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;
      
      // Upward spiral velocities
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 8 + Math.random() * 4;
      velocities[i * 3] = Math.cos(angle) * speed * 0.5;
      velocities[i * 3 + 1] = speed;
      velocities[i * 3 + 2] = Math.sin(angle) * speed * 0.5;
      
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      
      sizes[i] = Math.random() * 2 + 0.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 1.0,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const effect = new THREE.Points(geometry, material);
    effect.userData = {
      life: 0.8,
      maxLife: 0.8,
      velocities: velocities,
      originalSizes: [...sizes]
    };
    
    this.explosions.push(effect);
    this.scene.add(effect);
  }

  createTrail(position, color = 0x4488ff) {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3);
    const colors = new Float32Array(3);
    
    positions[0] = position.x;
    positions[1] = position.y;
    positions[2] = position.z;
    
    const baseColor = new THREE.Color(color);
    colors[0] = baseColor.r;
    colors[1] = baseColor.g;
    colors[2] = baseColor.b;
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
      size: 1,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });
    
    const particle = new THREE.Points(geometry, material);
    particle.userData = {
      life: 0.3,
      maxLife: 0.3
    };
    
    this.particles.push(particle);
    this.scene.add(particle);
  }

  update(deltaTime) {
    // Update explosions
    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const explosion = this.explosions[i];
      explosion.userData.life -= deltaTime;
      
      if (explosion.userData.life <= 0) {
        this.scene.remove(explosion);
        explosion.geometry.dispose();
        explosion.material.dispose();
        this.explosions.splice(i, 1);
        continue;
      }
      
      // Update particle positions
      const positions = explosion.geometry.attributes.position.array;
      const velocities = explosion.userData.velocities;
      const sizes = explosion.geometry.attributes.size.array;
      const originalSizes = explosion.userData.originalSizes;
      
      const lifeRatio = explosion.userData.life / explosion.userData.maxLife;
      const particleCount = positions.length / 3;
      
      for (let j = 0; j < particleCount; j++) {
        const j3 = j * 3;
        
        // Update position based on velocity
        positions[j3] += velocities[j3] * deltaTime;
        positions[j3 + 1] += velocities[j3 + 1] * deltaTime;
        positions[j3 + 2] += velocities[j3 + 2] * deltaTime;
        
        // Apply gravity
        velocities[j3 + 1] -= 9.8 * deltaTime;
        
        // Fade out and shrink
        sizes[j] = originalSizes[j] * lifeRatio;
      }
      
      // Update opacity
      explosion.material.opacity = lifeRatio;
      
      explosion.geometry.attributes.position.needsUpdate = true;
      explosion.geometry.attributes.size.needsUpdate = true;
    }
    
    // Update simple particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.userData.life -= deltaTime;
      
      if (particle.userData.life <= 0) {
        this.scene.remove(particle);
        particle.geometry.dispose();
        particle.material.dispose();
        this.particles.splice(i, 1);
        continue;
      }
      
      const lifeRatio = particle.userData.life / particle.userData.maxLife;
      particle.material.opacity = lifeRatio;
    }
  }

  reset() {
    // Clean up all particles
    [...this.explosions, ...this.particles].forEach(particle => {
      this.scene.remove(particle);
      particle.geometry.dispose();
      particle.material.dispose();
    });
    
    this.explosions = [];
    this.particles = [];
  }
}