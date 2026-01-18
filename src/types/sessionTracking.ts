export interface SentenceResult {
  sentenceId: string;
  timestamp: string;
  userInput: string;
  correctAnswer: string;
  metrics: {
    cpm: number;
    wpm: number;
    elapsedSeconds: number;
    totalCharacters: number;
    correctCharacters: number;
    incorrectCharacters: number;
    accuracy: number;
  };
  backspaceCount: number;
  pauseCount: number;
}

export interface ProblemWord {
  russian: string;
  hebrew: string;
  errorRate: number;
}

export interface SessionSummary {
  sessionId: string;
  category: string;
  categoryName: string;
  startTime: string;
  endTime: string;
  totalSentences: number;
  completedSentences: number;
  overallMetrics: {
    averageAccuracy: number;
    averageCpm: number;
    averageWpm: number;
    totalTimeSeconds: number;
    totalCharactersTyped: number;
    totalBackspaces: number;
  };
  sentenceResults: SentenceResult[];
  problemWords: ProblemWord[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface LifetimeMetrics {
  totalSessions: number;
  averageAccuracy: number;
  bestAccuracy: number;
  averageCpm: number;
  bestCpm: number;
  totalPracticeMinutes: number;
}
