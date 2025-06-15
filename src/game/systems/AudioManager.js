export class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.musicGainNode = null;
    this.sfxGainNode = null;
    this.backgroundMusic = null;
    this.isEnabled = true;
    
    this.init();
  }

  init() {
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.musicGainNode = this.audioContext.createGain();
      this.sfxGainNode = this.audioContext.createGain();
      
      this.musicGainNode.connect(this.audioContext.destination);
      this.sfxGainNode.connect(this.audioContext.destination);
      
      // Set initial volumes
      this.musicGainNode.gain.value = 0.3;
      this.sfxGainNode.gain.value = 0.5;
      
      // Generate procedural sounds
      this.generateSounds();
    } catch (error) {
      console.warn('Audio not supported:', error);
      this.isEnabled = false;
    }
  }

  generateSounds() {
    if (!this.isEnabled) return;
    
    // Generate boost sound
    this.sounds.boost = this.createBoostSound();
    
    // Generate collision sound
    this.sounds.collision = this.createCollisionSound();
    
    // Generate pickup sound
    this.sounds.pickup = this.createPickupSound();
    
    // Generate game over sound
    this.sounds.gameOver = this.createGameOverSound();
  }

  createBoostSound() {
    const duration = 0.3;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 + t * 400; // Rising frequency
      const envelope = Math.exp(-t * 8); // Exponential decay
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
    
    return buffer;
  }

  createCollisionSound() {
    const duration = 0.5;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() - 0.5) * 2;
      const frequency = 100 * Math.exp(-t * 3);
      const envelope = Math.exp(-t * 5);
      data[i] = (noise * 0.7 + Math.sin(2 * Math.PI * frequency * t) * 0.3) * envelope * 0.4;
    }
    
    return buffer;
  }

  createPickupSound() {
    const duration = 0.2;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency1 = 400 + Math.sin(t * 30) * 100;
      const frequency2 = 600 + Math.sin(t * 40) * 150;
      const envelope = Math.exp(-t * 10);
      data[i] = (Math.sin(2 * Math.PI * frequency1 * t) + Math.sin(2 * Math.PI * frequency2 * t)) * envelope * 0.2;
    }
    
    return buffer;
  }

  createGameOverSound() {
    const duration = 2.0;
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 * Math.exp(-t * 2); // Falling frequency
      const noise = (Math.random() - 0.5) * 2 * Math.exp(-t * 1);
      const envelope = Math.exp(-t * 1);
      data[i] = (Math.sin(2 * Math.PI * frequency * t) * 0.5 + noise * 0.5) * envelope * 0.3;
    }
    
    return buffer;
  }

  playSound(soundName, volume = 1.0) {
    if (!this.isEnabled || !this.sounds[soundName]) return;
    
    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = this.sounds[soundName];
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(this.sfxGainNode);
      
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  playBoostSound() {
    this.playSound('boost', 0.3);
  }

  playCollisionSound() {
    this.playSound('collision', 0.5);
  }

  playPickupSound() {
    this.playSound('pickup', 0.4);
  }

  playGameOverSound() {
    this.playSound('gameOver', 0.6);
  }

  playBackgroundMusic() {
    if (!this.isEnabled) return;
    
    this.stopBackgroundMusic();
    this.createBackgroundMusic();
  }

  createBackgroundMusic() {
    if (!this.audioContext) return;
    
    try {
      // Create a simple ambient background tone
      const oscillator1 = this.audioContext.createOscillator();
      const oscillator2 = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      const filterNode = this.audioContext.createBiquadFilter();
      
      oscillator1.type = 'sine';
      oscillator1.frequency.setValueAtTime(55, this.audioContext.currentTime); // Low A
      
      oscillator2.type = 'sine';
      oscillator2.frequency.setValueAtTime(82.4, this.audioContext.currentTime); // Low E
      
      filterNode.type = 'lowpass';
      filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
      
      gainNode.gain.setValueAtTime(0.05, this.audioContext.currentTime);
      
      oscillator1.connect(filterNode);
      oscillator2.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(this.musicGainNode);
      
      oscillator1.start();
      oscillator2.start();
      
      this.backgroundMusic = { oscillator1, oscillator2, gainNode };
    } catch (error) {
      console.warn('Error creating background music:', error);
    }
  }

  stopBackgroundMusic() {
    if (this.backgroundMusic) {
      try {
        this.backgroundMusic.oscillator1.stop();
        this.backgroundMusic.oscillator2.stop();
      } catch (error) {
        // Oscillators might already be stopped
      }
      this.backgroundMusic = null;
    }
  }

  pauseAll() {
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }

  resumeAll() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setMusicVolume(volume) {
    if (this.musicGainNode) {
      this.musicGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  setSFXVolume(volume) {
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  dispose() {
    this.stopBackgroundMusic();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}