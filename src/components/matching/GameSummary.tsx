import { Button } from "@/components/ui/button";

interface GameSummaryProps {
  wordsMatched: number;
  totalWords: number;
  score: number;
  attempts: number;
  timeElapsed: number;
  accuracy: number;
  onRestart: () => void;
  isTimeUp: boolean;
}

export const GameSummary = ({
  wordsMatched,
  totalWords,
  score,
  attempts,
  timeElapsed,
  accuracy,
  onRestart,
  isTimeUp
}: GameSummaryProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const isComplete = wordsMatched === totalWords;
  const title = isComplete ? "🎉 Congratulations!" : isTimeUp ? "⏰ Time's Up!" : "Game Over";
  const subtitle = isComplete 
    ? "You matched all 64 words!" 
    : `You matched ${wordsMatched} out of ${totalWords} words.`;

  return (
    <div className="max-w-md mx-auto text-center space-y-6 p-6 bg-card rounded-lg border shadow-elegant">
      <header className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
        <p className="text-muted-foreground">{subtitle}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">{score}</div>
          <div className="text-sm text-muted-foreground">Score</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">{wordsMatched}</div>
          <div className="text-sm text-muted-foreground">Words Matched</div>
        </div>
        
        <div className="space-y-1">
          <div className="text-2xl font-bold text-primary">{formatTime(timeElapsed)}</div>
          <div className="text-sm text-muted-foreground">Time Elapsed</div>
        </div>
      </div>

      {/* Performance Rating */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-muted-foreground">Performance</div>
        <div className="flex justify-center">
          {accuracy >= 90 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground">
              ⭐ Excellent
            </span>
          )}
          {accuracy >= 75 && accuracy < 90 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent text-accent-foreground">
              👍 Great
            </span>
          )}
          {accuracy >= 60 && accuracy < 75 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
              👌 Good
            </span>
          )}
          {accuracy < 60 && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-muted text-muted-foreground">
              💪 Keep Practicing
            </span>
          )}
        </div>
      </div>

      <Button
        onClick={onRestart}
        size="lg"
        className="w-full font-semibold"
      >
        Play Again
      </Button>
    </div>
  );
};