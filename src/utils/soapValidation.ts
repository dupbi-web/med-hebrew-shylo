/**
 * SOAP Sentence Validation Engine
 * Implements strict rule-based validation for medical sentence writing practice
 */

import {
    ValidationResult,
    TokenError,
    ErrorType,
    SentenceDefinition,
    ValidationRules,
} from "@/types/soapGame";
import {
    normalizeText,
    tokenizeSentence,
    areSimilarWords,
} from "./hebrewTextUtils";

/**
 * Main validation function
 * Validates user input against expected sentence with strict rules
 */
export function validateSentence(
    input: string,
    sentenceDefinition: SentenceDefinition,
    validationRules: ValidationRules
): ValidationResult {
    const normalizedInput = normalizeText(input);
    const normalizedExpected = normalizeText(sentenceDefinition.expected);

    // Tokenize both sentences
    const inputTokens = tokenizeSentence(normalizedInput);
    const expectedTokens = sentenceDefinition.tokens.map((t) => normalizeText(t));

    // Detect errors
    const errors = detectErrors(inputTokens, expectedTokens, validationRules);

    return {
        isCorrect: errors.length === 0,
        errors,
        normalizedInput,
        normalizedExpected,
    };
}

/**
 * Detect all errors between input and expected tokens
 */
function detectErrors(
    inputTokens: string[],
    expectedTokens: string[],
    rules: ValidationRules
): TokenError[] {
    const errors: TokenError[] = [];

    // Check if completely empty
    if (inputTokens.length === 0) {
        errors.push({
            type: "missing_word",
            position: 0,
            message: "לא הוקלד טקסט (No text entered)",
        });
        return errors;
    }

    // If exact match, no errors
    if (inputTokens.length === expectedTokens.length) {
        let allMatch = true;
        for (let i = 0; i < inputTokens.length; i++) {
            if (inputTokens[i] !== expectedTokens[i]) {
                allMatch = false;
                break;
            }
        }
        if (allMatch) return errors;
    }

    // Use dynamic programming approach for alignment
    const alignment = alignTokens(inputTokens, expectedTokens, rules);

    // Process alignment to identify specific errors
    for (const item of alignment) {
        if (item.error) {
            errors.push(item.error);
        }
    }

    return errors;
}

/**
 * Alignment item for comparing tokens
 */
interface AlignmentItem {
    inputToken?: string;
    expectedToken?: string;
    inputIndex?: number;
    expectedIndex?: number;
    error?: TokenError;
}

/**
 * Align input tokens with expected tokens to identify errors
 * Uses a simple matching algorithm
 */
function alignTokens(
    inputTokens: string[],
    expectedTokens: string[],
    rules: ValidationRules
): AlignmentItem[] {
    const alignment: AlignmentItem[] = [];
    let inputIdx = 0;
    let expectedIdx = 0;

    while (inputIdx < inputTokens.length || expectedIdx < expectedTokens.length) {
        const inputToken = inputTokens[inputIdx];
        const expectedToken = expectedTokens[expectedIdx];

        // Both exist
        if (inputToken !== undefined && expectedToken !== undefined) {
            if (inputToken === expectedToken) {
                // Exact match
                alignment.push({
                    inputToken,
                    expectedToken,
                    inputIndex: inputIdx,
                    expectedIndex: expectedIdx,
                });
                inputIdx++;
                expectedIdx++;
            } else if (
                rules.allowSpellingErrors &&
                areSimilarWords(inputToken, expectedToken)
            ) {
                // Spelling error (similar but not exact)
                alignment.push({
                    inputToken,
                    expectedToken,
                    inputIndex: inputIdx,
                    expectedIndex: expectedIdx,
                    error: {
                        type: "spelling_error",
                        position: inputIdx,
                        expected: expectedToken,
                        actual: inputToken,
                        message: `שגיאת כתיב: "${inputToken}" במקום "${expectedToken}"`,
                    },
                });
                inputIdx++;
                expectedIdx++;
            } else {
                // Check if it's a wrong order issue
                // Look ahead to see if this input token appears later in expected
                const foundLaterInExpected = expectedTokens
                    .slice(expectedIdx + 1)
                    .findIndex((t) => t === inputToken);

                if (foundLaterInExpected !== -1) {
                    // Wrong order - input token appears later in expected
                    alignment.push({
                        inputToken,
                        expectedToken,
                        inputIndex: inputIdx,
                        expectedIndex: expectedIdx,
                        error: {
                            type: "wrong_order",
                            position: inputIdx,
                            expected: expectedToken,
                            actual: inputToken,
                            message: `סדר מילים שגוי: "${inputToken}" במיקום לא נכון`,
                        },
                    });
                    inputIdx++;
                } else {
                    // Extra word or wrong word
                    alignment.push({
                        inputToken,
                        expectedToken,
                        inputIndex: inputIdx,
                        expectedIndex: expectedIdx,
                        error: {
                            type: "extra_word",
                            position: inputIdx,
                            actual: inputToken,
                            expected: expectedToken,
                            message: `מילה לא צפויה: "${inputToken}" (צפוי: "${expectedToken}")`,
                        },
                    });
                    inputIdx++;
                }
            }
        } else if (inputToken !== undefined) {
            // Extra token at the end
            alignment.push({
                inputToken,
                inputIndex: inputIdx,
                error: {
                    type: "extra_word",
                    position: inputIdx,
                    actual: inputToken,
                    message: `מילה מיותרת: "${inputToken}"`,
                },
            });
            inputIdx++;
        } else if (expectedToken !== undefined) {
            // Missing token
            const isPunctuation = /[.,;:!?،؛]/.test(expectedToken);
            alignment.push({
                expectedToken,
                expectedIndex: expectedIdx,
                error: {
                    type: isPunctuation ? "missing_punctuation" : "missing_word",
                    position: expectedIdx,
                    expected: expectedToken,
                    message: isPunctuation
                        ? `חסר סימן פיסוק: "${expectedToken}"`
                        : `מילה חסרה: "${expectedToken}"`,
                },
            });
            expectedIdx++;
        }
    }

    return alignment;
}

/**
 * Generate highlighted diff for display
 * Returns HTML-safe string with markers for differences
 */
export function highlightDifferences(
    input: string,
    expected: string
): { inputHighlighted: string; expectedHighlighted: string } {
    const inputTokens = tokenizeSentence(normalizeText(input));
    const expectedTokens = tokenizeSentence(normalizeText(expected));

    let inputHighlighted = "";
    let expectedHighlighted = "";

    const maxLen = Math.max(inputTokens.length, expectedTokens.length);

    for (let i = 0; i < maxLen; i++) {
        const inputToken = inputTokens[i];
        const expectedToken = expectedTokens[i];

        if (inputToken !== undefined) {
            if (inputToken === expectedToken) {
                inputHighlighted += inputToken + " ";
            } else {
                inputHighlighted += `<mark class="bg-red-200 dark:bg-red-900">${inputToken}</mark> `;
            }
        }

        if (expectedToken !== undefined) {
            if (inputToken === expectedToken) {
                expectedHighlighted += expectedToken + " ";
            } else {
                expectedHighlighted += `<mark class="bg-green-200 dark:bg-green-900">${expectedToken}</mark> `;
            }
        }
    }

    return {
        inputHighlighted: inputHighlighted.trim(),
        expectedHighlighted: expectedHighlighted.trim(),
    };
}
