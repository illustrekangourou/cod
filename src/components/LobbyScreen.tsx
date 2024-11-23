import React from 'react';
import { Users } from 'lucide-react';

interface LobbyScreenProps {
  onCreateGame: () => void;
  onJoinGame: (gameId: string) => void;
  error: string | null;
}

export default function LobbyScreen({ onCreateGame, onJoinGame, error }: LobbyScreenProps) {
  const [gameId, setGameId] = React.useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <div className="flex items-center justify-center mb-6">
          <Users className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Chess of Doom - Multiplayer
        </h1>
        
        <div className="space-y-4">
          <button
            onClick={onCreateGame}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create New Game
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or join existing game</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <input
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="Enter Game ID"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => onJoinGame(gameId)}
              disabled={!gameId}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              Join Game
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}