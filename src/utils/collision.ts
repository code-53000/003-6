import { Position, TrainSegment } from '@/types/game';
import { GRID_SIZE } from '@/constants/game';

export const isOutOfBounds = (pos: Position): boolean => {
  return pos.x < 0 || pos.x >= GRID_SIZE || pos.y < 0 || pos.y >= GRID_SIZE;
};

export const isSamePosition = (a: Position, b: Position): boolean => {
  return a.x === b.x && a.y === b.y;
};

export const isCollidingWithTrain = (
  pos: Position,
  train: TrainSegment[],
  excludeHead: boolean = false
): boolean => {
  const startIndex = excludeHead ? 1 : 0;
  return train.slice(startIndex).some((segment) => isSamePosition(segment, pos));
};

export const getRandomEmptyPosition = (train: TrainSegment[]): Position => {
  let pos: Position;
  let attempts = 0;
  const maxAttempts = GRID_SIZE * GRID_SIZE;

  do {
    pos = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    attempts++;
  } while (isCollidingWithTrain(pos, train) && attempts < maxAttempts);

  return pos;
};
