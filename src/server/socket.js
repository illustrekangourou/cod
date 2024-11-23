import { nanoid } from 'nanoid';

const games = new Map();
const playerSockets = new Map();

export function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('createGame', () => {
      try {
        const gameId = nanoid(6);
        games.set(gameId, {
          players: [socket.id],
          gameState: {
            players: [
              { position: { x: 4, y: 4 }, destroyedTiles: [], lives: 3 },
              { position: { x: 4, y: 4 }, destroyedTiles: [], lives: 3 }
            ],
            currentTurns: [{}, {}],
            turnNumber: 1
          }
        });
        playerSockets.set(socket.id, gameId);
        socket.join(gameId);
        socket.emit('gameCreated', { gameId, playerNumber: 0 });
      } catch (error) {
        console.error('Error creating game:', error);
        socket.emit('error', 'Failed to create game');
      }
    });

    socket.on('joinGame', (gameId) => {
      try {
        const game = games.get(gameId);
        if (!game) {
          socket.emit('error', 'Game not found');
          return;
        }
        if (game.players.length >= 2) {
          socket.emit('error', 'Game is full');
          return;
        }
        game.players.push(socket.id);
        playerSockets.set(socket.id, gameId);
        socket.join(gameId);
        socket.emit('gameJoined', { gameId, playerNumber: 1 });
        io.to(gameId).emit('gameStart');
      } catch (error) {
        console.error('Error joining game:', error);
        socket.emit('error', 'Failed to join game');
      }
    });

    socket.on('move', ({ gameState, currentTurns }) => {
      try {
        const gameId = playerSockets.get(socket.id);
        if (!gameId) return;
        
        const game = games.get(gameId);
        if (!game) return;

        game.gameState = {
          ...gameState,
          players: gameState.players.map(player => ({
            ...player,
            destroyedTiles: Array.isArray(player.destroyedTiles) 
              ? player.destroyedTiles 
              : Array.from(player.destroyedTiles)
          }))
        };
        game.currentTurns = currentTurns;
        
        io.to(gameId).emit('gameUpdate', { gameState: game.gameState, currentTurns });
      } catch (error) {
        console.error('Error processing move:', error);
        socket.emit('error', 'Failed to process move');
      }
    });

    socket.on('disconnect', () => {
      try {
        const gameId = playerSockets.get(socket.id);
        if (gameId) {
          const game = games.get(gameId);
          if (game) {
            io.to(gameId).emit('playerDisconnected');
            games.delete(gameId);
          }
          playerSockets.delete(socket.id);
        }
        console.log('Client disconnected:', socket.id);
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });
  });
}