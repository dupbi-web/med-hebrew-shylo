// import { useEffect, useState, useRef } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Helmet } from "react-helmet-async";
// import { Link } from "react-router-dom";

// type Word = {
//   id: number;
//   en: string;
//   he: string;
// };

// type Card = {
//   id: number;
//   content: string;
//   wordId: number;
//   matched: boolean;
//   type: "en" | "he" | "wrong" | "disappear" | "empty";
// };

// const shuffleArray = <T,>(arr: T[]): T[] => {
//   const copy = [...arr];
//   for (let i = copy.length - 1; i > 0; i--) {
//     const j = Math.floor(Math.random() * (i + 1));
//     [copy[i], copy[j]] = [copy[j], copy[i]];
//   }
//   return copy;
// };

// const MatchingGame = () => {
//   const [words, setWords] = useState<Word[]>([]);
//   const [cards, setCards] = useState<Card[]>([]);
//   const [firstChoice, setFirstChoice] = useState<Card | null>(null);
//   const [secondChoice, setSecondChoice] = useState<Card | null>(null);
//   const [attempts, setAttempts] = useState(0);
//   const [score, setScore] = useState(0);
//   const [gameOver, setGameOver] = useState(false);
//   const [timer, setTimer] = useState(0);

//   const intervalRef = useRef<number | null>(null);

//   const startTimer = () => {
//     setTimer(0);
//     if (intervalRef.current) clearInterval(intervalRef.current);
//     intervalRef.current = window.setInterval(() => {
//       setTimer((t) => t + 10); // increment by 10ms
//     }, 10);
//   };

//   const stopTimer = () => {
//     if (intervalRef.current) clearInterval(intervalRef.current);
//   };

//   const fetchWords = async () => {
//     const { data, error } = await supabase
//       .from("medical_terms")
//       .select("id, en, he");

//     if (error || !data || data.length < 8) return;

//     const selectedWords = shuffleArray(data).slice(0, 8);
//     setWords(selectedWords);

//     setGameOver(false);
//     setAttempts(0);
//     setScore(0);
//     setFirstChoice(null);
//     setSecondChoice(null);

//     const cardData: Card[] = selectedWords.flatMap((w) => [
//       { id: w.id * 2, content: w.en, wordId: w.id, matched: false, type: "en" },
//       { id: w.id * 2 + 1, content: w.he, wordId: w.id, matched: false, type: "he" },
//     ]);

//     // Ensure exactly 16 cards (4x4)
//     setCards(shuffleArray(cardData).slice(0, 16));
//     startTimer();
//   };

//   const handleCardClick = (card: Card) => {
//     if (
//       card.matched ||
//       card.type === "disappear" ||
//       card.type === "empty" ||
//       (firstChoice && firstChoice.id === card.id)
//     )
//       return;

//     if (!firstChoice) {
//       setFirstChoice(card);
//     } else if (!secondChoice) {
//       setSecondChoice(card);
//       setAttempts((a) => a + 1);

//       if (firstChoice.wordId === card.wordId && firstChoice.type !== card.type) {
//         // correct match
//         setCards((prev) =>
//           prev.map((c) =>
//             c.wordId === card.wordId ? { ...c, matched: true, type: "disappear" } : c
//           )
//         );
//         setScore((s) => s + 10);

//         setTimeout(() => {
//           setCards((prev) =>
//             prev.map((c) =>
//               c.type === "disappear" ? { ...c, content: "", type: "empty" } : c
//             )
//           );
//           resetChoices();
//         }, 250); // faster disappearance
//       } else {
//         // wrong match
//         setFirstChoice({ ...firstChoice, type: "wrong" });
//         setSecondChoice({ ...card, type: "wrong" });

//         setTimeout(() => {
//           setCards((prev) =>
//             prev.map((c) =>
//               c.type === "wrong" ? { ...c, type: c.matched ? "en" : c.type } : c
//             )
//           );
//           resetChoices();
//         }, 300);
//       }
//     }
//   };

//   const resetChoices = () => {
//     setFirstChoice(null);
//     setSecondChoice(null);
//   };

//   useEffect(() => {
//     if (cards.length && cards.every((c) => c.type === "empty")) {
//       setGameOver(true);
//       stopTimer();
//     }
//   }, [cards]);

//   // Format timer as mm:ss:ms
//   const formatTime = (ms: number) => {
//     const totalSeconds = Math.floor(ms / 1000);
//     const minutes = Math.floor(totalSeconds / 60)
//       .toString()
//       .padStart(2, "0");
//     const seconds = (totalSeconds % 60).toString().padStart(2, "0");
//     const milliseconds = (ms % 1000).toString().padStart(3, "0");
//     return `${minutes}:${seconds}:${milliseconds}`;
//   };

//   return (
//     <>
//       <Helmet>
//         <title>Matching Game</title>
//       </Helmet>

//       <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-12">
//         <section className="container max-w-4xl text-center">
//           <header className="mb-10">
//             <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
//               Matching Game
//             </h1>
//             <p className="mt-3 text-lg text-gray-600">
//               Match English words to their Hebrew translations
//             </p>
//           </header>

//           {cards.length === 0 && (
//             <Button
//               onClick={fetchWords}
//               className="px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition"
//             >
//               Start New Game
//             </Button>
//           )}
//           {/* Game Over message */}
//           {gameOver && (
//             <div className="mt-6 text-xl font-bold text-green-700">
//               🎉 Game Over! You matched all pairs.
//               <div className="mt-4">
//                 <Button
//                   onClick={fetchWords}
//                   className="px-6 py-2 text-lg font-semibold shadow-lg hover:shadow-xl transition"
//                 >
//                   Reset Game
//                 </Button>
//               </div>
//             </div>
//           )}
//           {/* Timer and score */}
//           {cards.length > 0 && (
//             <p className="mt-6 text-lg font-semibold text-gray-800">
//               Score: {score} | Attempts: {attempts} | Time: {formatTime(timer)}
//             </p>
//           )}

//           {/* Fixed 4x4 grid */}
//           <div className="grid grid-cols-4 gap-6 mt-8 max-w-3xl mx-auto">
//             {cards.map((card, idx) => {
//               const isSelected =
//                 firstChoice?.id === card.id || secondChoice?.id === card.id;

//               const baseStyle =
//                 "p-6 text-xl flex items-center justify-center h-32 rounded-lg cursor-pointer border transition-all duration-300";

//               let bgColor = "";
//               if (card.type === "wrong")
//                 bgColor = "bg-red-300 text-white font-bold shadow-lg";
//               else if (card.type === "empty")
//                 bgColor = "bg-gray-200 border-dashed cursor-default";
//               // else if (card.type === "disappear")
//               //   bgColor = "bg-green-400 text-white font-bold shadow-2xl animate-disappear";
//               else if (card.matched)
//                 bgColor = "bg-green-200 text-white font-bold shadow-md";
//               else if (isSelected) bgColor = "bg-yellow-200 text-black font-semibold shadow";
//               else bgColor = "bg-white text-black shadow-sm";

//               return (
//                 <div
//                   key={card.id}
//                   onClick={() => handleCardClick(card)}
//                   className={`${baseStyle} ${bgColor}`}
//                 >
//                   {card.content}
//                 </div>
//               );
//             })}
//           </div>
//         </section>
//       </main>

//       <style>
//         {`
//           @keyframes disappear {
//             0% { transform: scale(1); opacity: 1; }
//             50% { transform: scale(1.3); opacity: 1; }
//             100% { transform: scale(0); opacity: 0; }
//           }
//           .animate-disappear {
//             animation: disappear 0.25s ease-out forwards;
//           }
//         `}
//       </style>
//     </>
//   );
// };

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
    // Update visible cards count and slice cards accordingly
    const count = getVisibleCardCount(windowWidth);
    setVisibleCards(cards.slice(0, count));
  }, [windowWidth, cards]);

  useEffect(() => {
    // Listen to window resize for responsive card count
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const fetchWords = async () => {
    const { data, error } = await supabase
      .from("medical_terms")
      .select("id, en, he");

    if (error || !data || data.length < 8) return;

    const selectedWords = shuffleArray(data).slice(0, 8); // always 8 words
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
    setVisibleCards(shuffled.slice(0, getVisibleCardCount(windowWidth)));
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
      </Helmet>

      <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8 sm:py-12 px-4">
        <section className="container max-w-5xl text-center w-full">
          <header className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Matching Game
            </h1>
            <p className="mt-2 sm:mt-3 text-base sm:text-lg text-gray-600 max-w-xl mx-auto">
              Match English words to their Hebrew translations
            </p>
          </header>

          {cards.length === 0 && (
            <Button
              onClick={fetchWords}
              className="px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition"
            >
              Start New Game
            </Button>
          )}

          {gameOver && (
            <div className="mt-6 text-xl font-bold text-green-700">
              🎉 Game Over! You matched all pairs.
              <div className="mt-4">
                <Button
                  onClick={fetchWords}
                  className="px-6 py-2 sm:px-8 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition"
                >
                  Reset Game
                </Button>
              </div>
            </div>
          )}

          {cards.length > 0 && (
            <p className="mt-6 text-lg font-semibold text-gray-800">
              Score: {score} | Attempts: {attempts} | Time: {formatTime(timer)}
            </p>
          )}

          <div
            className="grid gap-4 mt-8 max-w-5xl mx-auto w-full px-2 sm:px-4"
            style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
          >
            {visibleCards.map((card) => {
              const isSelected =
                firstChoice?.id === card.id || secondChoice?.id === card.id;

              const baseStyle =
                "p-4 sm:p-6 flex items-center justify-center h-24 sm:h-28 md:h-32 rounded-lg cursor-pointer border transition-all duration-300 select-none";

              let bgColor = "";
              if (card.type === "wrong")
                bgColor = "bg-red-300 text-white font-bold shadow-lg";
              else if (card.type === "empty")
                bgColor = "bg-gray-200 border-dashed cursor-default";
              else if (card.matched)
                bgColor = "bg-green-200 text-white font-bold shadow-md";
              else if (isSelected)
                bgColor = "bg-yellow-200 text-black font-semibold shadow";
              else
                bgColor = "bg-white text-black shadow-sm";

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`${baseStyle} ${bgColor} text-center break-words overflow-hidden`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleCardClick(card);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  <span className="block w-full leading-tight text-base sm:text-lg md:text-xl line-clamp-2">
                    {card.content}
                  </span>
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
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}
      </style>
    </>
  );
};

export default MatchingGame;
