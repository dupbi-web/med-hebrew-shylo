import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { normalizeText } from "@/utils/hebrewTextUtils";
import WordBankDisplay from "./WordBankDisplay";

interface TypingInterfaceProps {
    wordBank: string[];
    onSubmit: (input: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export default function TypingInterface({
    wordBank,
    onSubmit,
    disabled = false,
    placeholder = "התחל להקליד כאן...",
}: TypingInterfaceProps) {
    const [input, setInput] = useState("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    // Track which words from the word bank have been used in the input
    const usedWords = useMemo(() => {
        const words = input.split(" ");
        return new Set(words.filter((w) => w.trim()).map((w) => normalizeText(w)));
    }, [input]);

    // Update suggestions when input changes
    useEffect(() => {
        if (!input.trim()) {
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
            return;
        }

        // Get the last word being typed
        const words = input.split(" ");
        const currentWord = words[words.length - 1];

        if (!currentWord) {
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
            return;
        }

        // Filter word bank for matches
        const normalizedCurrent = normalizeText(currentWord);
        const matches = wordBank
            .filter((word) => {
                const normalizedWord = normalizeText(word);
                return normalizedWord.startsWith(normalizedCurrent);
            })
            .slice(0, 5); // Limit to 5 suggestions

        setSuggestions(matches);
        setSelectedSuggestionIndex(-1);
    }, [input, wordBank]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                applySuggestion(suggestions[selectedSuggestionIndex]);
            } else {
                handleSubmit();
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === "Escape") {
            setSuggestions([]);
            setSelectedSuggestionIndex(-1);
        }
    };

    const applySuggestion = (suggestion: string) => {
        const words = input.split(" ");
        words[words.length - 1] = suggestion;
        setInput(words.join(" ") + " ");
        setSuggestions([]);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.focus();
    };

    const handleWordBankClick = (word: string) => {
        // Insert word at the end of current input
        const trimmedInput = input.trim();
        setInput(trimmedInput ? `${trimmedInput} ${word} ` : `${word} `);
        inputRef.current?.focus();
    };

    const handleSubmit = () => {
        if (input.trim()) {
            onSubmit(input);
            setInput("");
            setSuggestions([]);
        }
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <div className="space-y-4">
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            dir="rtl"
                            placeholder={placeholder}
                            className="w-full h-16 px-4 text-lg border-2 border-input rounded-lg bg-background text-right focus:ring-2 focus:ring-ring focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            autoFocus
                        />

                        {/* Autocomplete Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => applySuggestion(suggestion)}
                                        className={`w-full px-4 py-2 text-right hover:bg-muted transition-colors ${index === selectedSuggestionIndex ? "bg-muted" : ""
                                            }`}
                                        dir="rtl"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={disabled || !input.trim()}
                            size="lg"
                            className="flex-1"
                        >
                            שלח תשובה
                        </Button>
                    </div>

                    {suggestions.length === 0 && input.trim() && (
                        <p className="text-xs text-muted-foreground text-center" dir="rtl">
                            השתמש במקשי החצים לניווט בין הצעות
                        </p>
                    )}
                </div>
            </div>

            {/* Word Bank Display */}
            <WordBankDisplay
                words={wordBank}
                onWordClick={handleWordBankClick}
                usedWords={usedWords}
            />
        </div>
    );
}
