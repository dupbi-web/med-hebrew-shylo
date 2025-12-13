import { useRef } from 'react';

/**
 * Custom hook for client-side rate limiting
 * @param maxAttempts - Maximum number of attempts allowed
 * @param windowMs - Time window in milliseconds
 * @returns Function to check if action is rate limited
 */
export const useRateLimit = (maxAttempts: number, windowMs: number) => {
    const attempts = useRef<number[]>([]);

    const checkLimit = (): boolean => {
        const now = Date.now();

        // Remove attempts outside the time window
        attempts.current = attempts.current.filter(timestamp => now - timestamp < windowMs);

        // Check if we've exceeded the limit
        if (attempts.current.length >= maxAttempts) {
            return false; // Rate limited
        }

        // Record this attempt
        attempts.current.push(now);
        return true; // Allowed
    };

    const getRemainingTime = (): number => {
        if (attempts.current.length < maxAttempts) {
            return 0;
        }

        const oldestAttempt = attempts.current[0];
        const timeElapsed = Date.now() - oldestAttempt;
        return Math.max(0, windowMs - timeElapsed);
    };

    return { checkLimit, getRemainingTime };
};
