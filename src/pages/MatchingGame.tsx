import { useEffect, useState, useRef } from "react";
import { getMedicalTerms } from "@/cache/medicalTermsCache"; // <-- Use the cache!
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

type Word = {
  id: number;
  en: string;
  he: string;
};

type Card = {
  id: number;
  content: string;
  wordId: number;
  matched: boolean;
  type: "en" | "he" | "wrong" | "disappear" | "empty";
};

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

const getGridColumns = (width: number) => {
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  return 2;
};

const MatchingGame = () => {
  const [allWords, setAllWords] = useState<Word[]>([]);
  const [usedWords, setUsedWords] = useState<Set<number>>(new Set());
  const [currentPair, setCurrentPair] = useState<Word[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [firstChoice, setFirstChoice] = useState<Card | null>(null);
  const [secondChoice, setSecondChoice] = useState<Card | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [wordsCompleted, setWordsCompleted] = useState(0);
  const [timer, setTimer] = useState(0);

  const intervalRef = useRef<number | null>(null);

  // Load all words on component mount
  useEffect(() => {
    initializeGame();
  }, []);

  // Check for game completion
  useEffect(() => {
    if (wordsCompleted >= 64) {
      setGameOver(true);
      stopTimer();
    }
  }, [wordsCompleted]);

  const initializeGame = async () => {
    const words = await getMedicalTerms();
    const filtered = words.filter((w: any) => w.en && w.he && w.id).slice(0, 64);
    setAllWords(filtered);
    setUsedWords(new Set());
    setWordsCompleted(0);
    setScore(0);
    setAttempts(0);
    setGameOver(false);
    loadNewPair(filtered, new Set());
    startTimer();
  };

  const loadNewPair = (wordPool: Word[], usedSet: Set<number>) => {
    const availableWords = wordPool.filter(w => !usedSet.has(w.id));
    
    if (availableWords.length < 2) {
      setGameOver(true);
      stopTimer();
      return;
    }

    const shuffled = shuffleArray(availableWords);
    const newPair = shuffled.slice(0, 2);
    setCurrentPair(newPair);

    const newUsedSet = new Set(usedSet);
    newPair.forEach(word => newUsedSet.add(word.id));
    setUsedWords(newUsedSet);

    const cardData: Card[] = newPair.flatMap((w) => [
      { id: w.id * 2, content: w.en, wordId: w.id, matched: false, type: "en" },
      { id: w.id * 2 + 1, content: w.he, wordId: w.id, matched: false, type: "he" },
    ]);

    setCards(shuffleArray(cardData));
    setFirstChoice(null);
    setSecondChoice(null);
  };

  const startTimer = () => {
    setTimer(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      setTimer((t) => t + 10);
    }, 10);
  };

  const stopTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleCorrectMatch = () => {
    setScore((s) => s + 10);
    setWordsCompleted((w) => w + 1);
    
    setTimeout(() => {
      // Load new pair after correct match
      if (wordsCompleted + 1 < 64) {
        loadNewPair(allWords, usedWords);
      }
    }, 1000);
  };

  const handleCardClick = (card: Card) => {
    if (
      card.matched ||
      card.type === "disappear" ||
      card.type === "empty" ||
      (firstChoice && firstChoice.id === card.id)
    )
      return;

    if (!firstChoice) {
      setFirstChoice(card);
    } else if (!secondChoice) {
      setSecondChoice(card);
      setAttempts((a) => a + 1);

      if (firstChoice.wordId === card.wordId && firstChoice.type !== card.type) {
        // Correct match
        setCards((prev) =>
          prev.map((c) =>
            c.wordId === card.wordId ? { ...c, matched: true, type: "disappear" } : c
          )
        );
        handleCorrectMatch();

        setTimeout(() => {
          resetChoices();
          // Load new pair after match if more words available
          if (wordsCompleted + 1 < 64) {
            loadNewPair(allWords, usedWords);
          } else {
            setGameOver(true);
            stopTimer();
          }
        }, 1000);
      } else {
        // Wrong match
        setFirstChoice({ ...firstChoice, type: "wrong" });
        setSecondChoice({ ...card, type: "wrong" });

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.type === "wrong" ? { ...c, type: c.wordId === firstChoice.wordId || c.wordId === card.wordId ? (c.content === firstChoice.content ? firstChoice.type.includes("en") ? "en" : "he" : card.type.includes("en") ? "en" : "he") : c.type } : c
            )
          );
          resetChoices();
        }, 1000);
      }
    }
  };

  const resetChoices = () => {
    setFirstChoice(null);
    setSecondChoice(null);
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    const milliseconds = (ms % 1000).toString().padStart(3, "0");
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  return (
    <>
      <Helmet>
        <title>64-Word Matching Challenge</title>
        <meta name="description" content="Challenge yourself with 64 medical terms in Hebrew-English matching pairs." />
      </Helmet>
      <main className="container mx-auto max-w-6xl">
        <section className="container max-w-5xl text-center w-full">
          {allWords.length === 0 ? (
            <section className="container max-w-5xl text-center w-full">
              <header className="mb-8 sm:mb-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  64-Word Matching Challenge
                </h1>
                <p className="mt-2 sm:mt-3 text-base sm:text-lg max-w-xl mx-auto tracking-tight text-foreground">
                  Match English words to their Hebrew translations. Complete all 64 word pairs!
                </p>
              </header>
              <Button
                onClick={initializeGame}
                className="px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition"
              >
                Start 64-Word Challenge
              </Button>
            </section>
          ) : gameOver ? (
            <div className="mt-6 text-xl font-bold text-green-700">
              🎉 Congratulations! You completed all 64 words!
              <p className="text-lg mt-2">Final Score: {score} | Total Attempts: {attempts} | Time: {formatTime(timer)}</p>
              <div className="mt-4">
                <Button
                  onClick={initializeGame}
                  className="px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition"
                >
                  Play Again
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
                  64-Word Challenge
                </h1>
                <div className="flex justify-center gap-6 text-sm md:text-base">
                  <span>Progress: {wordsCompleted}/64 pairs</span>
                  <span>Score: {score}</span>
                  <span>Attempts: {attempts}</span>
                  <span>Time: {formatTime(timer)}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 mt-3">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${(wordsCompleted / 64) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {cards.map((card) => {
                  const isSelected = firstChoice?.id === card.id || secondChoice?.id === card.id;
                  
                  let bgColor = "bg-card hover:bg-accent border-border";
                  if (card.type === "wrong") {
                    bgColor = "bg-destructive/20 border-destructive";
                  } else if (card.matched) {
                    bgColor = "bg-primary/20 border-primary";
                  } else if (isSelected) {
                    bgColor = "bg-primary/10 border-primary";
                  }

                  return (
                    <div
                      key={card.id}
                      onClick={() => handleCardClick(card)}
                      className={`
                        p-4 sm:p-6 text-base sm:text-lg flex items-center justify-center 
                        h-20 sm:h-24 rounded-lg cursor-pointer border-2 transition-all 
                        duration-200 select-none font-medium ${bgColor}
                      `}
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        userSelect: "none",
                        touchAction: "manipulation",
                      }}
                      aria-label={`Card with word ${card.content}`}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCardClick(card);
                        }
                      }}
                    >
                      {card.content}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>
    </>
  );
};

export default MatchingGame;
