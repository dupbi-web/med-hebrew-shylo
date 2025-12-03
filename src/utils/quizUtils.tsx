// src/utils/quizUtils.ts

export type Word = { en: string; he: string; rus: string; category?: string | null };
export type Lang = "en" | "rus";

/**
 * Returns a shuffled copy of the given array.
 */
export function shuffleCopy<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Gets a given number of random distractors (wrong answers) excluding the correct one.
 */
export function getRandomDistractors(
  words: Word[],
  correct: Word,
  lang: Lang,
  count: number
) {
  const filtered = words.filter((w) => w[lang] !== correct[lang]);
  return shuffleCopy(filtered).slice(0, count);
}
