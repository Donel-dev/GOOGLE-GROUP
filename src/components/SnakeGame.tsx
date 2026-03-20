import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, RotateCcw, Trophy, AlertTriangle } from 'lucide-react';
import { GameStatus, Point } from '../types';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 120;
const SPEED_INCREMENT = 2;

const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

const INITIAL_DIRECTION = { x: 0, y: -1 };

export const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const directionRef = useRef(direction);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      const isOnSnake = currentSnake.some(
        (segment) => segment.x === newFood.x && segment.y === newFood.y
      );
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setStatus('PLAYING');
    setScore(0);
    setSpeed(INITIAL_SPEED);
  };

  const gameOver = useCallback(() => {
    setStatus('GAME_OVER');
    if (score > highScore) {
      setHighScore(score);
    }
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    if (status !== 'PLAYING') return;

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      // Wall collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        gameOver();
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => s + 10);
        setSpeed((s) => Math.max(50, s - SPEED_INCREMENT));
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, status, gameOver, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (status !== 'PLAYING') return;
      
      const currentDir = directionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (currentDir.y !== 1) directionRef.current = { x: 0, y: -1 };
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          if (currentDir.y !== -1) directionRef.current = { x: 0, y: 1 };
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (currentDir.x !== 1) directionRef.current = { x: -1, y: 0 };
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          if (currentDir.x !== -1) directionRef.current = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [status]);

  useEffect(() => {
    let intervalId: number;
    if (status === 'PLAYING') {
      intervalId = window.setInterval(moveSnake, speed);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, moveSnake, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GRID_SIZE * CELL_SIZE, GRID_SIZE * CELL_SIZE);

    // Draw grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, GRID_SIZE * CELL_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(GRID_SIZE * CELL_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = '#FF00FF';
    ctx.shadowColor = '#FF00FF';
    ctx.shadowBlur = 10;
    ctx.fillRect(food.x * CELL_SIZE + 2, food.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
    ctx.shadowBlur = 0;

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFFFFF' : '#00FFFF';
      ctx.shadowColor = '#00FFFF';
      ctx.shadowBlur = index === 0 ? 15 : 5;
      ctx.fillRect(
        segment.x * CELL_SIZE + 1,
        segment.y * CELL_SIZE + 1,
        CELL_SIZE - 2,
        CELL_SIZE - 2
      );
      ctx.shadowBlur = 0;
    });
  }, [snake, food]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg">
      <div className="w-full flex justify-between items-center bg-black border-2 border-cyan-500 p-4 shadow-[4px_4px_0px_#f0f]">
        <div className="flex flex-col">
          <span className="text-magenta-500 text-sm">DATA_FRAGMENTS</span>
          <span className="text-3xl font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-cyan-500 text-sm flex items-center gap-1">
            <Trophy className="w-4 h-4" /> MAX_FRAGMENTS
          </span>
          <span className="text-3xl font-bold text-white">{highScore}</span>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-magenta-500 opacity-20 blur-md group-hover:opacity-40 transition-opacity duration-500"></div>
        <div className="relative bg-black border-4 border-cyan-500 shadow-[8px_8px_0px_#f0f] p-2">
          <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="bg-black"
          />
          
          {status !== 'PLAYING' && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center border-4 border-magenta-500 m-2">
              {status === 'GAME_OVER' ? (
                <>
                  <AlertTriangle className="w-16 h-16 text-magenta-500 mb-4 animate-pulse" />
                  <h2 className="text-3xl font-bold text-white mb-2 glitch-text" data-text="FATAL_ERROR">FATAL_ERROR</h2>
                  <p className="text-cyan-400 mb-6">COLLISION_DETECTED</p>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 bg-cyan-500 text-black px-6 py-3 font-bold text-xl border-2 border-magenta-500 hover:bg-magenta-500 hover:text-white transition-colors uppercase shadow-[4px_4px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <RotateCcw className="w-5 h-5" />
                    REBOOT_SYS
                  </button>
                </>
              ) : (
                <>
                  <Play className="w-16 h-16 text-cyan-500 mb-4" />
                  <h2 className="text-3xl font-bold text-white mb-6">SYSTEM_READY</h2>
                  <button
                    onClick={startGame}
                    className="flex items-center gap-2 bg-magenta-500 text-black px-6 py-3 font-bold text-xl border-2 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-colors uppercase shadow-[4px_4px_0px_#fff] active:translate-x-1 active:translate-y-1 active:shadow-none"
                  >
                    <Play className="w-5 h-5" />
                    EXECUTE
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-black border-2 border-magenta-500 p-4 shadow-[4px_4px_0px_#0ff] text-center">
        <p className="text-cyan-400 text-sm">USE [W][A][S][D] OR ARROWS TO NAVIGATE</p>
      </div>
    </div>
  );
};
