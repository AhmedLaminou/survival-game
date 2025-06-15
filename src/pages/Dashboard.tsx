import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlayerData } from '../types/GameTypes';

const Dashboard = () => {
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [selectedShip, setSelectedShip] = useState(0);

  useEffect(() => {
    loadPlayerData();
  }, []);

  const loadPlayerData = () => {
    const savedData = localStorage.getItem('asteroidNavigatorCurrentUser');
    if (savedData) {
      setPlayerData(JSON.parse(savedData));
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getShipName = (shipId: number): string => {
    const ships = ['Interceptor', 'Cruiser', 'Battleship', 'Stealth Fighter', 'Destroyer'];
    return ships[shipId] || `Ship ${shipId + 1}`;
  };

  const getShipDescription = (shipId: number): string => {
    const descriptions = [
      'Fast and agile starter ship',
      'Balanced performance and durability',
      'Heavy armor, slower but powerful',
      'Advanced cloaking capabilities',
      'Ultimate firepower and shields'
    ];
    return descriptions[shipId] || 'Unknown ship type';
  };

  const calculateLevel = (experience: number): number => {
    return Math.floor(experience / 100) + 1;
  };

  const calculateLevelProgress = (experience: number): number => {
    return (experience % 100);
  };

  const selectShip = (shipId: number) => {
    if (playerData && playerData.unlockedShips.includes(shipId)) {
      const updatedData = { ...playerData, currentShip: shipId };
      setPlayerData(updatedData);
      localStorage.setItem('asteroidNavigatorCurrentUser', JSON.stringify(updatedData));
      setSelectedShip(shipId);
    }
  };

  if (!playerData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">No Player Data Found</h2>
              <p className="text-muted-foreground mb-6">
                Please play the game first to create your profile.
              </p>
              <Link to="/">
                <Button>Return to Game</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const playerLevel = calculateLevel(playerData.experience);
  const levelProgress = calculateLevelProgress(playerData.experience);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={playerData.avatar} />
              <AvatarFallback className="text-2xl">
                {playerData.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {playerData.username}
              </h1>
              <p className="text-muted-foreground">{playerData.email}</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="secondary">Level {playerLevel}</Badge>
                <Badge variant="outline">
                  {playerData.stats.gamesPlayed} Games Played
                </Badge>
              </div>
            </div>
          </div>
          <Link to="/">
            <Button variant="outline">Return to Game</Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                High Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {playerData.stats.highScore.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Playtime
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatTime(playerData.stats.totalPlaytime)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Missions Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {playerData.stats.missionsCompleted}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Distance Traveled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {Math.floor(playerData.stats.totalDistance / 1000)}km
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Experience and Level Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Experience Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Level {playerLevel}</span>
                <span>{playerData.experience} XP</span>
              </div>
              <Progress value={levelProgress} className="h-3" />
              <div className="text-sm text-muted-foreground">
                {100 - levelProgress} XP until next level
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ship Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Spaceship Hangar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[0, 1, 2, 3, 4].map((shipId) => {
                const isUnlocked = playerData.unlockedShips.includes(shipId);
                const isSelected = playerData.currentShip === shipId;
                
                return (
                  <Card 
                    key={shipId}
                    className={`relative cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    } ${!isUnlocked ? 'opacity-50' : ''}`}
                    onClick={() => selectShip(shipId)}
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg mb-3 flex items-center justify-center">
                        <div className="text-4xl">🚀</div>
                      </div>
                      <h3 className="font-semibold text-center">
                        {getShipName(shipId)}
                      </h3>
                      <p className="text-sm text-muted-foreground text-center mb-3">
                        {getShipDescription(shipId)}
                      </p>
                      
                      {isSelected && (
                        <Badge className="w-full justify-center">
                          Currently Selected
                        </Badge>
                      )}
                      
                      {!isUnlocked && (
                        <Badge variant="secondary" className="w-full justify-center">
                          Locked
                        </Badge>
                      )}
                      
                      {isUnlocked && !isSelected && (
                        <Button size="sm" className="w-full">
                          Select Ship
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Combat Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Enemies Destroyed</span>
                <span className="font-semibold">{playerData.stats.enemiesDestroyed}</span>
              </div>
              <div className="flex justify-between">
                <span>Games Played</span>
                <span className="font-semibold">{playerData.stats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between">
                <span>Survival Rate</span>
                <span className="font-semibold">
                  {playerData.stats.gamesPlayed > 0 
                    ? Math.round((playerData.stats.missionsCompleted / playerData.stats.gamesPlayed) * 100)
                    : 0}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progression Tree</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Unlock new ships and abilities as you level up!
                </div>
                
                {[
                  { level: 5, reward: 'Cruiser Ship', unlocked: playerLevel >= 5 },
                  { level: 10, reward: 'Battleship', unlocked: playerLevel >= 10 },
                  { level: 15, reward: 'Stealth Fighter', unlocked: playerLevel >= 15 },
                  { level: 20, reward: 'Destroyer', unlocked: playerLevel >= 20 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      item.unlocked ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.level}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${item.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {item.reward}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Level {item.level} required
                      </div>
                    </div>
                    {item.unlocked && (
                      <Badge variant="outline" className="text-xs">
                        Unlocked
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;