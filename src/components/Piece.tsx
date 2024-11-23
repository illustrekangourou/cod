import React from 'react';
import { Crown, Sword } from 'lucide-react';

interface PieceProps {
  player: number;
}

export default function Piece({ player }: PieceProps) {
  return (
    <div className={`w-12 h-12 rounded-full ${player === 0 ? 'bg-blue-100' : 'bg-red-100'} shadow-lg flex items-center justify-center`}>
      {player === 0 ? (
        <Crown className="w-8 h-8 text-blue-600" />
      ) : (
        <Sword className="w-8 h-8 text-red-600" />
      )}
    </div>
  );
}