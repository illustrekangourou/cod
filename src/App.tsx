import React from 'react';
import Board from './components/Board';
import LobbyScreen from './components/LobbyScreen';
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SERVER_URL || 'http://localhost:3001');

function App() {
  const [gameId, setGameId] = React.useState<string | null>(null);
  const [playerNumber, setPlayerNumber] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    function onConnect() {
      setIsConnected(true);
      setError(null);
    }

    function onDisconnect() {
      setIsConnected(false);
      setError('Disconnected from server');
    }

    function onError(message: string) {
      setError(message);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('error', onError);
    socket.on('gameCreated', ({ gameId, playerNumber }) => {
      setGameId(gameId);
      setPlayerNumber(playerNumber);
      setError(null);
    });
    socket.on('gameJoined', ({ gameId, playerNumber }) => {
      setGameId(gameId);
      setPlayerNumber(playerNumber);
      setError(null);
    });

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('error', onError);
      socket.off('gameCreated');
      socket.off('gameJoined');
    };
  }, []);

  const handleCreateGame = () => {
    socket.emit('createGame');
  };

  const handleJoinGame = (id: string) => {
    socket.emit('joinGame', id);
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <p className="text-xl text-gray-800">Connecting to server...</p>
        </div>
      </div>
    );
  }

  if (!gameId) {
    return (
      <LobbyScreen
        onCreateGame={handleCreateGame}
        onJoinGame={handleJoinGame}
        error={error}
      />
    );
  }

  return (
    <Board
      socket={socket}
      gameId={gameId}
      playerNumber={playerNumber!}
    />
  );
}

export default App;