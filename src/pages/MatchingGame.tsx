import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useMatchingGame } from "@/hooks/useMatchingGame";
import { GameCard } from "@/components/matching/GameCard";
import { GameProgress } from "@/components/matching/GameProgress";
import { GameSummary } from "@/components/matching/GameSummary";

const MatchingGame = () => {
  const {
    gameState,
    currentCards,
    firstChoice,
    secondChoice,
    stats,
    timeRemaining,
    totalWords,
    windowWidth,
    initializeGame,
    handleCardClick,
    restartGame,
    gridColumns
  } = useMatchingGame();

  return (
    <>
      <Helmet>
        <title>64-Word Medical Hebrew Matching Challenge</title>
        <meta name="description" content="Master 64 medical Hebrew terms in this challenging 3-minute matching game. Match English words to their Hebrew translations as fast as you can!" />
      </Helmet>
      
      <main className="container mx-auto max-w-6xl min-h-screen py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Game Menu */}
          {gameState === "menu" && (
            <div className="text-center space-y-8">
              <header className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  64-Word Challenge
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Master medical Hebrew with an intensive 3-minute matching challenge featuring 64 carefully selected terms.
                </p>
              </header>
              
              <div className="bg-card rounded-lg p-6 border max-w-md mx-auto space-y-4">
                <h2 className="text-xl font-semibold text-foreground">Game Rules</h2>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>🎯 Match English words to Hebrew translations</li>
                  <li>⏱️ Complete as many as possible in 3 minutes</li>
                  <li>🔄 New word pairs appear after each match</li>
                  <li>🏆 Score points for correct matches</li>
                  <li>📱 Responsive grid adapts to your screen</li>
                </ul>
              </div>
              
              <Button
                onClick={initializeGame}
                size="lg"
                className="px-8 py-4 text-lg font-semibold shadow-elegant hover:shadow-xl transition-all duration-300"
              >
                Start Challenge
              </Button>
            </div>
          )}

          {/* Active Game */}
          {gameState === "playing" && (
            <>
              <GameProgress
                wordsMatched={stats.wordsMatched}
                totalWords={totalWords}
                timeRemaining={timeRemaining}
                score={stats.score}
                attempts={stats.attempts}
                accuracy={stats.accuracy}
              />
              
              <div
                className="grid gap-3 md:gap-4 mx-auto px-4"
                style={{ gridTemplateColumns: `repeat(${gridColumns}, minmax(0, 1fr))` }}
              >
{/*                 {currentCards.map((card) => (
                  <GameCard
                    key={card.id}
                    card={card}
                    isSelected={firstChoice?.id === card.id || secondChoice?.id === card.id}
                    onClick={handleCardClick}
                  />
                ))} */}
                {currentCards.map((card) => (
  <GameCard
    key={`${card.wordId}-${card.content}`} // Unique AND stable
    card={card}
    isSelected={
      (firstChoice?.id === card.id) ||
      (secondChoice?.id === card.id)
    }
    onClick={handleCardClick}
  />
))}
              </div>
            </>
          )}

          {/* Game Summary */}
          {gameState === "finished" && (
            <GameSummary
              wordsMatched={stats.wordsMatched}
              totalWords={totalWords}
              score={stats.score}
              attempts={stats.attempts}
              timeElapsed={stats.timeElapsed}
              accuracy={stats.accuracy}
              onRestart={restartGame}
              isTimeUp={timeRemaining === 0}
            />
          )}
        </div>
      </main>
    </>
  );
};

export default MatchingGame;
