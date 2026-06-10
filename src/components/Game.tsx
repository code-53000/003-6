import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import InfoBar from '@/components/InfoBar';
import GameCanvas from '@/components/GameCanvas';
import PauseOverlay from '@/components/PauseOverlay';
import GameOverOverlay from '@/components/GameOverOverlay';
import { CANVAS_SIZE } from '@/constants/game';

const Game = () => {
  useLocalStorage();
  useKeyboardControls();

  return (
    <div className="h-screen w-screen bg-gradient-to-b from-amber-950 to-stone-900 flex flex-col items-center justify-center gap-2 p-2 overflow-hidden">
      <h1 className="text-2xl text-amber-400 font-pixel text-center leading-tight">
        PIXEL TRAIN
      </h1>
      <p className="text-amber-600 text-xs font-pixel text-center leading-tight">
        COLLECT PASSENGERS, DON'T CRASH!
      </p>

      <InfoBar />

      <div
        className="relative flex-shrink-0"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      >
        <GameCanvas />
        <PauseOverlay />
        <GameOverOverlay />
      </div>

      <div className="text-center flex-shrink-0">
        <div className="text-amber-400 text-xs font-pixel mb-1">CONTROLS</div>
        <div className="text-amber-200 text-xs font-pixel space-y-0.5">
          <p>↑ ↓ ← → or WASD : Move Train</p>
          <p>P : Pause / Continue</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
