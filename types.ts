export interface FingerColor {
  bg: string;
  border: string;
}

export interface Finger {
  id: number;
  x: number;
  y: number;
  color: FingerColor;
  groupId: number | null;
}

export enum GameState {
  IDLE,
  DETECTING,
  CHOOSING,
  RESULT,
}

export type SelectionMode = 1 | 2 | 3 | 4;

export enum AppMode {
  CHOOSER,
  SCORER,
  SETTINGS,
}

export interface PlayerScore {
  id: number;
  name: string;
  color: FingerColor;
  scores: number[];
}

export interface AppSettings {
  defaultPlayerCount: number;
  defaultPlayerNames: string[];
  countdownDuration: number;
  agricolaCategoryDisplay: 'icons' | 'text' | 'both';
}