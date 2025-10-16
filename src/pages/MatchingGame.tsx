
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useMatchingGame } from "@/hooks/useMatchingGame";
import { useWordsContext } from "@/context/WordsContext";
import { useAuthContext } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { GameCard } from "@/components/matching/GameCard";
import { GameProgress } from "@/components/matching/GameProgress";
import { GameSummary } from "@/components/matching/GameSummary";
import { useTranslation } from "react-i18next"; // <-- Add this

const MatchingGame = () => {
  const { i18n, t } = useTranslation();
  const { user } = useAuthContext();
  const currentLang = i18n.language.split("-")[0]; // Normalize locale
  const sourceLang = currentLang === "ru" ? "rus" as const : "en" as const;
  const targetLang = "he" as const;
  const { words } = useWordsContext();

  // words now come from useWordsContext

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
    gridColumns,
  } = useMatchingGame(sourceLang, targetLang);

  return (
    <>
      <Helmet>
        <title>{t("matching_title")}</title>
        <meta
          name="description"
          content={t("matching_description")}
        />
      </Helmet>

      <main className="container mx-auto max-w-6xl min-h-screen py-8">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* Game Menu */}
          {gameState === "menu" && (
            <div className="text-center space-y-8">
              <header className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                  {t("matching_title")}
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  {t("matching_description")}
                </p>
              </header>

              <div className="bg-card rounded-lg p-6 border max-w-md mx-auto space-y-4">
                <h2 className="text-xl font-semibold text-foreground">{t("matching_rules_title")}</h2>
                <ul className="text-sm text-muted-foreground space-y-2 text-left">
                  <li>{t("matching_rule_2")}</li>
                  <li>{t("matching_rule_3")}</li>
                </ul>
              </div>

              <Button
                onClick={initializeGame}
                size="lg"
                className="px-8 py-4 text-lg font-semibold shadow-elegant hover:shadow-xl transition-all duration-300"
              >
                {t("matching_start")}
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
                {currentCards.map((card) => (
                  <GameCard
                    key={`${card.wordId}-${card.content}`}
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
