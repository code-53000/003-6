import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

const HIGH_SCORE_KEY = 'pixel_train_high_score';

export const useLocalStorage = () => {
  const setHighScore = useGameStore((state) => state.setHighScore);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const status = useGameStore((state) => state.status);

  const loadHighScore = useCallback(() => {
    try {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        const value = parseInt(stored, 10);
        if (!isNaN(value) && value >= 0) {
          setHighScore(value);
        }
      }
    } catch (e) {
      console.error('Failed to load high score:', e);
    }
  }, [setHighScore]);

  const saveHighScore = useCallback(
    (value: number) => {
      try {
        localStorage.setItem(HIGH_SCORE_KEY, value.toString());
        setHighScore(value);
      } catch (e) {
        console.error('Failed to save high score:', e);
      }
    },
    [setHighScore]
  );

  useEffect(() => {
    loadHighScore();
  }, [loadHighScore]);

  useEffect(() => {
    if (score > highScore) {
      saveHighScore(score);
    }
  }, [status, score, highScore, saveHighScore]);

  return {
    loadHighScore,
    saveHighScore,
  };
};
