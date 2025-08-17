import { useState, useEffect, useRef, useCallback } from "react";
import { getMedicalTerms } from "@/cache/medicalTermsCache";
import { Word, Card, GameState, GameStats } from "@/types/matching";

const TOTAL_WORDS = 64;
const GAME_DURATION = 180; // 3 minutes in seconds

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getVisibleCardCount = (width: number) => {
  if (width >= 1024) return 16; // desktop 4x4
  if (width >= 640) return 12;  // tablet 3x4
  return 8;                     // phone 2x4
};

export const useMatchingGame = () => {
  // Game state
  const [gameState, setGameState] = useState<GameState>("menu");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Word management
  const [wordPool, setWordPool] = useState<Word[]>([]);
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
  const [currentCards, setCurrentCards] = useState<Card[]>([]);
  
  // Game mechanics
  const [firstChoice, setFirstChoice] = useState<Card | null>(null);
  const [secondChoice, setSecondChoice] = useState<Card | null>(null);
  
  // Game statistics
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    attempts: 0,
    wordsMatched: 0,
    timeElapsed: 0,
    accuracy: 0
  });
  
  // Timer
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const timerRef = useRef<number | null>(null);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Timer management
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setGameState("finished");
            return 0;
          }
          return prev - 1;
        });
        setStats(prev => ({ ...prev, timeElapsed: prev.timeElapsed + 1 }));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // Load word pool
  const loadWordPool = useCallback(async () => {
    try {
      const allWords = await getMedicalTerms();
      const filtered = allWords.filter((w: any) => w.en && w.he && w.id);
      
      if (filtered.length < TOTAL_WORDS) {
        console.warn(`Only ${filtered.length} words available, need ${TOTAL_WORDS}`);
      }
      
      const shuffled = shuffleArray(filtered).slice(0, TOTAL_WORDS);
      setWordPool(shuffled);
      return shuffled;
    } catch (error) {
      console.error("Failed to load word pool:", error);
      return [];
    }
  }, []);

  // Get random unused words
  const getRandomUnusedWords = useCallback((count: number): Word[] => {
    const availableWords = wordPool.filter(word => !usedWords.has(word.id));
    if (availableWords.length < count) {
      return availableWords; // Return whatever is available
    }
    return shuffleArray(availableWords).slice(0, count);
  }, [wordPool, usedWords]);

  // Create cards from words
  const createCardsFromWords = useCallback((words: Word[]): Card[] => {
    const cards: Card[] = words.flatMap((word) => [
      { id: word.id * 2, content: word.en, wordId: word.id, matched: false, type: "en" as const },
      { id: word.id * 2 + 1, content: word.he, wordId: word.id, matched: false, type: "he" as const },
    ]);
    return shuffleArray(cards);
  }, []);

  // Initialize game
  const initializeGame = useCallback(async () => {
    const pool = await loadWordPool();
    if (pool.length === 0) return;

    const visibleCount = getVisibleCardCount(windowWidth);
    const pairsNeeded = Math.floor(visibleCount / 2);
    const initialWords = getRandomUnusedWords(pairsNeeded);
    
    if (initialWords.length === 0) return;

    const cards = createCardsFromWords(initialWords);
    setCurrentCards(cards);
    setUsedWords(new Set(initialWords.map(w => w.id)));
    
    // Reset game state
    setStats({
      score: 0,
      attempts: 0,
      wordsMatched: 0,
      timeElapsed: 0,
      accuracy: 0
    });
    setTimeRemaining(GAME_DURATION);
    setFirstChoice(null);
    setSecondChoice(null);
    setGameState("playing");
  }, [windowWidth, loadWordPool, getRandomUnusedWords, createCardsFromWords]);

  // Replace matched cards with new ones
  const replaceMatchedCards = useCallback((matchedWordId: number) => {
    const newWords = getRandomUnusedWords(2); // Get 2 new word pairs = 4 cards
    
    if (newWords.length > 0) {
      const newCards = createCardsFromWords(newWords);
      
      setCurrentCards(prev => {
        const updated = prev.map(card => {
          if (card.wordId === matchedWordId) {
            return { ...card, type: "disappear" as const };
          }
          return card;
        });
        
        // Add new cards with "replacing" animation
        const withNewCards = [
          ...updated,
          ...newCards.map(card => ({ ...card, type: "replacing" as const }))
        ];
        
        return withNewCards;
      });
      
      setUsedWords(prev => new Set([...prev, ...newWords.map(w => w.id)]));
      
      // After animation, normalize the cards
      setTimeout(() => {
        setCurrentCards(prev => {
          const filtered = prev.filter(card => card.type !== "disappear");
          return filtered.map(card => ({
            ...card,
            type: card.type === "replacing" ? (card.content === card.content ? "en" : "he") : card.type
          })).map(card => {
            // Determine correct type based on content
            const word = [...wordPool, ...newWords].find(w => w.id === card.wordId);
            if (word) {
              return {
                ...card,
                type: card.content === word.en ? "en" as const : "he" as const
              };
            }
            return card;
          });
        });
      }, 300);
    } else {
      // No more words available, just remove matched cards
      setTimeout(() => {
        setCurrentCards(prev => 
          prev.map(card => 
            card.wordId === matchedWordId 
              ? { ...card, content: "", type: "empty" as const }
              : card
          )
        );
      }, 300);
    }
  }, [getRandomUnusedWords, createCardsFromWords, wordPool]);

  // Handle card click
  const handleCardClick = useCallback((card: Card) => {
    if (
      card.matched ||
      card.type === "disappear" ||
      card.type === "empty" ||
      card.type === "replacing" ||
      (firstChoice && firstChoice.id === card.id) ||
      secondChoice
    ) {
      return;
    }

    if (!firstChoice) {
      setFirstChoice(card);
    } else {
      setSecondChoice(card);
      
      setStats(prev => {
        const newAttempts = prev.attempts + 1;
        const newAccuracy = newAttempts > 0 ? Math.round((prev.wordsMatched / newAttempts) * 100) : 0;
        return {
          ...prev,
          attempts: newAttempts,
          accuracy: newAccuracy
        };
      });

      // Check for match
      if (firstChoice.wordId === card.wordId && firstChoice.type !== card.type) {
        // Correct match
        setCurrentCards(prev =>
          prev.map(c =>
            c.wordId === card.wordId ? { ...c, matched: true } : c
          )
        );
        
        setStats(prev => {
          const newWordsMatched = prev.wordsMatched + 1;
          const newScore = prev.score + 10;
          const newAccuracy = prev.attempts > 0 ? Math.round((newWordsMatched / prev.attempts) * 100) : 0;
          return {
            ...prev,
            score: newScore,
            wordsMatched: newWordsMatched,
            accuracy: newAccuracy
          };
        });

        // Replace matched cards after a delay
        setTimeout(() => {
          replaceMatchedCards(card.wordId);
          setFirstChoice(null);
          setSecondChoice(null);
        }, 500);
      } else {
        // Wrong match
        setCurrentCards(prev =>
          prev.map(c =>
            (c.id === firstChoice.id || c.id === card.id)
              ? { ...c, type: "wrong" as const }
              : c
          )
        );

        setTimeout(() => {
          setCurrentCards(prev =>
            prev.map(c =>
              c.type === "wrong"
                ? { ...c, type: c.content === wordPool.find(w => w.id === c.wordId)?.en ? "en" as const : "he" as const }
                : c
            )
          );
          setFirstChoice(null);
          setSecondChoice(null);
        }, 1000);
      }
    }
  }, [firstChoice, secondChoice, replaceMatchedCards, wordPool]);

  // Check win condition
  useEffect(() => {
    if (stats.wordsMatched >= TOTAL_WORDS && gameState === "playing") {
      setGameState("finished");
    }
  }, [stats.wordsMatched, gameState]);

  // Restart game
  const restartGame = useCallback(() => {
    setGameState("menu");
    setUsedWords(new Set());
    setCurrentCards([]);
    setFirstChoice(null);
    setSecondChoice(null);
  }, []);

  return {
    gameState,
    currentCards: currentCards.slice(0, getVisibleCardCount(windowWidth)),
    firstChoice,
    secondChoice,
    stats,
    timeRemaining,
    totalWords: TOTAL_WORDS,
    windowWidth,
    initializeGame,
    handleCardClick,
    restartGame,
    gridColumns: windowWidth >= 1024 ? 4 : windowWidth >= 640 ? 3 : 2
  };
};