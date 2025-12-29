import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordBankDisplayProps {
    words: string[];
    onWordClick?: (word: string) => void;
    usedWords?: Set<string>;
}

export default function WordBankDisplay({
    words,
    onWordClick,
    usedWords = new Set(),
}: WordBankDisplayProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div className="bg-card border rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground" dir="rtl">
                    בנק מילים ({words.length} מילים)
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="h-8"
                >
                    {isExpanded ? (
                        <>
                            <ChevronUp className="w-4 h-4 ml-1" />
                            <span className="text-xs">הסתר</span>
                        </>
                    ) : (
                        <>
                            <ChevronDown className="w-4 h-4 ml-1" />
                            <span className="text-xs">הצג</span>
                        </>
                    )}
                </Button>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2" dir="rtl">
                    {words.map((word, index) => {
                        const isUsed = usedWords.has(word);
                        return (
                            <button
                                key={index}
                                onClick={() => onWordClick?.(word)}
                                className={`
                  px-3 py-2 rounded-lg text-sm font-medium text-right
                  transition-all duration-200
                  ${isUsed
                                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700"
                                        : "bg-muted hover:bg-muted/80 text-foreground border border-border"
                                    }
                  ${onWordClick ? "cursor-pointer hover:scale-105 hover:shadow-sm" : "cursor-default"}
                `}
                                dir="rtl"
                                disabled={!onWordClick}
                            >
                                {word}
                            </button>
                        );
                    })}
                </div>
            )}

            {isExpanded && (
                <p className="text-xs text-muted-foreground mt-3 text-center" dir="rtl">
                    {onWordClick ? "לחץ על מילה להוספתה לטקסט" : "השתמש במילים המוצעות להשלמת המשפט"}
                </p>
            )}
        </div>
    );
}
