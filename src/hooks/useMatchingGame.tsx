
import { useState, useEffect, useRef, useCallback } from "react";
import { useMedicalTerms } from "@/hooks/queries/useMedicalTerms";
import { Word, Card, GameState, GameStats } from "@/types/matching";

const TOTAL_WORDS = 64;
const GAME_DURATION = 180; // 3 minutes

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const getVisibleCardCount = (width: number) => {
  if (width >= 1024) return 16;
  if (width >= 640) return 12;
  return 8;
};

export const useMatchingGame = (sourceLang: "en" | "rus", targetLang: "he" = "he") => {
  const [gameState, setGameState] = useState<GameState>("menu");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { data: medicalTerms = [] } = useMedicalTerms();

  const [wordPool, setWordPool] = useState<Word[]>([]);
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
  const [currentCards, setCurrentCards] = useState<Card[]>([]);

  const [firstChoice, setFirstChoice] = useState<Card | null>(null);
  const [secondChoice, setSecondChoice] = useState<Card | null>(null);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    attempts: 0,
    wordsMatched: 0,
    timeElapsed: 0,
    accuracy: 0
  });

  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = window.setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setGameState("finished");
            return 0;
          }
          return prev - 1;
        });

        setStats(prev => ({
          ...prev,
          timeElapsed: prev.timeElapsed + 1
        }));
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

  const loadWordPool = useCallback(async () => {
    try {
      const filtered = medicalTerms.filter((w) => w.rus && w.he && w.en && w.id);
      const shuffled = shuffleArray(filtered).slice(0, TOTAL_WORDS);
      setWordPool(shuffled);
      return shuffled;
    } catch (error) {
      console.error("Failed to load word pool:", error);
      return [];
    }
  }, [medicalTerms]);

  const getRandomUnusedWords = useCallback((count: number): Word[] => {
    const availableWords = wordPool.filter(word => !usedWords.has(word.id));
    return shuffleArray(availableWords).slice(0, count);
  }, [wordPool, usedWords]);
  const createCardsFromWords = useCallback((words: Word[]): Card[] => {


    return shuffleArray(
      words.flatMap(word => [
        {
          id: word.id * 2,
          content: word[sourceLang], // ✅ Fixed
          wordId: word.id,
          matched: false,
          type: sourceLang,
        },
        {
          id: word.id * 2 + 1,
          content: word[targetLang], // ✅ Already correct
          wordId: word.id,
          matched: false,
          type: targetLang,
        },
      ])
    );
  }, [sourceLang, targetLang]);


const initializeGame = useCallback(async () => {
  const pool = await loadWordPool();
  if (pool.length === 0) return;

  // Reset used words set for a fresh start
  setUsedWords(new Set());

  // Calculate how many pairs needed based on current window width
  const visibleCount = getVisibleCardCount(windowWidth);
  const pairsNeeded = Math.floor(visibleCount / 2);

  // Pick random words from the freshly loaded pool (not from state wordPool)
  const availableWords = pool.filter(word => true); // all words are unused at start
  const initialWords = shuffleArray(availableWords).slice(0, pairsNeeded);

  if (initialWords.length === 0) return;

  // Create cards from these words
  const cards = createCardsFromWords(initialWords);
  setCurrentCards(cards);
  setUsedWords(new Set(initialWords.map(w => w.id)));

  // Reset stats and time
  setStats({
    score: 0,
    attempts: 0,
    wordsMatched: 0,
    timeElapsed: 0,
    accuracy: 0,
  });
  setTimeRemaining(GAME_DURATION);
  setFirstChoice(null);
  setSecondChoice(null);
  setGameState("playing");
}, [windowWidth, loadWordPool, createCardsFromWords]);


{/*   const replaceMatchedCards = useCallback((matchedWordId: number) => {
    const newWords = getRandomUnusedWords(2);

    if (newWords.length > 0) {
      const newCards = createCardsFromWords(newWords);

      setCurrentCards(prev => {
        const updated = prev.map(card =>
          card.wordId === matchedWordId ? { ...card, type: "disappear" as const } : card
        );

        return [
          ...updated,
          ...newCards.map(card => ({ ...card, type: "replacing" as const }))
        ];
      });

      setUsedWords(prev => new Set([...prev, ...newWords.map(w => w.id)]));

      setTimeout(() => {
        setCurrentCards(prev => {
          const filtered = prev.filter(card => card.type !== "disappear");

          return filtered.map(card => {
            if (card.type === "replacing") {
              const word = [...wordPool, ...newWords].find(w => w.id === card.wordId);
              if (word) {
                return {
                  ...card,
                  type: card.content === word.en ? "en" : "he"
                };
              }
            }
            return card;
          });
        });
      }, 300);
    } else {
      // No more words to use
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
  }, [getRandomUnusedWords, createCardsFromWords, wordPool]); */}
const replaceMatchedCards = useCallback((matchedWordId: number) => {
  const newWords = getRandomUnusedWords(1);

setCurrentCards(prev => {
  const matchedIndices = prev
    .map((card, idx) => (card.wordId === matchedWordId ? idx : -1))
    .filter(idx => idx !== -1);

  if (matchedIndices.length === 0) return prev;

  // Remove matched cards
  const filtered = prev.filter(card => card.wordId !== matchedWordId);

  // Pick a random insert position in the filtered array
  const insertIndex = Math.floor(Math.random() * (filtered.length + 1));

  const newCards = createCardsFromWords(newWords);

  return [
    ...filtered.slice(0, insertIndex),
    ...newCards,
    ...filtered.slice(insertIndex),
  ];
});


  if (newWords.length > 0) {
    setUsedWords(prev => new Set([...prev, ...newWords.map(w => w.id)]));
  }
}, [getRandomUnusedWords, createCardsFromWords]);



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
        const newAccuracy = newAttempts > 0
          ? Math.round((prev.wordsMatched / newAttempts) * 100)
          : 0;
        return { ...prev, attempts: newAttempts, accuracy: newAccuracy };
      });

      if (firstChoice.wordId === card.wordId && firstChoice.type !== card.type) {
        // Correct match
        setCurrentCards(prev =>
          prev.map(c => c.wordId === card.wordId ? { ...c, matched: true } : c)
        );

        setStats(prev => {
          const newWordsMatched = prev.wordsMatched + 1;
          const newScore = prev.score + 10;
          const newAccuracy = prev.attempts > 0
            ? Math.round((newWordsMatched / prev.attempts) * 100)
            : 0;
          return { ...prev, score: newScore, wordsMatched: newWordsMatched, accuracy: newAccuracy };
        });

        setTimeout(() => {
          replaceMatchedCards(card.wordId);
          setFirstChoice(null);
          setSecondChoice(null);
        }, 500);
      } else {
        // Incorrect match
        setCurrentCards(prev =>
          prev.map(c =>
            c.id === firstChoice.id || c.id === card.id
              ? { ...c, type: "wrong" as const }
              : c
          )
        );

        setTimeout(() => {
          setCurrentCards(prev =>
            prev.map(c => {
              if (c.type === "wrong") {
                  const word = wordPool.find(w => w.id === c.wordId);
                if (word) {
                  return {
                    ...c,
                    type: c.content === word[sourceLang] ? sourceLang : targetLang
                  } as Card;
                }
              }
              return c;
            })
          );
          setFirstChoice(null);
          setSecondChoice(null);
        }, 1000);
      }
    }
  }, [firstChoice, secondChoice, replaceMatchedCards, wordPool]);

  useEffect(() => {
    if (stats.wordsMatched >= TOTAL_WORDS && gameState === "playing") {
      setGameState("finished");
    }
  }, [stats.wordsMatched, gameState]);

  const restartGame = useCallback(() => {
    setGameState("menu");
    setUsedWords(new Set());
    setCurrentCards([]);
    setFirstChoice(null);
    setSecondChoice(null);
  }, []);

  return {
    gameState,
    currentCards,  // <-- no slicing here
    firstChoice,
    secondChoice,
    stats,
    timeRemaining,
    totalWords: TOTAL_WORDS,
    windowWidth,
    initializeGame,
    handleCardClick,
    restartGame,
    gridColumns: windowWidth >= 1024 ? 4 : windowWidth >= 640 ? 3 : 2,
  };
};
