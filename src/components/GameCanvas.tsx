import { useRef } from 'react';
import { useGameRenderer } from '@/hooks/useGameRenderer';
import { CANVAS_SIZE } from '@/constants/game';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useGameRenderer(canvasRef);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="border-4 border-amber-900 rounded-lg shadow-2xl"
      style={{
        imageRendering: 'pixelated',
      } as React.CSSProperties}
    />
  );
};

export default GameCanvas;
