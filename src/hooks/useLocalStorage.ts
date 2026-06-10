import { useCallback, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GhostData } from '@/types/game';

const HIGH_SCORE_KEY = 'pixel_train_high_score';
const GHOST_DATA_KEY = 'pixel_train_ghost_data';

export const useLocalStorage = () => {
  const setHighScore = useGameStore((state) => state.setHighScore);
  const setBestGhostData = useGameStore((state) => state.setBestGhostData);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const bestGhostData = useGameStore((state) => state.bestGhostData);
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

  const loadGhostData = useCallback(() => {
    try {
      const stored = localStorage.getItem(GHOST_DATA_KEY);
      if (stored) {
        const data = JSON.parse(stored) as GhostData;
        if (data && data.score !== undefined && Array.isArray(data.frames)) {
          setBestGhostData(data);
        }
      }
    } catch (e) {
      console.error('Failed to load ghost data:', e);
    }
  }, [setBestGhostData]);

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

  const saveGhostData = useCallback(
    (data: GhostData) => {
      try {
        localStorage.setItem(GHOST_DATA_KEY, JSON.stringify(data));
        setBestGhostData(data);
      } catch (e) {
        console.error('Failed to save ghost data:', e);
      }
    },
    [setBestGhostData]
  );

  useEffect(() => {
    loadHighScore();
    loadGhostData();
  }, [loadHighScore, loadGhostData]);

  useEffect(() => {
    if (score > highScore) {
      saveHighScore(score);
    }
  }, [status, score, highScore, saveHighScore]);

  useEffect(() => {
    if (bestGhostData && bestGhostData.score > highScore) {
      saveGhostData(bestGhostData);
    }
  }, [bestGhostData, highScore, saveGhostData]);

  return {
    loadHighScore,
    saveHighScore,
    loadGhostData,
    saveGhostData,
  };
};
