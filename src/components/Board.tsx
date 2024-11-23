import React from 'react';
import PlayerBoard from './PlayerBoard';
import GameStatus from './GameStatus';
import { type Position, type GameState, type PlayerTurn } from '../types';
import { Socket } from 'socket.io-client';

interface BoardProps {
  socket: Socket;
  gameId: string;
  playerNumber: number;
}

const positionToKey = (pos: Position): string => `${pos.x},${pos.y}`;

const isValidMove = (from: Position, to: Position): boolean => {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  return dx <= 1 && dy <= 1 && (dx === 1 || dy === 1 || (dx === 0 && dy === 0));
};

const initialPlayerTurn: PlayerTurn = {
  selectedMove: null,
  selectedDestroy: null,
  validated: false,
};

const createInitialGameState = (): GameState => ({
  players: [
    { position: { x: 4, y: 4 }, destroyedTiles: [], lives: 3 },
    { position: { x: 4, y: 4 }, destroyedTiles: [], lives: 3 }
  ],
  currentTurns: [{ ...initialPlayerTurn }, { ...initialPlayerTurn }],
  gameOver: false
});

export default function Board({ socket, gameId, playerNumber }: BoardProps) {
  const [gameState, setGameState] = React.useState<GameState>(createInitialGameState());
  const [showResults, setShowResults] = React.useState(false);
  const [previewState, setPreviewState] = React.useState<GameState | null>(null);
  const [previousPositions, setPreviousPositions] = React.useState<[Position, Position]>([
    { x: 4, y: 4 },
    { x: 4, y: 4 }
  ]);
  const [turnNumber, setTurnNumber] = React.useState(1);
  const [waitingForOpponent, setWaitingForOpponent] = React.useState(false);
  const [opponentDisconnected, setOpponentDisconnected] = React.useState(false);

  React.useEffect(() => {
    socket.on('gameUpdate', ({ gameState: newGameState, currentTurns }) => {
      setGameState(prev => ({
        ...prev,
        ...newGameState,
        currentTurns
      }));
      setWaitingForOpponent(false);
    });

    socket.on('playerDisconnected', () => {
      setOpponentDisconnected(true);
    });

    return () => {
      socket.off('gameUpdate');
      socket.off('playerDisconnected');
    };
  }, [socket]);

  const handleTileClick = (boardIndex: number, x: number, y: number) => {
    if (gameState.gameOver || waitingForOpponent || opponentDisconnected) return;
    if (gameState.currentTurns[playerNumber].validated) return;
    
    const clickedPos = { x, y };
    const otherPlayer = playerNumber === 0 ? 1 : 0;
    
    if (boardIndex === playerNumber) {
      if (isValidMove(gameState.players[playerNumber].position, clickedPos)) {
        const newGameState = {
          ...gameState,
          currentTurns: gameState.currentTurns.map((turn, i) => 
            i === playerNumber 
              ? { ...turn, selectedMove: clickedPos }
              : turn
          ) as [PlayerTurn, PlayerTurn]
        };
        setGameState(newGameState);
        socket.emit('move', { gameState: newGameState, currentTurns: newGameState.currentTurns });
      }
    } else {
      const posKey = positionToKey(clickedPos);
      if (!gameState.players[otherPlayer].destroyedTiles.includes(posKey)) {
        const newGameState = {
          ...gameState,
          currentTurns: gameState.currentTurns.map((turn, i) => 
            i === playerNumber 
              ? { ...turn, selectedDestroy: clickedPos }
              : turn
          ) as [PlayerTurn, PlayerTurn]
        };
        setGameState(newGameState);
        socket.emit('move', { gameState: newGameState, currentTurns: newGameState.currentTurns });
      }
    }
  };

  const handleValidateMove = () => {
    const newGameState = {
      ...gameState,
      currentTurns: gameState.currentTurns.map((turn, i) => 
        i === playerNumber 
          ? { ...turn, validated: true }
          : turn
      ) as [PlayerTurn, PlayerTurn]
    };
    setGameState(newGameState);
    socket.emit('move', { gameState: newGameState, currentTurns: newGameState.currentTurns });
    setWaitingForOpponent(true);

    if (gameState.currentTurns[playerNumber === 0 ? 1 : 0].validated) {
      setPreviousPositions([
        gameState.players[0].position,
        gameState.players[1].position
      ]);
      const previewState = calculatePreviewState(gameState);
      setPreviewState(previewState);
      setShowResults(true);
    }
  };

  const calculatePreviewState = (currentState: GameState): GameState => {
    const newPlayers = currentState.players.map(player => ({
      ...player,
      destroyedTiles: [...player.destroyedTiles]
    })) as [typeof currentState.players[0], typeof currentState.players[1]];
    
    [0, 1].forEach(playerIndex => {
      const turn = currentState.currentTurns[playerIndex];
      const otherIndex = playerIndex === 0 ? 1 : 0;
      
      if (turn.selectedDestroy) {
        newPlayers[otherIndex].destroyedTiles.push(positionToKey(turn.selectedDestroy));
      }
    });

    [0, 1].forEach(playerIndex => {
      const turn = currentState.currentTurns[playerIndex];
      
      if (turn.selectedMove && newPlayers[playerIndex].destroyedTiles.includes(
        positionToKey(turn.selectedMove)
      )) {
        newPlayers[playerIndex].lives -= 1;
      }
      if (turn.selectedMove) {
        newPlayers[playerIndex].position = turn.selectedMove;
      }
    });

    return {
      ...currentState,
      players: newPlayers,
    };
  };

  const handleContinue = () => {
    if (!previewState) return;

    const newGameState = {
      players: previewState.players,
      currentTurns: [{ ...initialPlayerTurn }, { ...initialPlayerTurn }],
      gameOver: previewState.players.some(p => p.lives <= 0)
    };

    setGameState(newGameState);
    socket.emit('move', { gameState: newGameState, currentTurns: newGameState.currentTurns });
    setPreviewState(null);
    setShowResults(false);
    setTurnNumber(prev => prev + 1);
  };

  const canValidate = () => {
    return gameState.currentTurns[playerNumber].selectedMove !== null &&
           gameState.currentTurns[playerNumber].selectedDestroy !== null;
  };

  const getDisplayState = () => {
    if (showResults && previewState) {
      return previewState;
    }
    return gameState;
  };

  const displayState = getDisplayState();

  if (opponentDisconnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Opponent Disconnected</h2>
          <p className="text-gray-700 mb-4">Your opponent has left the game.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8">
      <div className="bg-white px-4 py-2 rounded-lg shadow-md mb-4">
        <p className="text-gray-700">Game ID: <span className="font-mono font-bold">{gameId}</span></p>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-4">Chess of Doom - Multiplayer</h1>
      
      <div className="text-lg font-semibold text-gray-700 mb-4">
        Turn {turnNumber}
      </div>
      
      {waitingForOpponent && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-md mb-4">
          Waiting for opponent...
        </div>
      )}
      
      <GameStatus 
        players={displayState.players}
        currentTurns={displayState.currentTurns}
        currentPlayer={playerNumber}
        gameOver={displayState.gameOver}
        showResults={showResults}
        onValidate={canValidate() ? handleValidateMove : undefined}
        onContinue={handleContinue}
        onReset={() => window.location.reload()}
      />

      <div className="flex gap-8 mt-4">
        <PlayerBoard
          player={0}
          state={displayState.players[0]}
          isCurrentPlayer={playerNumber === 0}
          selectedMove={playerNumber === 0 ? gameState.currentTurns[0].selectedMove : null}
          selectedDestroy={playerNumber === 1 ? gameState.currentTurns[1].selectedDestroy : null}
          onTileClick={(x, y) => handleTileClick(0, x, y)}
          showMovePreview={showResults}
          previousPosition={showResults ? previousPositions[0] : undefined}
        />
        <PlayerBoard
          player={1}
          state={displayState.players[1]}
          isCurrentPlayer={playerNumber === 1}
          selectedMove={playerNumber === 1 ? gameState.currentTurns[1].selectedMove : null}
          selectedDestroy={playerNumber === 0 ? gameState.currentTurns[0].selectedDestroy : null}
          onTileClick={(x, y) => handleTileClick(1, x, y)}
          showMovePreview={showResults}
          previousPosition={showResults ? previousPositions[1] : undefined}
        />
      </div>

      <div className="mt-8 text-gray-700 space-y-2 text-center">
        <p className="font-semibold">How to play:</p>
        <p>1. Share your Game ID with a friend to let them join</p>
        <p>2. Select a tile on your board to move your piece</p>
        <p>3. Select a tile on your opponent's board to destroy</p>
        <p>4. Validate your turn when both selections are made</p>
        <p>5. Wait for your opponent to complete their turn</p>
        <p>6. After both players complete their turns, see the results</p>
        <p>Warning: Moving to a destroyed tile costs 1 life!</p>
      </div>
    </div>
  );
}