export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum PassengerType {
  NORMAL = 'NORMAL',
  URGENT = 'URGENT',
  FAT = 'FAT',
}

export interface Position {
  x: number;
  y: number;
}

export interface TrainSegment extends Position {
  id: number;
}

export interface PassengerStation extends Position {
  id: number;
  type: PassengerType;
  ticksRemaining: number;
}

export interface SmokeParticle {
  id: number;
  x: number;
  y: number;
  opacity: number;
  size: number;
}

export interface PassengerStats {
  [PassengerType.NORMAL]: number;
  [PassengerType.URGENT]: number;
  [PassengerType.FAT]: number;
}

export interface GameState {
  score: number;
  level: number;
  highScore: number;
  status: GameStatus;
  train: TrainSegment[];
  direction: Direction;
  nextDirection: Direction | null;
  station: PassengerStation | null;
  smokeParticles: SmokeParticle[];
  passengersCollected: number;
  passengerStats: PassengerStats;
}
