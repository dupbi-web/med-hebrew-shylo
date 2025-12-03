interface GameProgressProps {
  wordsMatched: number;
  totalWords: number;
  timeRemaining: number;
  score: number;
  attempts: number;
  accuracy: number;
}

export const GameProgress = ({
  wordsMatched,
  totalWords,
  timeRemaining,
  score,
  attempts,
  accuracy
}: GameProgressProps) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (wordsMatched / totalWords) * 100;
  const timePercentage = (timeRemaining / 180) * 100; // 3 minutes = 180 seconds

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-sm text-muted-foreground">Score</div>
          <div className="text-xl font-bold text-foreground">{score}</div>
        </div>
        
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-sm text-muted-foreground">Accuracy</div>
          <div className="text-xl font-bold text-foreground">{accuracy}%</div>
        </div>
        
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-sm text-muted-foreground">Words</div>
          <div className="text-xl font-bold text-foreground">{wordsMatched}/{totalWords}</div>
        </div>
        
        <div className="bg-card rounded-lg p-3 border">
          <div className="text-sm text-muted-foreground">Time</div>
          <div className={`text-xl font-bold ${timeRemaining <= 30 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        {/* Words Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Words Matched</span>
            <span>{wordsMatched}/{totalWords}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Time Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Time Remaining</span>
            <span>{formatTime(timeRemaining)}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ease-out ${
                timePercentage <= 16.67 ? 'bg-destructive' : timePercentage <= 33.33 ? 'bg-yellow-500' : 'bg-primary'
              }`}
              style={{ width: `${timePercentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};