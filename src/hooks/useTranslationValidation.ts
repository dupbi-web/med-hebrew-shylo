import { useMemo } from 'react';

// Medical Hebrew synonyms mapping
const HEBREW_SYNONYMS: Record<string, string[]> = {
  'מטופל': ['חולה', 'פציינט'],
  'חולה': ['מטופל', 'פציינט'],
  'כאב': ['כאבים', 'מכאוב'],
  'חום': ['טמפרטורה', 'קדחת'],
  'בדיקה': ['בדיקות', 'אבחון'],
  'תרופה': ['תרופות', 'טיפול'],
  'רופא': ['דוקטור', 'מטפל'],
  'בית חולים': ['בי"ח', 'מרכז רפואי'],
  'לב': ['לבבי', 'קרדיאלי'],
  'דם': ['דמי'],
  'ראש': ['גולגולת'],
  'בטן': ['בטנית', 'ביטנית'],
};

export interface CharacterValidation {
  char: string;
  status: 'correct' | 'incorrect' | 'extra' | 'pending';
  index: number;
}

export interface WordValidation {
  word: string;
  status: 'correct' | 'synonym' | 'incorrect' | 'missing';
  matchedWith?: string;
}

export interface ValidationResult {
  characterValidations: CharacterValidation[];
  wordValidations: WordValidation[];
  accuracy: number;
  wordAccuracy: number;
  isComplete: boolean;
  missingKeywords: string[];
}

// Normalize Hebrew text (remove niqqud, normalize final letters)
const normalizeHebrew = (text: string): string => {
  return text
    .replace(/[\u0591-\u05C7]/g, '') // Remove Hebrew diacritical marks
    .replace(/ך/g, 'כ')
    .replace(/ם/g, 'מ')
    .replace(/ן/g, 'נ')
    .replace(/ף/g, 'פ')
    .replace(/ץ/g, 'צ')
    .toLowerCase()
    .trim();
};

// Check if two words are synonyms
const areSynonyms = (word1: string, word2: string): boolean => {
  const normalized1 = normalizeHebrew(word1);
  const normalized2 = normalizeHebrew(word2);
  
  if (normalized1 === normalized2) return true;
  
  const synonyms1 = HEBREW_SYNONYMS[word1] || [];
  const synonyms2 = HEBREW_SYNONYMS[word2] || [];
  
  return synonyms1.some(s => normalizeHebrew(s) === normalized2) ||
         synonyms2.some(s => normalizeHebrew(s) === normalized1);
};

// Extract words from sentence
const extractWords = (sentence: string): string[] => {
  return sentence
    .split(/[\s,\.!?\-:]+/)
    .filter(w => w.length > 0)
    .map(w => w.trim());
};

export const useTranslationValidation = (
  userInput: string,
  correctAnswer: string
): ValidationResult => {
  return useMemo(() => {
    const userChars = userInput.split('');
    const correctChars = correctAnswer.split('');
    
    // Character-level validation
    const characterValidations: CharacterValidation[] = userChars.map((char, index) => {
      if (index >= correctChars.length) {
        return { char, status: 'extra', index };
      }
      
      const normalizedUser = normalizeHebrew(char);
      const normalizedCorrect = normalizeHebrew(correctChars[index]);
      
      // Allow spaces to match spaces, or consider them flexible
      if (char === ' ' && correctChars[index] === ' ') {
        return { char, status: 'correct', index };
      }
      
      if (normalizedUser === normalizedCorrect) {
        return { char, status: 'correct', index };
      }
      
      return { char, status: 'incorrect', index };
    });
    
    // Word-level validation
    const userWords = extractWords(userInput);
    const correctWords = extractWords(correctAnswer);
    const usedCorrectIndices = new Set<number>();
    
    const wordValidations: WordValidation[] = userWords.map(userWord => {
      // Exact match
      const exactIndex = correctWords.findIndex((cw, i) => 
        !usedCorrectIndices.has(i) && normalizeHebrew(cw) === normalizeHebrew(userWord)
      );
      
      if (exactIndex !== -1) {
        usedCorrectIndices.add(exactIndex);
        return { word: userWord, status: 'correct', matchedWith: correctWords[exactIndex] };
      }
      
      // Synonym match
      const synonymIndex = correctWords.findIndex((cw, i) => 
        !usedCorrectIndices.has(i) && areSynonyms(userWord, cw)
      );
      
      if (synonymIndex !== -1) {
        usedCorrectIndices.add(synonymIndex);
        return { word: userWord, status: 'synonym', matchedWith: correctWords[synonymIndex] };
      }
      
      return { word: userWord, status: 'incorrect' };
    });
    
    // Find missing words (medical keywords)
    const missingKeywords = correctWords.filter((cw, i) => 
      !usedCorrectIndices.has(i) && cw.length > 2
    );
    
    // Calculate accuracy
    const correctCount = characterValidations.filter(c => c.status === 'correct').length;
    const totalRelevant = Math.max(userChars.length, correctChars.length);
    const accuracy = totalRelevant > 0 ? Math.round((correctCount / totalRelevant) * 100) : 0;
    
    const correctWordCount = wordValidations.filter(w => 
      w.status === 'correct' || w.status === 'synonym'
    ).length;
    const wordAccuracy = correctWords.length > 0 
      ? Math.round((correctWordCount / correctWords.length) * 100) 
      : 0;
    
    const isComplete = userInput.trim().length >= correctAnswer.trim().length * 0.8;
    
    return {
      characterValidations,
      wordValidations,
      accuracy,
      wordAccuracy,
      isComplete,
      missingKeywords,
    };
  }, [userInput, correctAnswer]);
};
