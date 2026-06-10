import { useEffect } from 'react';
import { Direction } from '@/types/game';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useGameStore } from '@/store/gameStore';
import { GameStatus } from '@/types/game';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: Direction.UP,
  ArrowDown: Direction.DOWN,
  ArrowLeft: Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  W: Direction.UP,
  s: Direction.DOWN,
  S: Direction.DOWN,
  a: Direction.LEFT,
  A: Direction.LEFT,
  d: Direction.RIGHT,
  D: Direction.RIGHT,
};

export const useKeyboardControls = () => {
  const { changeDirection, togglePause, startGame } = useGameEngine();
  const status = useGameStore((state) => state.status);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        if (status === GameStatus.PLAYING || status === GameStatus.PAUSED) {
          e.preventDefault();
          togglePause();
        }
        return;
      }

      const direction = KEY_TO_DIRECTION[e.key];
      if (direction) {
        e.preventDefault();

        if (status === GameStatus.GAME_OVER) {
          return;
        }

        changeDirection(direction);
      }

      if (e.key === ' ' && status === GameStatus.GAME_OVER) {
        e.preventDefault();
        startGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeDirection, togglePause, startGame, status]);

  return null;
};
