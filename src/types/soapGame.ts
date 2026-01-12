/**
 * Type definitions for SOAP Note Sentence Typing Game
 * Matches the JSON schema defined in the product requirements
 */

export type SOAPSection = "Subjective" | "Objective" | "Assessment" | "Plan";

export type ErrorType =
    | "missing_word"
    | "extra_word"
    | "wrong_order"
    | "spelling_error"
    | "missing_punctuation";

export interface BackStory {
    type: "paragraph";
    text: string[];
}

export interface Task {
    instruction: string;
}

export interface SentenceDefinition {
    expected: string;
    tokens: string[];
    punctuationRequired: boolean;
    exactOrderRequired: boolean;
    exactGrammarRequired: boolean;
}

export interface WordBank {
    words: string[];
    suggestionMode: "autocomplete-only";
}

export interface ValidationRules {
    allowSpellingErrors: boolean;
    markErrorsOnSubmit: boolean;
    errorTypes: ErrorType[];
}

export interface Timing {
    enableTimer: boolean;
    startOn: "story_shown";
}

export interface Difficulty {
    level: string;
    note: string;
}

export interface SOAPExercise {
    id: string;
    language: "he";
    soapSection: SOAPSection;
    backStory: BackStory;
    task: Task;
    sentence: SentenceDefinition;
    wordBank: WordBank;
    validation: ValidationRules;
    timing: Timing;
    difficulty: Difficulty;
}

/**
 * Validation result structure
 */
export interface TokenError {
    type: ErrorType;
    position: number;
    expected?: string;
    actual?: string;
    message: string;
}

export interface ValidationResult {
    isCorrect: boolean;
    errors: TokenError[];
    normalizedInput: string;
    normalizedExpected: string;
    timeTaken?: number;
}

/**
 * Game state types
 */
export type GameState = "menu" | "backstory" | "typing" | "feedback" | "completed";

export interface GameStats {
    exerciseId: string;
    attempts: number;
    startTime: number;
    endTime?: number;
    isCorrect: boolean;
}

/**
 * Filter and preference types for letter selection
 */
export type FilterMode = "all" | SOAPSection;

export interface UserPreferences {
    selectedFilter: FilterMode;
    lastUpdated: number;
}

/**
 * Progress tracking types for Phase 2
 */
export interface ExerciseAttempt {
    exerciseId: string;
    soapSection: SOAPSection;
    timestamp: number;
    isCorrect: boolean;
    timeTaken: number; // in seconds
    errorCount: number;
    errorTypes: ErrorType[];
}

export interface SectionStats {
    section: SOAPSection;
    totalAttempts: number;
    successfulAttempts: number;
    successRate: number; // 0-100
    averageTime: number; // average seconds per exercise
    lastPracticed: number | null; // timestamp
    totalTimeTaken: number; // cumulative time in seconds
    commonErrors: { type: ErrorType; count: number }[];
}

export interface OverallProgress {
    totalExercisesCompleted: number;
    totalTimeSpent: number; // in seconds
    currentStreak: number; // consecutive days practicing
    lastPracticeDate: number | null;
    sectionStats: Record<SOAPSection, SectionStats>;
    lastUpdated: number;
}

