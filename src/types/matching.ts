export type Word = {
  id: number;
  en: string;
  he: string;
  rus: string;
};

export type CardType = "en" | "he" | "ru" | "rus" | "wrong" | "disappear" | "empty" | "replacing";

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