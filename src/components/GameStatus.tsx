import React from 'react';
import { Heart } from 'lucide-react';
import { type PlayerState, type PlayerTurn } from '../types';

interface GameStatusProps {
  players: [PlayerState, PlayerState];
  currentTurns: [PlayerTurn, PlayerTurn];
  currentPlayer: 0 | 1;
  gameOver: boolean;
  showResults: boolean;
  onValidate?: () => void;
  onReset: () => void;
}

export default function GameStatus({
  players,
  currentTurns,
  currentPlayer,
  gameOver,
  showResults,
  onValidate,
  onReset
}: GameStatusProps) {
  const getPhaseMessage = () => {
    if (gameOver) {
      const winner = players[0].lives <= 0 ? 2 : 1;
      return `Game Over! Player ${winner} wins!`;
    }

    if (showResults) {
      return "Review the results and press Continue";
    }

    const playerNum = currentPlayer + 1;
    const turn = currentTurns[currentPlayer];
    
    if (!turn.selectedMove && !turn.selectedDestroy) {
      return `Player ${playerNum}: Select where to move and which tile to destroy`;
    } else if (!turn.selectedMove) {
      return `Player ${playerNum}: Select where to move`;
    } else if (!turn.selectedDestroy) {
      return `Player ${playerNum}: Select which tile to destroy`;
    } else {
      return `Player ${playerNum}: Validate your turn`;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center gap-4">
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center">
          <span className={`font-semibold ${currentPlayer === 0 ? 'text-blue-600' : 'text-gray-600'}`}>
            Player 1 {currentTurns[0].validated && '✓'}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < players[0].lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <span className={`font-semibold ${currentPlayer === 1 ? 'text-blue-600' : 'text-gray-600'}`}>
            Player 2 {currentTurns[1].validated && '✓'}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${i < players[1].lives ? 'text-red-500 fill-red-500' : 'text-gray-300'}`}
              />
            ))}
          </div>
        </div>
      </div>
      
      <p className="text-lg font-semibold text-gray-700">{getPhaseMessage()}</p>
      
      <div className="flex gap-2">
        {!gameOver && onValidate && (
          <button
            onClick={onValidate}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            Validate Turn
          </button>
        )}
        
        {gameOver && (
          <button
            onClick={onReset}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Play Again
          </button>
        )}
      </div>
    </div>
  );
}