import { useState, useCallback, useEffect } from 'react';
import { UserProgress, DEFAULT_USER_PROGRESS, SessionHistoryEntry } from '@/types/userProgress';
import { SessionSummary } from '@/types/sessionTracking';

const STORAGE_KEY = 'medical-translation-progress';

export const useUserTypingProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    }
    return DEFAULT_USER_PROGRESS;
  });

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [progress]);

  const updateStreak = useCallback(() => {
    const today = new Date().toDateString();
    const lastPractice = progress.lastPracticeDate ? new Date(progress.lastPracticeDate).toDateString() : '';
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    setProgress(prev => {
      let newStreak = prev.currentStreak;
      
      if (lastPractice === today) {
        // Already practiced today, no change
        return prev;
      } else if (lastPractice === yesterday) {
        // Continuing streak
        newStreak = prev.currentStreak + 1;
      } else if (lastPractice !== today) {
        // Streak broken or first time
        newStreak = 1;
      }

      const longestStreak = Math.max(prev.longestStreak, newStreak);

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak,
        lastPracticeDate: new Date().toISOString(),
        personalRecords: {
          ...prev.personalRecords,
          longestStreak: longestStreak > prev.personalRecords.longestStreak.value
            ? { value: longestStreak, date: new Date().toISOString() }
            : prev.personalRecords.longestStreak,
        },
      };
    });
  }, [progress.lastPracticeDate]);

  const recordSession = useCallback((summary: SessionSummary) => {
    const now = new Date().toISOString();
    
    const historyEntry: SessionHistoryEntry = {
      sessionId: summary.sessionId,
      date: now,
      category: summary.categoryName,
      accuracy: summary.overallMetrics.averageAccuracy,
      cpm: summary.overallMetrics.averageCpm,
      wpm: summary.overallMetrics.averageWpm,
      sentencesCompleted: summary.completedSentences,
      durationSeconds: summary.overallMetrics.totalTimeSeconds,
    };

    setProgress(prev => {
      // Update category stats
      const categoryStats = { ...prev.categoryStats };
      const existingStat = categoryStats[summary.category];
      if (existingStat) {
        const totalSessions = existingStat.sessionsCompleted + 1;
        categoryStats[summary.category] = {
          ...existingStat,
          sessionsCompleted: totalSessions,
          averageAccuracy: (existingStat.averageAccuracy * existingStat.sessionsCompleted + summary.overallMetrics.averageAccuracy) / totalSessions,
          totalSentences: existingStat.totalSentences + summary.completedSentences,
        };
      } else {
        categoryStats[summary.category] = {
          categoryId: summary.category,
          categoryName: summary.categoryName,
          sessionsCompleted: 1,
          averageAccuracy: summary.overallMetrics.averageAccuracy,
          totalSentences: summary.completedSentences,
        };
      }

      // Update problem words
      const problemWords = [...prev.problemWords];
      summary.problemWords.forEach(pw => {
        const existing = problemWords.find(p => p.russian === pw.russian);
        if (existing) {
          existing.attempts += 1;
          existing.successes += pw.errorRate < 0.5 ? 1 : 0;
          existing.successRate = existing.successes / existing.attempts;
          existing.lastAttempt = now;
        } else {
          problemWords.push({
            russian: pw.russian,
            hebrew: pw.hebrew,
            attempts: 1,
            successes: pw.errorRate < 0.5 ? 1 : 0,
            successRate: pw.errorRate < 0.5 ? 1 : 0,
            lastAttempt: now,
          });
        }
      });

      // Calculate new lifetime metrics
      const newTotalSessions = prev.totalSessions + 1;
      const newTotalSentences = prev.lifetimeMetrics.totalSentencesCompleted + summary.completedSentences;
      const newTotalMinutes = prev.totalPracticeMinutes + Math.round(summary.overallMetrics.totalTimeSeconds / 60);
      
      const newAvgAccuracy = (prev.lifetimeMetrics.averageAccuracy * prev.totalSessions + summary.overallMetrics.averageAccuracy) / newTotalSessions;
      const newAvgCpm = (prev.lifetimeMetrics.averageCpm * prev.totalSessions + summary.overallMetrics.averageCpm) / newTotalSessions;
      
      const newBestAccuracy = Math.max(prev.lifetimeMetrics.bestAccuracy, summary.overallMetrics.averageAccuracy);
      const newBestCpm = Math.max(prev.lifetimeMetrics.bestCpm, summary.overallMetrics.averageCpm);

      // Update achievements
      const achievements = prev.achievements.map(a => {
        if (a.unlockedAt) return a; // Already unlocked
        
        let newProgress = a.progress;
        let unlocked = false;

        switch (a.id) {
          case 'beginner':
          case 'fluent':
            newProgress = newTotalSentences;
            unlocked = newProgress >= a.requirement;
            break;
          case 'precision':
            newProgress = Math.max(a.progress, summary.overallMetrics.averageAccuracy);
            unlocked = summary.overallMetrics.averageAccuracy >= a.requirement;
            break;
          case 'speed_demon':
            newProgress = Math.max(a.progress, summary.overallMetrics.averageCpm);
            unlocked = summary.overallMetrics.averageCpm >= a.requirement;
            break;
          case 'week_streak':
            newProgress = prev.currentStreak;
            unlocked = prev.currentStreak >= a.requirement;
            break;
          case 'dedicated':
            newProgress = newTotalMinutes;
            unlocked = newTotalMinutes >= a.requirement;
            break;
        }

        return {
          ...a,
          progress: newProgress,
          unlockedAt: unlocked ? now : null,
        };
      });

      // Update personal records
      const personalRecords = { ...prev.personalRecords };
      if (newBestAccuracy > prev.personalRecords.bestAccuracy.value) {
        personalRecords.bestAccuracy = { value: newBestAccuracy, date: now };
      }
      if (newBestCpm > prev.personalRecords.fastestCpm.value) {
        personalRecords.fastestCpm = { value: newBestCpm, date: now };
      }
      if (summary.completedSentences > prev.personalRecords.mostSentencesInSession.value) {
        personalRecords.mostSentencesInSession = { value: summary.completedSentences, date: now };
      }

      // Keep last 30 sessions in history
      const sessionHistory = [historyEntry, ...prev.sessionHistory].slice(0, 30);

      return {
        ...prev,
        lastUpdated: now,
        totalSessions: newTotalSessions,
        totalPracticeMinutes: newTotalMinutes,
        lifetimeMetrics: {
          averageAccuracy: Math.round(newAvgAccuracy * 10) / 10,
          bestAccuracy: Math.round(newBestAccuracy * 10) / 10,
          averageCpm: Math.round(newAvgCpm),
          bestCpm: Math.round(newBestCpm),
          totalSentencesCompleted: newTotalSentences,
        },
        categoryStats,
        problemWords: problemWords.sort((a, b) => a.successRate - b.successRate).slice(0, 20),
        achievements,
        sessionHistory,
        personalRecords,
      };
    });

    // Update streak after recording session
    updateStreak();
  }, [updateStreak]);

  const resetProgress = useCallback(() => {
    setProgress(DEFAULT_USER_PROGRESS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    progress,
    recordSession,
    resetProgress,
  };
};
