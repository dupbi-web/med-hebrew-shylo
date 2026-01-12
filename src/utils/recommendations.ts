/**
 * Smart Recommendation System
 * Analyzes user progress and suggests sections to practice
 */

import { OverallProgress, SectionStats, SOAPSection, ErrorType } from "@/types/soapGame";

export interface Recommendation {
    section: SOAPSection;
    reason: string;
    priority: "high" | "medium" | "low";
}

/**
 * Get section display name in Hebrew
 */
function getSectionName(section: SOAPSection): string {
    const names: Record<SOAPSection, string> = {
        Subjective: "Subjective (נתונים סובייקטיביים)",
        Objective: "Objective (נתונים אובייקטיביים)",
        Assessment: "Assessment (הערכה)",
        Plan: "Plan (תוכנית טיפול)",
    };
    return names[section];
}

/**
 * Get recommended section based on user progress
 */
export function getRecommendedSection(progress: OverallProgress): Recommendation {
    const sections = Object.entries(progress.sectionStats) as [SOAPSection, SectionStats][];

    // Priority 1: Never practiced sections
    const neverPracticed = sections.filter(([_, stats]) => stats.totalAttempts === 0);
    if (neverPracticed.length > 0) {
        return {
            section: neverPracticed[0][0],
            reason: `התחל לתרגל ${getSectionName(neverPracticed[0][0])} - עדיין לא תרגלת חלק זה`,
            priority: "high",
        };
    }

    // Priority 2: Lowest success rate (but with at least 3 attempts)
    const practicedEnough = sections.filter(([_, stats]) => stats.totalAttempts >= 3);
    if (practicedEnough.length > 0) {
        const weakest = practicedEnough.sort((a, b) => a[1].successRate - b[1].successRate)[0];
        if (weakest[1].successRate < 80) {
            return {
                section: weakest[0],
                reason: `שפר את ${getSectionName(weakest[0])} - ${Math.round(weakest[1].successRate)}% דיוק`,
                priority: "high",
            };
        }
    }

    // Priority 3: Not practiced recently
    const oldestPractice = sections
        .filter(([_, stats]) => stats.lastPracticed !== null)
        .sort((a, b) => {
            const aTime = a[1].lastPracticed || 0;
            const bTime = b[1].lastPracticed || 0;
            return aTime - bTime;
        })[0];

    if (oldestPractice) {
        return {
            section: oldestPractice[0],
            reason: `רענן את ${getSectionName(oldestPractice[0])} - לא תרגלת לאחרונה`,
            priority: "medium",
        };
    }

    // Default: suggest the first section
    return {
        section: "Subjective",
        reason: "המשך לתרגל כדי לשמור על הקצב",
        priority: "low",
    };
}

/**
 * Get top error types for a section
 */
export function getTopErrors(
    sectionStats: SectionStats,
    limit: number = 3
): { type: ErrorType; percentage: number; count: number }[] {
    const total = sectionStats.commonErrors.reduce((sum, e) => sum + e.count, 0);
    if (total === 0) return [];

    return sectionStats.commonErrors
        .map((error) => ({
            type: error.type,
            count: error.count,
            percentage: (error.count / total) * 100,
        }))
        .slice(0, limit);
}

/**
 * Get error type display name in Hebrew
 */
export function getErrorTypeName(errorType: ErrorType): string {
    const names: Record<ErrorType, string> = {
        missing_word: "מילה חסרה",
        extra_word: "מילה מיותרת",
        wrong_order: "סדר מילים שגוי",
        spelling_error: "שגיאת כתיב",
        missing_punctuation: "פיסוק חסר",
    };
    return names[errorType];
}

/**
 * Determine performance level based on success rate
 */
export function getPerformanceLevel(successRate: number): {
    level: "excellent" | "good" | "needs-improvement" | "beginner";
    color: string;
    message: string;
} {
    if (successRate >= 90) {
        return {
            level: "excellent",
            color: "text-green-600",
            message: "מצוין! ⭐",
        };
    } else if (successRate >= 75) {
        return {
            level: "good",
            color: "text-blue-600",
            message: "טוב מאוד 👍",
        };
    } else if (successRate >= 50) {
        return {
            level: "needs-improvement",
            color: "text-yellow-600",
            message: "יש מקום לשיפור 📈",
        };
    } else {
        return {
            level: "beginner",
            color: "text-orange-600",
            message: "המשך לתרגל 💪",
        };
    }
}
