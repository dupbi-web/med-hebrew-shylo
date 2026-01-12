/**
 * User Preferences Management
 * Handles localStorage for user settings and preferences
 */

import { UserPreferences, FilterMode } from "@/types/soapGame";

const PREFERENCES_KEY = "soap-game-preferences";

const DEFAULT_PREFERENCES: UserPreferences = {
    selectedFilter: "all",
    lastUpdated: Date.now(),
};

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
    try {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        if (!stored) return DEFAULT_PREFERENCES;

        const parsed = JSON.parse(stored) as UserPreferences;
        return {
            ...DEFAULT_PREFERENCES,
            ...parsed,
        };
    } catch (error) {
        console.error("Error loading preferences:", error);
        return DEFAULT_PREFERENCES;
    }
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: UserPreferences): void {
    try {
        const toSave: UserPreferences = {
            ...preferences,
            lastUpdated: Date.now(),
        };
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(toSave));
    } catch (error) {
        console.error("Error saving preferences:", error);
    }
}

/**
 * Update filter selection
 */
export function updateFilter(filter: FilterMode): void {
    const preferences = loadPreferences();
    savePreferences({
        ...preferences,
        selectedFilter: filter,
    });
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): void {
    localStorage.removeItem(PREFERENCES_KEY);
}
