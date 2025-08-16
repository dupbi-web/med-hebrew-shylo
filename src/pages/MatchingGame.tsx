import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [words, setWords] = useState<Word[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [visibleCards, setVisibleCards] = useState<Card[]>([]);
  const [firstChoice, setFirstChoice] = useState<Card | null>(null);
  const [secondChoice, setSecondChoice] = useState<Card | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // When windowWidth changes, refetch words and reset game
    if (cards.length > 0) {
      // Only refetch if game in progress? Or auto-reset? We'll auto-reset here for simplicity
      fetchWords(windowWidth);
    }
  }, [windowWidth]);

  useEffect(() => {
    // Listen to window resize for responsive card count
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Update visible cards count and slice cards accordingly
    const count = getVisibleCardCount(windowWidth);
    setVisibleCards(cards.slice(0, count));
  }, [windowWidth, cards]);

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

  const fetchWords = async (width: number) => {
    const visibleCount = getVisibleCardCount(width);
    const pairsNeeded = visibleCount / 2;

    const { data, error } = await supabase
      .from("medical_terms")
      .select("id, en, he");

    if (error || !data || data.length < pairsNeeded) {
      console.warn("Not enough words in database or fetch error");
      return;
    }

    const selectedWords = shuffleArray(data).slice(0, pairsNeeded);
    setWords(selectedWords);

    setGameOver(false);
    setAttempts(0);
    setScore(0);
    setFirstChoice(null);
    setSecondChoice(null);

    const cardData: Card[] = selectedWords.flatMap((w) => [
      { id: w.id * 2, content: w.en, wordId: w.id, matched: false, type: "en" },
      { id: w.id * 2 + 1, content: w.he, wordId: w.id, matched: false, type: "he" },
    ]);

    const shuffled = shuffleArray(cardData);
    setCards(shuffled);
    setVisibleCards(shuffled.slice(0, visibleCount));
    startTimer();
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
        setCards((prev) =>
          prev.map((c) =>
            c.wordId === card.wordId ? { ...c, matched: true, type: "disappear" } : c
          )
        );
        setScore((s) => s + 10);

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.type === "disappear" ? { ...c, content: "", type: "empty" } : c
            )
          );
          resetChoices();
        }, 250);
      } else {
        setFirstChoice({ ...firstChoice, type: "wrong" });
        setSecondChoice({ ...card, type: "wrong" });

        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.type === "wrong" ? { ...c, type: c.matched ? "en" : c.type } : c
            )
          );
          resetChoices();
        }, 300);
      }
    }
  };

  const resetChoices = () => {
    setFirstChoice(null);
    setSecondChoice(null);
  };

  useEffect(() => {
    if (cards.length && cards.every((c) => c.type === "empty")) {
      setGameOver(true);
      stopTimer();
    }
  }, [cards]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    const milliseconds = (ms % 1000).toString().padStart(3, "0");
    return `${minutes}:${seconds}:${milliseconds}`;
  };

  const gridColumns = getGridColumns(windowWidth);

  return (
    <>
      <Helmet>
        <title>Matching Game</title>
        <meta name="description" content="Test your knowledge of medical Hebrew with multiple choice questions." />
      </Helmet>
      <main className="container mx-auto max-w-6xl">

        <section className="container max-w-5xl text-center w-full">

          {cards.length === 0 && (
            <section className="container max-w-5xl text-center w-full">
              <header className="mb-8 sm:mb-10">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                  Matching Game
                </h1>
                <p className="mt-2 sm:mt-3 text-base sm:text-lg max-w-xl mx-auto tracking-tight text-foreground">
                  Match English words to their Hebrew translations
                </p>
              </header>
              <Button
                onClick={() => fetchWords(windowWidth)}
                className="px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition"
              >
                Start New Game
              </Button>
            </section>
          )}

          {gameOver && (
            <div className="mt-6 text-xl font-bold text-green-700">
              🎉 Game Over! You matched all pairs.
              <div className="mt-4">
                <Button
                  onClick={() => fetchWords(windowWidth)}
                  className="px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition"
                >
                  Reset Game
                </Button>
              </div>
            </div>
          )}

          {cards.length > 0 && (
            <p className="mt-6 text-lg font-semibold tracking-tight text-foreground">
              Score: {score} | Attempts: {attempts} | Time: {formatTime(timer)}
            </p>
          )}

          <div
            className="grid gap-4 mt-8 max-w-5xl mx-auto w-full px-2 sm:px-4 "
            style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
          >
            {visibleCards.map((card) => {
              const isSelected =
                firstChoice?.id === card.id || secondChoice?.id === card.id;

              const baseStyle =
                "p-4 sm:p-6 text-base sm:text-xl flex items-center justify-center h-24 sm:h-32 rounded-lg cursor-pointer border transition-all duration-300 select-none";

              let bgColor = "";
              if (card.type === "wrong")
                bgColor = "bg-red-300 text-white font-bold shadow-lg";
              else if (card.type === "empty")
                bgColor = "bg-white-200 border-dashed cursor-default";
              else if (card.matched)
                bgColor = "bg-gray-100 dark:bg-gray-600 text-white font-bold shadow-md";
              else if (isSelected) bgColor = "bg-gray-300 dark:bg-gray-600 text-black font-semibold shadow ";
              else bgColor = "bg-white text-black dark:bg-gray-800 dark:text-white shadow-sm";

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`${baseStyle} ${bgColor}`}
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    userSelect: "none",
                    touchAction: "manipulation",
                  }}
                  aria-label={
                    card.matched ? "Matched card" : `Card with word ${card.content}`
                  }
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
        </section>
      </main>
      <style>
        {`
          @keyframes disappear {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.3); opacity: 1; }
            100% { transform: scale(0); opacity: 0; }
          }
          .animate-disappear {
            animation: disappear 0.25s ease-out forwards;
          }
        `}
      </style>
    </>
  );
};

export default MatchingGame;
