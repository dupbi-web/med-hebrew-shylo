export type Word = {
  id: number;
  en: string;
  he: string;
};

export type CardType = "en" | "he" | "wrong" | "disappear" | "empty" | "replacing";

export type Card = {
  id: number;
  content: string;
  wordId: number;
  matched: boolean;
  type: CardType;
};

export type GameState = "menu" | "playing" | "finished";

export type GameStats = {
  score: number;
  attempts: number;
  wordsMatched: number;
  timeElapsed: number;
  accuracy: number;
};