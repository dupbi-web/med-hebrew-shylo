import { describe, it, expect } from 'vitest';
import { shuffleCopy, getRandomDistractors } from '@/utils/quizUtils';

describe('Quiz Utils', () => {
  describe('shuffleCopy', () => {
    it('returns a new array with same elements', () => {
      const original = [1, 2, 3, 4, 5];
      const result = shuffleCopy(original);
      
      expect(result).not.toBe(original); // Should be a new array
      expect(result.sort()).toEqual(original.sort()); // Should have same elements
    });

    it('maintains array length', () => {
      const original = [1, 2, 3, 4, 5];
      const result = shuffleCopy(original);
      
      expect(result.length).toBe(original.length);
    });

    it('handles empty array', () => {
      const original: number[] = [];
      const result = shuffleCopy(original);
      
      expect(result).toEqual([]);
    });

    it('handles single element array', () => {
      const original = [1];
      const result = shuffleCopy(original);
      
      expect(result).toEqual([1]);
    });
  });

  describe('getRandomDistractors', () => {
    const words = [
      { en: 'heart', he: 'לב', rus: 'сердце' },
      { en: 'lung', he: 'ריאה', rus: 'легкое' },
      { en: 'brain', he: 'מוח', rus: 'мозг' },
      { en: 'liver', he: 'כבד', rus: 'печень' },
      { en: 'kidney', he: 'כליה', rus: 'почка' }
    ];

    it('returns requested number of distractors', () => {
      const correct = words[0];
      const result = getRandomDistractors(words, correct, 'en', 2);
      
      expect(result.length).toBe(2);
    });

    it('excludes correct answer', () => {
      const correct = words[0];
      const result = getRandomDistractors(words, correct, 'en', 4);
      
      expect(result.every(word => word.en !== correct.en)).toBe(true);
    });

    it('handles different languages', () => {
      const correct = words[0];
      const resultEn = getRandomDistractors(words, correct, 'en', 2);
      const resultRus = getRandomDistractors(words, correct, 'rus', 2);
      
      expect(resultEn.every(word => word.en !== correct.en)).toBe(true);
      expect(resultRus.every(word => word.rus !== correct.rus)).toBe(true);
    });

    it('returns fewer distractors if not enough words available', () => {
      const correct = words[0];
      const result = getRandomDistractors(words, correct, 'en', 10);
      
      expect(result.length).toBe(words.length - 1); // All words except correct one
    });
  });
});