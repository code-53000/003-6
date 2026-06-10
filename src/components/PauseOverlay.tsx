import { useGameStore } from '@/store/gameStore';
import { GameStatus } from '@/types/game';

const PauseOverlay = () => {
  const status = useGameStore((state) => state.status);

  if (status !== GameStatus.PAUSED) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-lg z-10">
      <div className="text-center">
        <h2 className="text-4xl text-amber-400 font-pixel mb-6 animate-pulse">PAUSED</h2>
        <p className="text-amber-200 text-sm font-pixel">Press P to continue</p>
      </div>
    </div>
  );
};

export default PauseOverlay;
