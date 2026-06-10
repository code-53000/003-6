import { create } from 'zustand';
import { GameState, Direction, GameStatus, TrainSegment, PassengerStation, SmokeParticle, PassengerType, PassengerStats } from '@/types/game';
import { INITIAL_DIRECTION, INITIAL_TRAIN_LENGTH, GRID_SIZE } from '@/constants/game';

const createInitialTrain = (): TrainSegment[] => {
  const startX = Math.floor(GRID_SIZE / 2);
  const startY = Math.floor(GRID_SIZE / 2);
  const train: TrainSegment[] = [];

  for (let i = 0; i < INITIAL_TRAIN_LENGTH; i++) {
    train.push({
      id: i,
      x: startX - i,
      y: startY,
    });
  }

  return train;
};

const createInitialPassengerStats = (): PassengerStats => ({
  [PassengerType.NORMAL]: 0,
  [PassengerType.URGENT]: 0,
  [PassengerType.FAT]: 0,
});

const getInitialState = (): Omit<GameState, 'highScore'> => ({
  score: 0,
  level: 1,
  status: GameStatus.IDLE,
  train: createInitialTrain(),
  direction: INITIAL_DIRECTION,
  nextDirection: null,
  station: null,
  smokeParticles: [],
  passengersCollected: 0,
  passengerStats: createInitialPassengerStats(),
});

interface GameStore extends GameState {
  setDirection: (direction: Direction) => void;
  setNextDirection: (direction: Direction | null) => void;
  setStatus: (status: GameStatus) => void;
  setScore: (score: number) => void;
  setLevel: (level: number) => void;
  setHighScore: (highScore: number) => void;
  setTrain: (train: TrainSegment[]) => void;
  setStation: (station: PassengerStation | null) => void;
  addSmokeParticle: (particle: SmokeParticle) => void;
  updateSmokeParticles: (particles: SmokeParticle[]) => void;
  incrementPassengersCollected: (type: PassengerType) => void;
  decrementStationTicks: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...getInitialState(),
  highScore: 0,

  setDirection: (direction) => set({ direction }),
  setNextDirection: (nextDirection) => set({ nextDirection }),
  setStatus: (status) => set({ status }),
  setScore: (score) => set({ score }),
  setLevel: (level) => set({ level }),
  setHighScore: (highScore) => set({ highScore }),
  setTrain: (train) => set({ train }),
  setStation: (station) => set({ station }),

  addSmokeParticle: (particle) =>
    set((state) => ({
      smokeParticles: [...state.smokeParticles, particle].slice(-20),
    })),

  updateSmokeParticles: (smokeParticles) => set({ smokeParticles }),

  incrementPassengersCollected: (type: PassengerType) =>
    set((state) => ({
      passengersCollected: state.passengersCollected + 1,
      passengerStats: {
        ...state.passengerStats,
        [type]: state.passengerStats[type] + 1,
      },
    })),

  decrementStationTicks: () =>
    set((state) => {
      if (!state.station) return {};
      const newTicks = state.station.ticksRemaining - 1;
      return {
        station: {
          ...state.station,
          ticksRemaining: newTicks,
        },
      };
    }),

  resetGame: () => {
    const { highScore } = get();
    set({
      ...getInitialState(),
      highScore,
    });
  },
}));
