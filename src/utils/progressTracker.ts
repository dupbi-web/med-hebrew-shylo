/**
 * Progress Tracking System
 * Records and manages user progress across SOAP sections
 */

import {
    OverallProgress,
    SectionStats,
    ExerciseAttempt,
    SOAPSection,
    ErrorType,
} from "@/types/soapGame";

const PROGRESS_KEY = "soap-game-progress";

/**
 * Initialize empty progress data
 */
function initializeProgress(): OverallProgress {
    const emptySectionStats = (): SectionStats => ({
        section: "Subjective",
        totalAttempts: 0,
        successfulAttempts: 0,
        successRate: 0,
        averageTime: 0,
        lastPracticed: null,
        totalTimeTaken: 0,
        commonErrors: [],
    });

    return {
        totalExercisesCompleted: 0,
        totalTimeSpent: 0,
        currentStreak: 0,
        lastPracticeDate: null,
        sectionStats: {
            Subjective: { ...emptySectionStats(), section: "Subjective" },
            Objective: { ...emptySectionStats(), section: "Objective" },
            Assessment: { ...emptySectionStats(), section: "Assessment" },
            Plan: { ...emptySectionStats(), section: "Plan" },
        },
        lastUpdated: Date.now(),
    };
}

/**
 * Load progress from localStorage
 */
export function loadProgress(): OverallProgress {
    try {
        const stored = localStorage.getItem(PROGRESS_KEY);
        if (!stored) return initializeProgress();

        const parsed = JSON.parse(stored) as OverallProgress;
        return {
            ...initializeProgress(),
            ...parsed,
        };
    } catch (error) {
        console.error("Error loading progress:", error);
        return initializeProgress();
    }
}

/**
 * Save progress to localStorage
 */
export function saveProgress(progress: OverallProgress): void {
    try {
        const toSave: OverallProgress = {
            ...progress,
            lastUpdated: Date.now(),
        };
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(toSave));
    } catch (error) {
        console.error("Error saving progress:", error);
    }
}

/**
 * Calculate if practice streak should continue
 */
function calculateStreak(lastPracticeDate: number | null, currentDate: number): number {
    if (!lastPracticeDate) return 1;

    const lastDate = new Date(lastPracticeDate);
    const today = new Date(currentDate);

    // Reset time to midnight for comparison
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 0) {
        // Same day - keep streak
        const progress = loadProgress();
        return progress.currentStreak;
    } else if (daysDiff === 1) {
        // Next day - increment streak
        const progress = loadProgress();
        return progress.currentStreak + 1;
    } else {
        // Missed days - reset streak
        return 1;
    }
}

/**
 * Record an exercise attempt and update progress
 */
export function recordAttempt(attempt: ExerciseAttempt): void {
    const progress = loadProgress();

    // Update section stats
    const sectionStats = progress.sectionStats[attempt.soapSection];
    sectionStats.totalAttempts++;

    if (attempt.isCorrect) {
        sectionStats.successfulAttempts++;
    }

    // Recalculate success rate
    sectionStats.successRate =
        (sectionStats.successfulAttempts / sectionStats.totalAttempts) * 100;

    // Update average time
    sectionStats.totalTimeTaken += attempt.timeTaken;
    sectionStats.averageTime = sectionStats.totalTimeTaken / sectionStats.totalAttempts;

    // Update last practiced
    sectionStats.lastPracticed = attempt.timestamp;

    // Update common errors
    attempt.errorTypes.forEach((errorType) => {
        const errorStat = sectionStats.commonErrors.find((e) => e.type === errorType);
        if (errorStat) {
            errorStat.count++;
        } else {
            sectionStats.commonErrors.push({ type: errorType, count: 1 });
        }
    });

    // Sort errors by count (most common first)
    sectionStats.commonErrors.sort((a, b) => b.count - a.count);

    // Update overall stats
    progress.totalExercisesCompleted++;
    progress.totalTimeSpent += attempt.timeTaken;
    progress.currentStreak = calculateStreak(progress.lastPracticeDate, attempt.timestamp);
    progress.lastPracticeDate = attempt.timestamp;

    saveProgress(progress);
}

/**
 * Get exercise counts by section
 */
export function getExerciseCounts(progress: OverallProgress): {
    total: number;
    bySection: Record<SOAPSection, number>;
} {
    return {
        total: progress.totalExercisesCompleted,
        bySection: {
            Subjective: progress.sectionStats.Subjective.totalAttempts,
            Objective: progress.sectionStats.Objective.totalAttempts,
            Assessment: progress.sectionStats.Assessment.totalAttempts,
            Plan: progress.sectionStats.Plan.totalAttempts,
        },
    };
}

/**
 * Reset all progress data
 */
export function resetProgress(): void {
    localStorage.removeItem(PROGRESS_KEY);
}

/**
 * Format time in seconds to human-readable string
 */
export function formatTime(seconds: number): string {
    if (seconds < 60) {
        return `${Math.round(seconds)}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `לפני ${days} ${days === 1 ? "יום" : "ימים"}`;
    } else if (hours > 0) {
        return `לפני ${hours} ${hours === 1 ? "שעה" : "שעות"}`;
    } else if (minutes > 0) {
        return `לפני ${minutes} ${minutes === 1 ? "דקה" : "דקות"}`;
    } else {
        return "עכשיו";
    }
}
