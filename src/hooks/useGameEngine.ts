import { useEffect, useCallback, useRef } from 'react';
import { Direction, GameStatus, PassengerType } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import {
  INITIAL_SPEED,
  MIN_SPEED,
  MAX_LEVEL,
  PASSENGERS_PER_LEVEL,
  OPPOSITE_DIRECTION,
  DIRECTION_VECTOR,
  PASSENGER_WEIGHTS,
  PASSENGER_SCORES,
  URGENT_PASSENGER_TICKS,
  URGENT_PASSENGER_PENALTY,
} from '@/constants/game';
import { isOutOfBounds, isCollidingWithTrain, isSamePosition, getRandomEmptyPosition } from '@/utils/collision';

const getRandomPassengerType = (): PassengerType => {
  const totalWeight = Object.values(PASSENGER_WEIGHTS).reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (const [type, weight] of Object.entries(PASSENGER_WEIGHTS) as [PassengerType, number][]) {
    random -= weight;
    if (random <= 0) {
      return type;
    }
  }

  return PassengerType.NORMAL;
};

export const useGameEngine = () => {
  const {
    status,
    train,
    direction,
    nextDirection,
    station,
    level,
    score,
    passengersCollected,
    setDirection,
    setNextDirection,
    setStatus,
    setScore,
    setLevel,
    setTrain,
    setStation,
    addSmokeParticle,
    updateSmokeParticles,
    smokeParticles,
    incrementPassengersCollected,
    decrementStationTicks,
    resetGame,
  } = useGameStore();

  const gameLoopRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const particleIdRef = useRef(0);

  const getSpeed = useCallback((): number => {
    const speedRange = INITIAL_SPEED - MIN_SPEED;
    const speedReduction = ((level - 1) * speedRange) / (MAX_LEVEL - 1);
    return Math.max(MIN_SPEED, INITIAL_SPEED - speedReduction);
  }, [level]);

  const spawnStation = useCallback(() => {
    const pos = getRandomEmptyPosition(train);
    const type = getRandomPassengerType();
    setStation({
      id: Date.now(),
      x: pos.x,
      y: pos.y,
      type,
      ticksRemaining: type === PassengerType.URGENT ? URGENT_PASSENGER_TICKS : -1,
    });
  }, [train, setStation]);

  const addSmoke = useCallback(() => {
    const head = train[0];
    if (!head) return;

    const offsetX = (Math.random() - 0.5) * 0.3;
    const offsetY = -0.3 - Math.random() * 0.2;

    addSmokeParticle({
      id: particleIdRef.current++,
      x: head.x + 0.5 + offsetX,
      y: head.y + 0.5 + offsetY,
      opacity: 0.8,
      size: 0.2,
    });
  }, [train, addSmokeParticle]);

  const removeExpiredSmoke = useCallback(() => {
    const updated = smokeParticles.filter((p) => p.opacity > 0);
    if (updated.length !== smokeParticles.length) {
      updateSmokeParticles(updated);
    }
  }, [smokeParticles, updateSmokeParticles]);

  const handleUrgentStationTimeout = useCallback(() => {
    if (station && station.type === PassengerType.URGENT && station.ticksRemaining <= 0) {
      setScore(Math.max(0, score - URGENT_PASSENGER_PENALTY));
      setStation(null);
    }
  }, [station, score, setScore, setStation]);

  const moveTrain = useCallback(() => {
    if (nextDirection) {
      setDirection(nextDirection);
      setNextDirection(null);
    }

    const head = train[0];
    if (!head) return;

    const vector = DIRECTION_VECTOR[nextDirection || direction];
    const newHead = {
      id: Date.now(),
      x: head.x + vector.dx,
      y: head.y + vector.dy,
    };

    if (isOutOfBounds(newHead) || isCollidingWithTrain(newHead, train, true)) {
      setStatus(GameStatus.GAME_OVER);
      return;
    }

    const newTrain = [newHead, ...train];
    const ateStation = station && isSamePosition(newHead, station);

    if (!ateStation) {
      newTrain.pop();
    } else {
      const passengerScore = PASSENGER_SCORES[station.type];
      setScore(score + passengerScore);
      incrementPassengersCollected(station.type);

      if (station.type === PassengerType.FAT) {
        const tail = train[train.length - 1];
        newTrain.push({ ...tail, id: Date.now() + 1 });
      }

      setStation(null);
    }

    setTrain(newTrain);

    if (ateStation && passengersCollected > 0 && (passengersCollected + 1) % PASSENGERS_PER_LEVEL === 0) {
      const newLevel = Math.min(MAX_LEVEL, level + 1);
      if (newLevel !== level) {
        setLevel(newLevel);
      }
    }
  }, [
    train,
    direction,
    nextDirection,
    station,
    score,
    level,
    passengersCollected,
    setDirection,
    setNextDirection,
    setStatus,
    setScore,
    setLevel,
    setTrain,
    setStation,
    incrementPassengersCollected,
  ]);

  const gameTick = useCallback(() => {
    moveTrain();
    addSmoke();
    removeExpiredSmoke();

    if (station && station.type === PassengerType.URGENT) {
      decrementStationTicks();
      handleUrgentStationTimeout();
    }
  }, [moveTrain, addSmoke, removeExpiredSmoke, station, decrementStationTicks, handleUrgentStationTimeout]);

  const gameLoop = useCallback(
    (timestamp: number) => {
      if (status !== GameStatus.PLAYING) {
        gameLoopRef.current = null;
        return;
      }

      const speed = getSpeed();

      if (timestamp - lastTickRef.current >= speed) {
        gameTick();
        lastTickRef.current = timestamp;
      }

      if (!station && status === GameStatus.PLAYING) {
        spawnStation();
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    },
    [status, getSpeed, gameTick, station, spawnStation]
  );

  useEffect(() => {
    if (status === GameStatus.PLAYING) {
      lastTickRef.current = performance.now();
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [status, gameLoop]);

  const startGame = useCallback((initialDirection?: Direction) => {
    if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) {
      resetGame();
      if (initialDirection) {
        setDirection(initialDirection);
      }
      setStatus(GameStatus.PLAYING);
    }
  }, [status, resetGame, setDirection, setStatus]);

  const togglePause = useCallback(() => {
    if (status === GameStatus.PLAYING) {
      setStatus(GameStatus.PAUSED);
    } else if (status === GameStatus.PAUSED) {
      setStatus(GameStatus.PLAYING);
    }
  }, [status, setStatus]);

  const changeDirection = useCallback(
    (newDirection: Direction) => {
      if (status === GameStatus.IDLE) {
        startGame(newDirection);
        return;
      }

      if (status !== GameStatus.PLAYING) return;

      const currentDir = nextDirection || direction;
      if (OPPOSITE_DIRECTION[currentDir] === newDirection) return;

      setNextDirection(newDirection);
    },
    [status, direction, nextDirection, startGame, setNextDirection]
  );

  return {
    startGame,
    togglePause,
    changeDirection,
    resetGame,
    getSpeed,
  };
};
