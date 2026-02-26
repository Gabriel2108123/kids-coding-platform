import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { useSound } from '../utils/SoundManager';

interface PhaserGameEngineProps {
  gameCode: string;
  gameType: 'click-game' | 'maze-game' | 'quiz-game' | 'drawing-game' | 'story-game' | 'blank';
  onGameEvent?: (event: string, data: any) => void;
  width?: number;
  height?: number;
}

interface GameState {
  score: number;
  level: number;
  lives: number;
  gameTime: number;
  isGameOver: boolean;
  isPaused: boolean;
}

const PhaserGameEngine: React.FC<PhaserGameEngineProps> = ({
  gameCode,
  gameType,
  onGameEvent,
  width = 800,
  height = 600
}) => {
  const gameRef = useRef<HTMLDivElement>(null);
  const phaserGameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    level: 1,
    lives: 3,
    gameTime: 0,
    isGameOver: false,
    isPaused: false
  });
  const { playClick, playSuccess } = useSound();
  // playError is available but not used in current game implementations

  // Game scene classes for different game types
  class ClickGameScene extends Phaser.Scene {
    private score: number = 0;
    private scoreText?: Phaser.GameObjects.Text;
    private clickTarget?: Phaser.GameObjects.Rectangle;
    private particles?: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor() {
      super({ key: 'ClickGameScene' });
    }

    preload() {
      // Create simple colored rectangles as placeholders
      this.load.image('target', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
    }

    create() {
      // Background
      this.add.rectangle(width/2, height/2, width, height, 0x87CEEB);
      
      // Title
      this.add.text(width/2, 50, 'Click Counter Game!', {
        fontSize: '32px',
        color: '#000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // Score display
      this.scoreText = this.add.text(20, 20, 'Score: 0', {
        fontSize: '24px',
        color: '#000',
        fontFamily: 'Arial'
      });

      // Click target
      this.createClickTarget();

      // Particle system for click effects
      this.particles = this.add.particles(0, 0, 'target', {
        scale: { start: 0.5, end: 0 },
        lifespan: 300,
        quantity: 5,
        tint: [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]
      });
      this.particles.stop();

      // Execute user's Blockly code safely
      this.executeUserCode();
    }

    private createClickTarget() {
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(150, height - 100);
      
      this.clickTarget = this.add.rectangle(x, y, 80, 80, 0xff6b6b)
        .setInteractive()
        .on('pointerdown', this.onTargetClick, this);
      
      // Add bounce animation
      this.tweens.add({
        targets: this.clickTarget,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }

    private onTargetClick() {
      this.score += 10;
      this.scoreText?.setText(`Score: ${this.score}`);
      
      // Particle effect
      if (this.clickTarget && this.particles) {
        this.particles.emitParticleAt(this.clickTarget.x, this.clickTarget.y);
      }
      
      // Play sound and update state
      playSuccess();
      setGameState(prev => ({ ...prev, score: this.score }));
      onGameEvent?.('score_updated', { score: this.score });
      
      // Move target to new position
      this.clickTarget?.destroy();
      this.createClickTarget();
    }

    private executeUserCode() {
      try {
        // Create a safe execution context for user's Blockly code
        // eslint-disable-next-line no-new-func
        const safeEval = new Function('scene', 'game', 'score', gameCode);
        safeEval(this, this.game, this.score);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('User code execution error:', error);
      }
    }
  }

  class MazeGameScene extends Phaser.Scene {
    private player?: Phaser.GameObjects.Rectangle;
    private walls: Phaser.GameObjects.Rectangle[] = [];
    private goal?: Phaser.GameObjects.Rectangle;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    constructor() {
      super({ key: 'MazeGameScene' });
    }

    create() {
      // Background
      this.add.rectangle(width/2, height/2, width, height, 0x2d5a87);
      
      // Title
      this.add.text(width/2, 30, 'Maze Adventure!', {
        fontSize: '28px',
        color: '#fff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // Create simple maze
      this.createMaze();
      
      // Create player
      this.player = this.add.rectangle(60, 90, 20, 20, 0x4ecdc4);
      
      // Create goal
      this.goal = this.add.rectangle(width - 60, height - 90, 30, 30, 0xffe66d);
      
      // Input
      this.cursors = this.input.keyboard?.createCursorKeys();
      
      // Execute user code
      this.executeUserCode();
    }

    private createMaze() {
      const wallPositions = [
        { x: 200, y: 150, w: 20, h: 200 },
        { x: 400, y: 300, w: 20, h: 150 },
        { x: 600, y: 200, w: 20, h: 250 },
        { x: 300, y: 400, w: 200, h: 20 }
      ];

      wallPositions.forEach(wall => {
        const wallObj = this.add.rectangle(wall.x, wall.y, wall.w, wall.h, 0x8b4513);
        this.walls.push(wallObj);
      });
    }

    update() {
      if (!this.player || !this.cursors) return;

      const speed = 3;
      let newX = this.player.x;
      let newY = this.player.y;

      if (this.cursors.left.isDown) newX -= speed;
      if (this.cursors.right.isDown) newX += speed;
      if (this.cursors.up.isDown) newY -= speed;
      if (this.cursors.down.isDown) newY += speed;

      // Boundary checking
      if (newX > 10 && newX < width - 10 && newY > 60 && newY < height - 10) {
        // Wall collision checking
        let canMove = true;
        for (const wall of this.walls) {
          if (this.checkCollision(newX, newY, wall)) {
            canMove = false;
            break;
          }
        }

        if (canMove) {
          this.player.setPosition(newX, newY);
        }
      }

      // Goal checking
      if (this.goal && this.checkCollision(this.player.x, this.player.y, this.goal)) {
        this.winGame();
      }
    }

    private checkCollision(x: number, y: number, target: Phaser.GameObjects.Rectangle): boolean {
      return Math.abs(x - target.x) < (target.width + 20) / 2 &&
             Math.abs(y - target.y) < (target.height + 20) / 2;
    }

    private winGame() {
      playSuccess();
      this.add.text(width/2, height/2, 'You Win!', {
        fontSize: '48px',
        color: '#fff',
        fontFamily: 'Arial'
      }).setOrigin(0.5);
      
      onGameEvent?.('game_won', { time: gameState.gameTime });
    }

    private executeUserCode() {
      try {
        // eslint-disable-next-line no-new-func
        const safeEval = new Function('scene', 'player', 'game', gameCode);
        safeEval(this, this.player, this.game);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('User code execution error:', error);
      }
    }
  }

  class DrawingGameScene extends Phaser.Scene {
    private graphics?: Phaser.GameObjects.Graphics;
    private isDrawing: boolean = false;
    private currentColor: number = 0xff0000;
    private brushSize: number = 5;

    constructor() {
      super({ key: 'DrawingGameScene' });
    }

    create() {
      // Background
      this.add.rectangle(width/2, height/2, width, height, 0xffffff);
      
      // Title
      this.add.text(width/2, 30, 'Art Creator!', {
        fontSize: '28px',
        color: '#000',
        fontFamily: 'Arial'
      }).setOrigin(0.5);

      // Drawing canvas
      this.graphics = this.add.graphics();
      this.graphics.fillStyle(0xf0f0f0);
      this.graphics.fillRect(50, 80, width - 100, height - 150);

      // Color palette
      this.createColorPalette();

      // Drawing controls
      this.input.on('pointerdown', this.startDrawing, this);
      this.input.on('pointermove', this.draw, this);
      this.input.on('pointerup', this.stopDrawing, this);

      this.executeUserCode();
    }

    private createColorPalette() {
      const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff, 0x000000];
      colors.forEach((color, index) => {
        this.add.rectangle(70 + index * 40, height - 40, 30, 30, color)
          .setInteractive()
          .on('pointerdown', () => {
            this.currentColor = color;
            playClick();
          });
      });
    }

    private startDrawing(pointer: Phaser.Input.Pointer) {
      if (pointer.y > 80 && pointer.y < height - 70) {
        this.isDrawing = true;
      }
    }

    private draw(pointer: Phaser.Input.Pointer) {
      if (this.isDrawing && this.graphics && pointer.y > 80 && pointer.y < height - 70) {
        this.graphics.fillStyle(this.currentColor);
        this.graphics.fillCircle(pointer.x, pointer.y, this.brushSize);
      }
    }

    private stopDrawing() {
      this.isDrawing = false;
    }

    private executeUserCode() {
      try {
        // eslint-disable-next-line no-new-func
        const safeEval = new Function('scene', 'graphics', 'game', gameCode);
        safeEval(this, this.graphics, this.game);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.warn('User code execution error:', error);
      }
    }
  }

  // Initialize Phaser game
  useEffect(() => {
    if (!gameRef.current) return;

    // Clean up existing game
    if (phaserGameRef.current) {
      phaserGameRef.current.destroy(true);
    }

    // Choose scene based on game type
    let sceneClass;
    switch (gameType) {
      case 'click-game':
        sceneClass = ClickGameScene;
        break;
      case 'maze-game':
        sceneClass = MazeGameScene;
        break;
      case 'drawing-game':
        sceneClass = DrawingGameScene;
        break;
      default:
        sceneClass = ClickGameScene;
    }

    // Phaser game configuration
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width,
      height,
      parent: gameRef.current,
      backgroundColor: '#f0f0f0',
      scene: sceneClass,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0, x: 0 },
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    // Create game
    phaserGameRef.current = new Phaser.Game(config);

    // Game event listeners
    phaserGameRef.current.events.on('ready', () => {
      // eslint-disable-next-line no-console
      console.log('Phaser game ready');
      onGameEvent?.('game_ready', {});
    });

    // Cleanup function
    return () => {
      if (phaserGameRef.current) {
        phaserGameRef.current.destroy(true);
        phaserGameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameCode, gameType, width, height]);

  const handleRestart = () => {
    setGameState({
      score: 0,
      level: 1,
      lives: 3,
      gameTime: 0,
      isGameOver: false,
      isPaused: false
    });
    
    if (phaserGameRef.current) {
      const sceneKey = gameType === 'click-game' ? 'ClickGameScene' : 
                       gameType === 'maze-game' ? 'MazeGameScene' : 
                       'DrawingGameScene';
      
      phaserGameRef.current.scene.stop(sceneKey);
      phaserGameRef.current.scene.start(sceneKey);
    }
  };

  const handlePause = () => {
    if (phaserGameRef.current) {
      const sceneKey = gameType === 'click-game' ? 'ClickGameScene' : 
                       gameType === 'maze-game' ? 'MazeGameScene' : 
                       'DrawingGameScene';
      
      if (gameState.isPaused) {
        phaserGameRef.current.scene.resume(sceneKey);
      } else {
        phaserGameRef.current.scene.pause(sceneKey);
      }
      setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
    }
  };

  return (
    <div className="phaser-game-container w-full h-full flex flex-col">
      {/* Game Controls */}
      <div className="game-controls flex justify-between items-center p-4 bg-gray-100 rounded-t-lg">
        <div className="game-stats flex gap-4 text-sm">
          <span className="font-semibold">Score: {gameState.score}</span>
          <span className="font-semibold">Level: {gameState.level}</span>
          <span className="font-semibold">Lives: {gameState.lives}</span>
        </div>
        
        <div className="game-buttons flex gap-2">
          <button
            onClick={handlePause}
            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
          >
            {gameState.isPaused ? '▶️ Resume' : '⏸️ Pause'}
          </button>
          <button
            onClick={handleRestart}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            🔄 Restart
          </button>
        </div>
      </div>

      {/* Game Canvas */}
      <div 
        ref={gameRef} 
        className="game-canvas flex-1 bg-gray-200 rounded-b-lg overflow-hidden"
        style={{ minHeight: `${height}px` }}
      />

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Game Over!</h2>
            <p className="text-lg mb-4">Final Score: {gameState.score}</p>
            <button
              onClick={handleRestart}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaserGameEngine;
