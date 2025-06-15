import { useEffect, useRef } from 'react';
import { Game } from '../game/Game.js';

export const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize the game
    gameRef.current = new Game(canvasRef.current);
    
    // Make game instance globally available for UI callbacks
    (window as any).gameInstance = gameRef.current;

    // Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.dispose();
        gameRef.current = null;
      }
      delete (window as any).gameInstance;
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-background overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          display: 'block',
          background: 'linear-gradient(to bottom, #000011, #000033)'
        }}
      />
    </div>
  );
};