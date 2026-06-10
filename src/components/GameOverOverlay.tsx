import { useGameStore } from '@/store/gameStore';
import { useGameEngine } from '@/hooks/useGameEngine';
import { GameStatus, PassengerType } from '@/types/game';
import { COLORS, PASSENGER_SCORES } from '@/constants/game';

const GameOverOverlay = () => {
  const status = useGameStore((state) => state.status);
  const score = useGameStore((state) => state.score);
  const highScore = useGameStore((state) => state.highScore);
  const passengerStats = useGameStore((state) => state.passengerStats);
  const { startGame } = useGameEngine();

  if (status !== GameStatus.GAME_OVER) return null;

  const isNewHighScore = score >= highScore && score > 0;

  const passengerTypes = [
    {
      type: PassengerType.NORMAL,
      name: '普通乘客',
      color: COLORS.STATION_NORMAL,
    },
    {
      type: PassengerType.URGENT,
      name: '急客',
      color: COLORS.STATION_URGENT,
    },
    {
      type: PassengerType.FAT,
      name: '胖客',
      color: COLORS.STATION_FAT,
    },
  ];

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center rounded-lg z-10 overflow-auto">
      <div className="text-center p-8">
        <h2 className="text-3xl text-red-500 font-pixel mb-6">GAME OVER</h2>

        {isNewHighScore && (
          <div className="text-yellow-400 text-lg font-pixel mb-4 animate-bounce">
            NEW HIGH SCORE!
          </div>
        )}

        <div className="mb-6 space-y-3">
          <div>
            <span className="text-amber-400 text-sm font-pixel">SCORE: </span>
            <span className="text-white text-xl font-pixel">{score}</span>
          </div>
          <div>
            <span className="text-amber-400 text-sm font-pixel">HIGH SCORE: </span>
            <span className="text-yellow-400 text-xl font-pixel">{highScore}</span>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-900 bg-opacity-60 rounded-lg">
          <h3 className="text-amber-400 text-sm font-pixel mb-4">接客统计</h3>
          <div className="space-y-2">
            {passengerTypes.map(({ type, name, color }) => {
              const count = passengerStats[type];
              const typeScore = count * PASSENGER_SCORES[type];
              return (
                <div key={type} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-300 text-xs font-pixel">{name}:</span>
                  </div>
                  <span className="text-white text-xs font-pixel">
                    {count} 人 (+{typeScore}分)
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 text-xs font-pixel">总计:</span>
              <span className="text-white text-sm font-pixel">
                {passengerStats[PassengerType.NORMAL] +
                  passengerStats[PassengerType.URGENT] +
                  passengerStats[PassengerType.FAT]}{' '}
                人
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => startGame()}
          className="bg-amber-600 hover:bg-amber-500 text-white font-pixel py-3 px-8 rounded-lg border-b-4 border-amber-800 hover:border-amber-700 active:border-b-0 active:mt-1 transition-all"
        >
          PLAY AGAIN
        </button>

        <p className="text-amber-300 text-xs font-pixel mt-4">or press SPACE</p>
      </div>
    </div>
  );
};

export default GameOverOverlay;
