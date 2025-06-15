export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  boost: boolean;
  fire?: boolean;
}

export interface GameConfig {
  difficulty: 'easy' | 'normal' | 'hardcore';
  playerName?: string;
  selectedShip?: number;
}

export interface Mission {
  id: string;
  type: 'survive' | 'collect' | 'reach' | 'rescue';
  target: number;
  description: string;
  reward: number;
  completed: boolean;
}

export interface PlayerStats {
  totalPlaytime: number;
  highScore: number;
  missionsCompleted: number;
  totalDistance: number;
  enemiesDestroyed: number;
  gamesPlayed: number;
}

export interface PlayerData {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  stats: PlayerStats;
  unlockedShips: number[];
  currentShip: number;
  level: number;
  experience: number;
  settings: {
    volume: number;
    difficulty: string;
    controls: string;
  };
}

export interface GameLevel {
  id: number;
  name: string;
  spawnRate: number;
  asteroidSpeed: number;
  asteroidTypes: string[];
  hasWarpGate: boolean;
  hasBoss: boolean;
  duration: number;
}

export interface Pickup {
  type: 'fuel' | 'shield' | 'score' | 'xp' | 'weapon';
  value: number;
  position: Vector3;
}

export interface Asteroid {
  type: 'small' | 'medium' | 'large' | 'crystal' | 'metal';
  health: number;
  speed: number;
  rotationSpeed: number;
  position: Vector3;
  radius: number;
}