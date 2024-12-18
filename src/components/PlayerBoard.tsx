import React from 'react';
import Tile from './Tile';
import Piece from './Piece';
import { type Position, type PlayerState } from '../types';
import { BOARD_CONFIG } from '#src/config.tsx';

interface PlayerBoardProps {
  player: number;
  state: PlayerState;
  isCurrentPlayer: boolean;
  selectedMove: Position | null;
  selectedDestroy: Position | null;
  onTileClick: (x: number, y: number) => void;
  showMovePreview: boolean;
  previousPosition?: Position;
}

const positionToKey = (pos: Position): string => `${pos.x},${pos.y}`;

const isValidMove = (from: Position, to: Position): boolean => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return dx <= 1 && dy <= 1 && (dx === 1 || dy === 1 || (dx === 0 && dy === 0));
};

export default function PlayerBoard({
  player,
  state,
  isCurrentPlayer,
  selectedMove,
  selectedDestroy,
  onTileClick,
  showMovePreview,
  previousPosition
}: PlayerBoardProps) {
  return (
    <div className="flex flex-col items-center">
      <h2 className={`text-xl font-bold mb-2 ${isCurrentPlayer ? 'text-blue-600' : 'text-gray-600'}`}>
        Player {player + 1}'s Board
      </h2>
      <div className="bg-white p-4 rounded-xl shadow-2xl">
        <div className="grid grid-cols-8 gap-0 border-4 border-gray-800 rounded-lg overflow-hidden">
          {Array.from({ length: BOARD_CONFIG.length }, (_, y) => (
            <React.Fragment key={y}>
              {Array.from({ length: BOARD_CONFIG.width }, (_, x) => {
                const pos = { x, y };
                const posKey = positionToKey(pos);
                const hasPiece = state.position.x === x && state.position.y === y;
                const hasPreviousPiece = previousPosition && previousPosition.x === x && previousPosition.y === y;
                const isSelectedMove = selectedMove?.x === x && selectedMove?.y === y;
                const isSelectedDestroy = selectedDestroy?.x === x && selectedDestroy?.y === y;
                const willMoveTo = showMovePreview && selectedMove?.x === x && selectedMove?.y === y;
                const isDestroyed = state.destroyedTiles.includes(posKey);

                return (
                  <Tile
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    isDestroyed={isDestroyed}
                    hasPiece={hasPiece}
                    isSelectedMove={isSelectedMove}
                    isSelectedDestroy={isSelectedDestroy}
                    isValidMove={isCurrentPlayer && !showMovePreview && isValidMove(state.position, pos)}
                    willMoveTo={willMoveTo}
                    onClick={() => onTileClick(x, y)}
                  >
                    {hasPiece && <Piece player={player} />}
                    {hasPreviousPiece && showMovePreview && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`w-8 h-8 rounded-full border-2 ${player === 0 ? 'border-blue-400' : 'border-red-400'} opacity-50`} />
                      </div>
                    )}
                  </Tile>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}