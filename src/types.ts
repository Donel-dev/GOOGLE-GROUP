export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  cover: string;
  lyrics?: string;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}
