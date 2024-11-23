export interface Position {
  x: number;
  y: number;
}

export interface PlayerState {
  position: Position;
  destroyedTiles: string[];
  lives: number;
}

export interface PlayerTurn {
  selectedMove: Position | null;
  selectedDestroy: Position | null;
  validated: boolean;
}

export interface GameState {
  players: [PlayerState, PlayerState];
  currentTurns: [PlayerTurn, PlayerTurn];
  gameOver: boolean;
}