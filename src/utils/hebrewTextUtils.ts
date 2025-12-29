/**
 * Hebrew Text Processing Utilities
 * Handles Hebrew-specific text normalization, tokenization, and validation
 */

/**
 * Hebrew niqqud (vowel points) Unicode ranges
 */
const NIQQUD_REGEX = /[\u0591-\u05C7]/g;

/**
 * Hebrew letters regex (including final forms)
 */
const HEBREW_LETTER_REGEX = /[\u05D0-\u05EA]/;

/**
 * Hebrew prefixes that attach to words
 */
const HEBREW_PREFIXES = ['ו', 'ה', 'ב', 'ל', 'כ', 'מ', 'ש'];

/**
 * Hebrew final letter mappings (final form -> regular form)
 */
const FINAL_LETTER_MAP: Record<string, string> = {
    'ך': 'כ',
    'ם': 'מ',
    'ן': 'נ',
    'ף': 'פ',
    'ץ': 'צ'
};

/**
 * Remove niqqud (vowel points) from Hebrew text
 */
export function stripNiqqud(text: string): string {
    return text.replace(NIQQUD_REGEX, '');
}

/**
 * Normalize Unicode characters to canonical form
 */
export function normalizeUnicode(text: string): string {
    return text.normalize('NFC');
}

/**
 * Normalize whitespace: collapse multiple spaces, remove leading/trailing
 */
export function normalizeWhitespace(text: string): string {
    return text
        .replace(/\s+/g, ' ') // Collapse multiple whitespace to single space
        .trim(); // Remove leading/trailing whitespace
}

/**
 * Normalize text for comparison: strip niqqud, normalize unicode, normalize whitespace
 */
export function normalizeText(text: string): string {
    return normalizeWhitespace(normalizeUnicode(stripNiqqud(text)));
}

/**
 * Check if a character is a final Hebrew letter
 */
export function isFinalLetter(char: string): boolean {
    return char in FINAL_LETTER_MAP;
}

/**
 * Check if a word starts with a Hebrew prefix
 */
export function hasPrefix(word: string): boolean {
    if (word.length === 0) return false;
    return HEBREW_PREFIXES.includes(word[0]);
}

/**
 * Tokenize a sentence into words and punctuation
 * Punctuation is treated as separate tokens
 * Words with Hebrew prefixes are kept as single tokens
 */
export function tokenizeSentence(sentence: string): string[] {
    // First normalize the text
    const normalized = normalizeText(sentence);

    if (!normalized) return [];

    // Split by spaces first
    const spaceSplit = normalized.split(' ');

    const tokens: string[] = [];

    for (const part of spaceSplit) {
        if (!part) continue;

        // Check if this part contains punctuation
        // We'll extract punctuation as separate tokens
        let currentToken = '';

        for (let i = 0; i < part.length; i++) {
            const char = part[i];

            // Check if it's punctuation
            if (/[.,;:!?،؛]/.test(char)) {
                // Push current token if exists
                if (currentToken) {
                    tokens.push(currentToken);
                    currentToken = '';
                }
                // Push punctuation as separate token
                tokens.push(char);
            } else {
                currentToken += char;
            }
        }

        // Push remaining token if exists
        if (currentToken) {
            tokens.push(currentToken);
        }
    }

    return tokens;
}

/**
 * Compare two sentences for exact match after normalization
 */
export function compareSentences(input: string, expected: string): boolean {
    const normalizedInput = normalizeText(input);
    const normalizedExpected = normalizeText(expected);
    return normalizedInput === normalizedExpected;
}

/**
 * Check if a string is Hebrew text
 */
export function isHebrewText(text: string): boolean {
    return HEBREW_LETTER_REGEX.test(text);
}

/**
 * Calculate Levenshtein distance for spelling error detection
 */
export function levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    return matrix[len1][len2];
}

/**
 * Check if two words are similar (potential spelling error)
 * Returns true if Levenshtein distance <= 2
 */
export function areSimilarWords(word1: string, word2: string): boolean {
    const normalized1 = normalizeText(word1);
    const normalized2 = normalizeText(word2);

    if (normalized1 === normalized2) return true;

    const distance = levenshteinDistance(normalized1, normalized2);
    return distance <= 2;
}
