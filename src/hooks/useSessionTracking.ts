import { useState, useCallback, useRef } from 'react';
import { SentenceResult, SessionSummary, ProblemWord } from '@/types/sessionTracking';
import { TypingMetrics } from './useTypingMetrics';
import { Translation, Category } from '@/types/translation';

export const useSessionTracking = (category: Category) => {
  const [sentenceResults, setSentenceResults] = useState<SentenceResult[]>([]);
  const sessionStartTime = useRef<string>(new Date().toISOString());

  const recordSentenceResult = useCallback((
    translation: Translation,
    userInput: string,
    metrics: TypingMetrics,
    accuracy: number
  ) => {
    const correctChars = Math.round((accuracy / 100) * userInput.length);
    
    const result: SentenceResult = {
      sentenceId: translation.id,
      timestamp: new Date().toISOString(),
      userInput,
      correctAnswer: translation.target.sentence,
      metrics: {
        cpm: metrics.cpm,
        wpm: metrics.wpm,
        elapsedSeconds: metrics.elapsedSeconds,
        totalCharacters: userInput.length,
        correctCharacters: correctChars,
        incorrectCharacters: userInput.length - correctChars,
        accuracy,
      },
      backspaceCount: metrics.backspaceCount,
      pauseCount: metrics.pauseCount,
    };

    setSentenceResults(prev => [...prev, result]);
    return result;
  }, []);

  const generateSessionSummary = useCallback((
    translations: Translation[],
    completedCount: number
  ): SessionSummary => {
    const endTime = new Date().toISOString();
    
    // Calculate overall metrics
    const totalResults = sentenceResults.length;
    const avgAccuracy = totalResults > 0 
      ? sentenceResults.reduce((sum, r) => sum + r.metrics.accuracy, 0) / totalResults 
      : 0;
    const avgCpm = totalResults > 0 
      ? sentenceResults.reduce((sum, r) => sum + r.metrics.cpm, 0) / totalResults 
      : 0;
    const avgWpm = totalResults > 0 
      ? sentenceResults.reduce((sum, r) => sum + r.metrics.wpm, 0) / totalResults 
      : 0;
    const totalTime = sentenceResults.reduce((sum, r) => sum + r.metrics.elapsedSeconds, 0);
    const totalChars = sentenceResults.reduce((sum, r) => sum + r.metrics.totalCharacters, 0);
    const totalBackspaces = sentenceResults.reduce((sum, r) => sum + r.backspaceCount, 0);

    // Find problem words based on low accuracy sentences
    const problemWords: ProblemWord[] = [];
    sentenceResults
      .filter(r => r.metrics.accuracy < 70)
      .forEach(result => {
        const translation = translations.find(t => t.id === result.sentenceId);
        if (translation) {
          translation.words.forEach(word => {
            const existing = problemWords.find(p => p.russian === word.source);
            if (existing) {
              existing.errorRate = (existing.errorRate + (100 - result.metrics.accuracy) / 100) / 2;
            } else {
              problemWords.push({
                russian: word.source,
                hebrew: word.target,
                errorRate: (100 - result.metrics.accuracy) / 100,
              });
            }
          });
        }
      });

    // Determine trend based on accuracy progression
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (totalResults >= 3) {
      const firstHalf = sentenceResults.slice(0, Math.floor(totalResults / 2));
      const secondHalf = sentenceResults.slice(Math.floor(totalResults / 2));
      const firstAvg = firstHalf.reduce((sum, r) => sum + r.metrics.accuracy, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.metrics.accuracy, 0) / secondHalf.length;
      
      if (secondAvg - firstAvg > 5) trend = 'improving';
      else if (firstAvg - secondAvg > 5) trend = 'declining';
    }

    return {
      sessionId: `sess_${Date.now()}`,
      category: category.id,
      categoryName: category.name,
      startTime: sessionStartTime.current,
      endTime,
      totalSentences: translations.length,
      completedSentences: completedCount,
      overallMetrics: {
        averageAccuracy: Math.round(avgAccuracy * 10) / 10,
        averageCpm: Math.round(avgCpm),
        averageWpm: Math.round(avgWpm),
        totalTimeSeconds: Math.round(totalTime),
        totalCharactersTyped: totalChars,
        totalBackspaces,
      },
      sentenceResults,
      problemWords: problemWords.sort((a, b) => b.errorRate - a.errorRate).slice(0, 5),
      trend,
    };
  }, [sentenceResults, category]);

  const resetSession = useCallback(() => {
    setSentenceResults([]);
    sessionStartTime.current = new Date().toISOString();
  }, []);

  return {
    sentenceResults,
    recordSentenceResult,
    generateSessionSummary,
    resetSession,
  };
};
