import { GameConfig, Mission, PlayerData, GameLevel } from '../../types/GameTypes';

export class GameState {
  public score: number = 0;
  public gameTime: number = 0;
  public difficulty: 'easy' | 'normal' | 'hardcore' = 'normal';
  public gameOver: boolean = false;
  public level: number = 1;
  public enemiesDestroyed: number = 0;
  public distance: number = 0;
  public experience: number = 0;
  public currentMission: Mission | null = null;
  public gameMode: 'survival' | 'mission' | 'challenge' = 'survival';
  public playerData: PlayerData | null = null;
  
  private missions: Mission[] = [
    {
      id: 'survive_30',
      type: 'survive',
      target: 30,
      description: 'Survive for 30 seconds',
      reward: 100,
      completed: false
    },
    {
      id: 'collect_10',
      type: 'collect',
      target: 10,
      description: 'Collect 10 pickups',
      reward: 150,
      completed: false
    },
    {
      id: 'reach_level_3',
      type: 'reach',
      target: 3,
      description: 'Reach level 3',
      reward: 200,
      completed: false
    }
  ];

  private levels: GameLevel[] = [
    {
      id: 1,
      name: 'Asteroid Belt',
      spawnRate: 0.5,
      asteroidSpeed: 5,
      asteroidTypes: ['small', 'medium'],
      hasWarpGate: false,
      hasBoss: false,
      duration: 60
    },
    {
      id: 2,
      name: 'Dense Field',
      spawnRate: 0.8,
      asteroidSpeed: 7,
      asteroidTypes: ['small', 'medium', 'large'],
      hasWarpGate: false,
      hasBoss: false,
      duration: 90
    },
    {
      id: 3,
      name: 'Crystal Mines',
      spawnRate: 1.0,
      asteroidSpeed: 8,
      asteroidTypes: ['crystal', 'metal'],
      hasWarpGate: true,
      hasBoss: false,
      duration: 120
    },
    {
      id: 4,
      name: 'Boss Sector',
      spawnRate: 0.6,
      asteroidSpeed: 10,
      asteroidTypes: ['large', 'metal'],
      hasWarpGate: false,
      hasBoss: true,
      duration: 180
    }
  ];

  constructor() {
    this.reset();
    this.loadPlayerData();
  }

  reset(): void {
    this.score = 0;
    this.gameTime = 0;
    this.gameOver = false;
    this.level = 1;
    this.enemiesDestroyed = 0;
    this.distance = 0;
    this.experience = 0;
    this.currentMission = this.getRandomMission();
  }

  loadPlayerData(): void {
    const savedData = localStorage.getItem('asteroidNavigatorPlayer');
    if (savedData) {
      this.playerData = JSON.parse(savedData);
    }
  }

  savePlayerData(): void {
    if (this.playerData) {
      localStorage.setItem('asteroidNavigatorPlayer', JSON.stringify(this.playerData));
    }
  }

  setPlayerData(data: PlayerData): void {
    this.playerData = data;
    this.savePlayerData();
  }

  getDifficultyMultiplier(): number {
    switch (this.difficulty) {
      case 'easy': return 0.7;
      case 'hardcore': return 1.5;
      default: return 1.0;
    }
  }

  getCurrentLevel(): number {
    return Math.floor(this.gameTime / 30) + 1;
  }

  getCurrentLevelData(): GameLevel {
    const levelIndex = Math.min(this.level - 1, this.levels.length - 1);
    return this.levels[levelIndex];
  }

  getRandomMission(): Mission {
    const availableMissions = this.missions.filter(m => !m.completed);
    if (availableMissions.length === 0) return null;
    return availableMissions[Math.floor(Math.random() * availableMissions.length)];
  }

  checkMissionProgress(): boolean {
    if (!this.currentMission) return false;

    let progress = 0;
    switch (this.currentMission.type) {
      case 'survive':
        progress = this.gameTime;
        break;
      case 'collect':
        // This would be tracked by pickup collection
        progress = 0; // Placeholder
        break;
      case 'reach':
        progress = this.level;
        break;
      case 'rescue':
        // This would be tracked by rescue events
        progress = 0; // Placeholder
        break;
    }

    if (progress >= this.currentMission.target) {
      this.completeMission();
      return true;
    }
    return false;
  }

  completeMission(): void {
    if (!this.currentMission) return;
    
    this.currentMission.completed = true;
    this.score += this.currentMission.reward;
    this.experience += this.currentMission.reward / 2;
    
    // Update player stats
    if (this.playerData) {
      this.playerData.stats.missionsCompleted++;
      this.playerData.experience += this.currentMission.reward / 2;
      this.savePlayerData();
    }
    
    // Get next mission
    this.currentMission = this.getRandomMission();
  }

  addExperience(amount: number): void {
    this.experience += amount;
    if (this.playerData) {
      this.playerData.experience += amount;
      this.savePlayerData();
    }
  }

  updateStats(finalScore: number, playTime: number): void {
    if (!this.playerData) return;

    this.playerData.stats.gamesPlayed++;
    this.playerData.stats.totalPlaytime += playTime;
    this.playerData.stats.totalDistance += this.distance;
    this.playerData.stats.enemiesDestroyed += this.enemiesDestroyed;
    
    if (finalScore > this.playerData.stats.highScore) {
      this.playerData.stats.highScore = finalScore;
    }
    
    this.savePlayerData();
  }
}