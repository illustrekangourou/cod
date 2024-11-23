import React from 'react';
import { type Position } from '../types';

interface TileProps {
  x: number;
  y: number;
  isDestroyed: boolean;
  hasPiece: boolean;
  isSelectedMove: boolean;
  isSelectedDestroy: boolean;
  isValidMove: boolean;
  willMoveTo: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export default function Tile({
  x,
  y,
  isDestroyed,
  hasPiece,
  isSelectedMove,
  isSelectedDestroy,
  isValidMove,
  willMoveTo,
  onClick,
  children
}: TileProps) {
  const isBlack = (x + y) % 2 === 1;

  return (
    <div
      onClick={onClick}
      className={`
        w-16 h-16 flex items-center justify-center relative
        ${isBlack ? 'bg-gray-700' : 'bg-gray-200'}
        ${isSelectedMove ? 'ring-4 ring-blue-400' : ''}
        ${isSelectedDestroy ? 'ring-4 ring-red-400' : ''}
        ${isValidMove && !isDestroyed ? 'ring-2 ring-green-400' : ''}
        ${isDestroyed ? 'bg-red-900' : ''}
        ${!isDestroyed ? 'hover:bg-opacity-80 cursor-pointer' : ''}
        ${willMoveTo ? 'ring-4 ring-yellow-400' : ''}
        transition-all duration-200
      `}
    >
      {children}
      {isDestroyed && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <span className="text-red-500 text-4xl">×</span>
        </div>
      )}
    </div>
  );
}