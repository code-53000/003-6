import { useGameStore } from '@/store/gameStore';

const InfoBar = () => {
  const score = useGameStore((state) => state.score);
  const level = useGameStore((state) => state.level);
  const highScore = useGameStore((state) => state.highScore);

  return (
    <div className="flex gap-4 mb-6 w-full max-w-xl">
      <div className="flex-1 bg-amber-950 border-2 border-amber-800 rounded-lg p-4 text-center">
        <div className="text-amber-400 text-xs font-pixel mb-1">SCORE</div>
        <div className="text-white text-xl font-pixel">{score.toString().padStart(5, '0')}</div>
      </div>

      <div className="flex-1 bg-amber-950 border-2 border-amber-800 rounded-lg p-4 text-center">
        <div className="text-amber-400 text-xs font-pixel mb-1">LEVEL</div>
        <div className="text-white text-xl font-pixel">{level.toString().padStart(2, '0')}</div>
      </div>

      <div className="flex-1 bg-amber-950 border-2 border-amber-800 rounded-lg p-4 text-center">
        <div className="text-amber-400 text-xs font-pixel mb-1">HIGH</div>
        <div className="text-yellow-400 text-xl font-pixel">{highScore.toString().padStart(5, '0')}</div>
      </div>
    </div>
  );
};

export default InfoBar;
