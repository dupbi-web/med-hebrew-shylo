import { SessionSummary } from './sessionTracking';

export interface UserProgress {
  lastUpdated: string;
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  totalSessions: number;
  totalPracticeMinutes: number;
  lifetimeMetrics: {
    averageAccuracy: number;
    bestAccuracy: number;
    averageCpm: number;
    bestCpm: number;
    totalSentencesCompleted: number;
  };
  categoryStats: Record<string, CategoryStat>;
  problemWords: ProblemWordHistory[];
  achievements: Achievement[];
  sessionHistory: SessionHistoryEntry[];
  personalRecords: PersonalRecords;
}

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  sessionsCompleted: number;
  averageAccuracy: number;
  totalSentences: number;
}

export interface ProblemWordHistory {
  russian: string;
  hebrew: string;
  attempts: number;
  successes: number;
  successRate: number;
  lastAttempt: string;
}

export interface Achievement {
  id: string;
  name: string;
  nameHe: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: number;
  progress: number;
}

export interface SessionHistoryEntry {
  sessionId: string;
  date: string;
  category: string;
  accuracy: number;
  cpm: number;
  wpm: number;
  sentencesCompleted: number;
  durationSeconds: number;
}

export interface PersonalRecords {
  bestAccuracy: { value: number; date: string };
  fastestCpm: { value: number; date: string };
  longestStreak: { value: number; date: string };
  mostSentencesInSession: { value: number; date: string };
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'beginner',
    name: 'Beginner',
    nameHe: 'מתחיל',
    description: 'Complete 10 sentences',
    icon: 'GraduationCap',
    unlockedAt: null,
    requirement: 10,
    progress: 0,
  },
  {
    id: 'precision',
    name: 'Precision',
    nameHe: 'דיוקן',
    description: '95% accuracy in a session',
    icon: 'Target',
    unlockedAt: null,
    requirement: 95,
    progress: 0,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    nameHe: 'מהיר',
    description: 'Reach 70+ CPM',
    icon: 'Zap',
    unlockedAt: null,
    requirement: 70,
    progress: 0,
  },
  {
    id: 'fluent',
    name: 'Fluent in Russian',
    nameHe: 'רוסי שוטף',
    description: 'Translate 100 sentences',
    icon: 'BookOpen',
    unlockedAt: null,
    requirement: 100,
    progress: 0,
  },
  {
    id: 'week_streak',
    name: 'Full Week',
    nameHe: 'שבוע שלם',
    description: '7-day practice streak',
    icon: 'Flame',
    unlockedAt: null,
    requirement: 7,
    progress: 0,
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    nameHe: 'מסור',
    description: 'Practice for 1 hour total',
    icon: 'Clock',
    unlockedAt: null,
    requirement: 60,
    progress: 0,
  },
];

export const DEFAULT_USER_PROGRESS: UserProgress = {
  lastUpdated: new Date().toISOString(),
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: '',
  totalSessions: 0,
  totalPracticeMinutes: 0,
  lifetimeMetrics: {
    averageAccuracy: 0,
    bestAccuracy: 0,
    averageCpm: 0,
    bestCpm: 0,
    totalSentencesCompleted: 0,
  },
  categoryStats: {},
  problemWords: [],
  achievements: DEFAULT_ACHIEVEMENTS,
  sessionHistory: [],
  personalRecords: {
    bestAccuracy: { value: 0, date: '' },
    fastestCpm: { value: 0, date: '' },
    longestStreak: { value: 0, date: '' },
    mostSentencesInSession: { value: 0, date: '' },
  },
};
