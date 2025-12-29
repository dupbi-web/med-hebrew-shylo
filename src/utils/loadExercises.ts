/**
 * Exercise Data Loading Utility
 * Loads and manages SOAP exercise data from JSON
 */

import { SOAPExercise } from "@/types/soapGame";

/**
 * Load all exercises from the JSON file
 */
export async function loadExercises(): Promise<SOAPExercise[]> {
    try {
        const response = await fetch("/data/soapExercises.json");
        if (!response.ok) {
            throw new Error("Failed to load exercises");
        }
        const data = await response.json();
        return data.exercises || [];
    } catch (error) {
        console.error("Error loading exercises:", error);
        return [];
    }
}

/**
 * Get a random exercise from the list
 */
export function getRandomExercise(exercises: SOAPExercise[]): SOAPExercise | null {
    if (exercises.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * exercises.length);
    return exercises[randomIndex];
}

/**
 * Filter exercises by SOAP section
 */
export function filterBySection(
    exercises: SOAPExercise[],
    section: string
): SOAPExercise[] {
    if (section === "all") return exercises;
    return exercises.filter((ex) => ex.soapSection === section);
}

/**
 * Filter exercises by difficulty level
 */
export function filterByDifficulty(
    exercises: SOAPExercise[],
    level: string
): SOAPExercise[] {
    if (level === "all") return exercises;
    return exercises.filter((ex) => ex.difficulty.level === level);
}

/**
 * Get exercise by ID
 */
export function getExerciseById(
    exercises: SOAPExercise[],
    id: string
): SOAPExercise | null {
    return exercises.find((ex) => ex.id === id) || null;
}
