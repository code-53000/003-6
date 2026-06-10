import { useCallback, useEffect, useRef } from 'react';
import { Direction, GameStatus, TrainSegment, PassengerStation, SmokeParticle, PassengerType } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { CELL_SIZE, GRID_SIZE, COLORS, URGENT_PASSENGER_TICKS } from '@/constants/game';

const drawPixelRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string
) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
};

const getStationColors = (type: PassengerType) => {
  switch (type) {
    case PassengerType.NORMAL:
      return { main: COLORS.STATION_NORMAL, dark: COLORS.STATION_NORMAL_DARK };
    case PassengerType.URGENT:
      return { main: COLORS.STATION_URGENT, dark: COLORS.STATION_URGENT_DARK };
    case PassengerType.FAT:
      return { main: COLORS.STATION_FAT, dark: COLORS.STATION_FAT_DARK };
    default:
      return { main: COLORS.STATION_NORMAL, dark: COLORS.STATION_NORMAL_DARK };
  }
};

const drawNormalPassengerIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  const px = cx - 3;
  const py = cy - 6;
  drawPixelRect(ctx, px + 2, py, 2, 2, COLORS.TEXT);
  drawPixelRect(ctx, px + 1, py + 2, 4, 4, COLORS.TEXT);
  drawPixelRect(ctx, px, py + 6, 2, 4, COLORS.TEXT);
  drawPixelRect(ctx, px + 4, py + 6, 2, 4, COLORS.TEXT);
};

const drawUrgentPassengerIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  const px = cx - 4;
  const py = cy - 6;
  drawPixelRect(ctx, px + 3, py, 2, 2, COLORS.TEXT);
  drawPixelRect(ctx, px + 2, py + 2, 4, 4, COLORS.TEXT);
  drawPixelRect(ctx, px, py + 6, 3, 3, COLORS.TEXT);
  drawPixelRect(ctx, px + 5, py + 6, 3, 3, COLORS.TEXT);
  drawPixelRect(ctx, px + 6, py + 3, 2, 2, COLORS.STATION_SIGN);
  drawPixelRect(ctx, px + 7, py + 1, 1, 2, COLORS.STATION_SIGN);
};

const drawFatPassengerIcon = (ctx: CanvasRenderingContext2D, cx: number, cy: number) => {
  const px = cx - 4;
  const py = cy - 6;
  drawPixelRect(ctx, px + 2, py, 4, 3, COLORS.TEXT);
  drawPixelRect(ctx, px, py + 3, 8, 5, COLORS.TEXT);
  drawPixelRect(ctx, px + 1, py + 8, 2, 4, COLORS.TEXT);
  drawPixelRect(ctx, px + 5, py + 8, 2, 4, COLORS.TEXT);
};

const drawPassengerIcon = (ctx: CanvasRenderingContext2D, type: PassengerType, cx: number, cy: number) => {
  switch (type) {
    case PassengerType.NORMAL:
      drawNormalPassengerIcon(ctx, cx, cy);
      break;
    case PassengerType.URGENT:
      drawUrgentPassengerIcon(ctx, cx, cy);
      break;
    case PassengerType.FAT:
      drawFatPassengerIcon(ctx, cx, cy);
      break;
  }
};

const drawCountdownIndicator = (
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  size: number,
  ticksRemaining: number
) => {
  const barWidth = size - 8;
  const barHeight = 4;
  const barX = px + 4;
  const barY = py + size - 8;

  const progress = ticksRemaining / URGENT_PASSENGER_TICKS;
  const fillWidth = Math.max(0, progress * barWidth);

  let barColor: string = COLORS.STATION_NORMAL;
  if (progress <= 0.3) {
    barColor = COLORS.COUNTDOWN_DANGER;
  } else if (progress <= 0.6) {
    barColor = COLORS.COUNTDOWN_WARN;
  }

  drawPixelRect(ctx, barX - 1, barY - 1, barWidth + 2, barHeight + 2, '#000000');
  drawPixelRect(ctx, barX, barY, barWidth, barHeight, '#2c3e50');
  drawPixelRect(ctx, barX, barY, fillWidth, barHeight, barColor);

  ctx.fillStyle = COLORS.TEXT;
  ctx.font = '8px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(ticksRemaining), px + size / 2, barY + barHeight / 2);
};

export const useGameRenderer = (canvasRef: React.RefObject<HTMLCanvasElement>) => {
  const train = useGameStore((state) => state.train);
  const direction = useGameStore((state) => state.direction);
  const station = useGameStore((state) => state.station);
  const smokeParticles = useGameStore((state) => state.smokeParticles);
  const status = useGameStore((state) => state.status);
  const nextDirection = useGameStore((state) => state.nextDirection);

  const animationFrameRef = useRef<number | null>(null);
  const localSmokeRef = useRef<SmokeParticle[]>([]);
  const lastSmokeIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) {
      localSmokeRef.current = [];
      lastSmokeIdsRef.current = new Set();
      return;
    }

    const currentIds = new Set(smokeParticles.map(p => p.id));
    const newParticles = smokeParticles.filter(p => !lastSmokeIdsRef.current.has(p.id));
    
    if (newParticles.length > 0) {
      localSmokeRef.current = [...localSmokeRef.current, ...newParticles];
    }
    
    lastSmokeIdsRef.current = currentIds;
  }, [smokeParticles, status]);

  const updateLocalSmoke = useCallback(() => {
    localSmokeRef.current = localSmokeRef.current
      .map((p) => ({
        ...p,
        y: p.y - 0.02,
        x: p.x + (Math.random() - 0.5) * 0.02,
        opacity: p.opacity - 0.03,
        size: p.size + 0.005,
      }))
      .filter((p) => p.opacity > 0);
  }, []);

  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    const totalSize = GRID_SIZE * CELL_SIZE;
    drawPixelRect(ctx, 0, 0, totalSize, totalSize, COLORS.BACKGROUND);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const px = x * CELL_SIZE;
        const py = y * CELL_SIZE;

        if ((x + y) % 2 === 0) {
          drawPixelRect(ctx, px, py, CELL_SIZE, CELL_SIZE, COLORS.RAIL);
        } else {
          drawPixelRect(ctx, px, py, CELL_SIZE, CELL_SIZE, COLORS.RAIL_SLEEPER);
        }

        drawPixelRect(ctx, px, py, CELL_SIZE, 2, COLORS.GRID_LINE);
        drawPixelRect(ctx, px, py, 2, CELL_SIZE, COLORS.GRID_LINE);
      }
    }
  }, []);

  const drawTrainHead = useCallback(
    (ctx: CanvasRenderingContext2D, segment: TrainSegment, dir: Direction) => {
      const px = segment.x * CELL_SIZE;
      const py = segment.y * CELL_SIZE;
      const size = CELL_SIZE;
      const padding = 2;

      const headColor = COLORS.TRAIN_HEAD;
      const darkColor = COLORS.TRAIN_HEAD_DARK;
      const windowColor = COLORS.TRAIN_WINDOW;
      const wheelColor = COLORS.TRAIN_WHEEL;
      const chimneyColor = COLORS.CHIMNEY;

      drawPixelRect(ctx, px + padding, py + padding, size - padding * 2, size - padding * 2, headColor);

      drawPixelRect(ctx, px + padding, py + size - padding - 6, size - padding * 2, 4, darkColor);

      const innerPad = 6;

      switch (dir) {
        case Direction.UP:
          drawPixelRect(ctx, px + size / 2 - 2, py + padding, 4, innerPad, chimneyColor);
          drawPixelRect(ctx, px + innerPad, py + innerPad + 4, size - innerPad * 2, 8, windowColor);
          drawPixelRect(ctx, px + padding + 2, py + size - padding - 4, 6, 4, wheelColor);
          drawPixelRect(ctx, px + size - padding - 8, py + size - padding - 4, 6, 4, wheelColor);
          break;
        case Direction.DOWN:
          drawPixelRect(ctx, px + size / 2 - 2, py + size - padding - innerPad, 4, innerPad, chimneyColor);
          drawPixelRect(ctx, px + innerPad, py + innerPad, size - innerPad * 2, 8, windowColor);
          drawPixelRect(ctx, px + padding + 2, py + padding, 6, 4, wheelColor);
          drawPixelRect(ctx, px + size - padding - 8, py + padding, 6, 4, wheelColor);
          break;
        case Direction.LEFT:
          drawPixelRect(ctx, px + padding, py + size / 2 - 2, innerPad, 4, chimneyColor);
          drawPixelRect(ctx, px + innerPad + 4, py + innerPad, 8, size - innerPad * 2, windowColor);
          drawPixelRect(ctx, px + size - padding - 4, py + padding + 2, 4, 6, wheelColor);
          drawPixelRect(ctx, px + size - padding - 4, py + size - padding - 8, 4, 6, wheelColor);
          break;
        case Direction.RIGHT:
          drawPixelRect(ctx, px + size - padding - innerPad, py + size / 2 - 2, innerPad, 4, chimneyColor);
          drawPixelRect(ctx, px + innerPad, py + innerPad, 8, size - innerPad * 2, windowColor);
          drawPixelRect(ctx, px + padding, py + padding + 2, 4, 6, wheelColor);
          drawPixelRect(ctx, px + padding, py + size - padding - 8, 4, 6, wheelColor);
          break;
      }
    },
    []
  );

  const drawTrainBody = useCallback(
    (ctx: CanvasRenderingContext2D, segment: TrainSegment, index: number) => {
      const px = segment.x * CELL_SIZE;
      const py = segment.y * CELL_SIZE;
      const size = CELL_SIZE;
      const padding = 3;

      const isEven = index % 2 === 0;
      const bodyColor = isEven ? COLORS.TRAIN_BODY : COLORS.TRAIN_BODY_DARK;
      const darkColor = COLORS.TRAIN_BODY_DARK;
      const windowColor = COLORS.TRAIN_WINDOW;
      const wheelColor = COLORS.TRAIN_WHEEL;

      drawPixelRect(ctx, px + padding, py + padding, size - padding * 2, size - padding * 2, bodyColor);

      drawPixelRect(ctx, px + padding, py + size - padding - 5, size - padding * 2, 3, darkColor);

      const windowSize = 6;
      const windowPad = 8;
      drawPixelRect(
        ctx,
        px + windowPad,
        py + windowPad,
        size - windowPad * 2,
        windowSize,
        windowColor
      );
      drawPixelRect(
        ctx,
        px + windowPad,
        py + size - windowPad - windowSize,
        size - windowPad * 2,
        windowSize,
        windowColor
      );

      drawPixelRect(ctx, px + padding + 2, py + padding, 5, 3, wheelColor);
      drawPixelRect(ctx, px + size - padding - 7, py + padding, 5, 3, wheelColor);
      drawPixelRect(ctx, px + padding + 2, py + size - padding - 3, 5, 3, wheelColor);
      drawPixelRect(ctx, px + size - padding - 7, py + size - padding - 3, 5, 3, wheelColor);
    },
    []
  );

  const drawTrain = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const activeDir = nextDirection || direction;

      train.forEach((segment, index) => {
        if (index === 0) {
          drawTrainHead(ctx, segment, activeDir);
        } else {
          drawTrainBody(ctx, segment, index);
        }
      });
    },
    [train, direction, nextDirection, drawTrainHead, drawTrainBody]
  );

  const drawStation = useCallback(
    (ctx: CanvasRenderingContext2D, station: PassengerStation) => {
      const px = station.x * CELL_SIZE;
      const py = station.y * CELL_SIZE;
      const size = CELL_SIZE;
      const padding = 4;

      const colors = getStationColors(station.type);

      drawPixelRect(ctx, px + padding, py + padding, size - padding * 2, size - padding * 2, colors.main);
      drawPixelRect(ctx, px + padding, py + size - padding - 4, size - padding * 2, 4, colors.dark);

      const cx = px + size / 2;
      const cy = py + size / 2 - 2;
      drawPassengerIcon(ctx, station.type, cx, cy);

      if (station.type === PassengerType.URGENT && station.ticksRemaining >= 0) {
        drawCountdownIndicator(ctx, px, py, size, station.ticksRemaining);
      }
    },
    []
  );

  const drawSmokeParticles = useCallback(
    (ctx: CanvasRenderingContext2D, particles: SmokeParticle[]) => {
      particles.forEach((particle) => {
        const px = particle.x * CELL_SIZE - (particle.size * CELL_SIZE) / 2;
        const py = particle.y * CELL_SIZE - (particle.size * CELL_SIZE) / 2;
        const size = particle.size * CELL_SIZE;

        ctx.globalAlpha = particle.opacity;
        drawPixelRect(ctx, px, py, size, size, COLORS.SMOKE);
        ctx.globalAlpha = 1;
      });
    },
    []
  );

  const drawIdleHint = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = COLORS.TEXT;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = (GRID_SIZE * CELL_SIZE) / 2;
    const centerY = (GRID_SIZE * CELL_SIZE) / 2;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    drawPixelRect(ctx, centerX - 200, centerY - 50, 400, 100, 'rgba(0, 0, 0, 0.7)');

    ctx.fillStyle = COLORS.TEXT;
    ctx.fillText('PRESS ANY ARROW KEY', centerX, centerY - 10);
    ctx.fillText('OR WASD TO START', centerX, centerY + 20);
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    updateLocalSmoke();

    drawBackground(ctx);

    if (station) {
      drawStation(ctx, station);
    }

    drawSmokeParticles(ctx, localSmokeRef.current);
    drawTrain(ctx);

    if (status === GameStatus.IDLE) {
      drawIdleHint(ctx);
    }

    animationFrameRef.current = requestAnimationFrame(render);
  }, [
    canvasRef,
    drawBackground,
    drawStation,
    drawSmokeParticles,
    drawTrain,
    drawIdleHint,
    updateLocalSmoke,
    station,
    status,
  ]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  return null;
};
