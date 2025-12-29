import { ValidationResult } from "@/types/soapGame";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeedbackDisplayProps {
    result: ValidationResult;
    expectedSentence: string;
    onContinue: () => void;
}

const ERROR_TYPE_LABELS: Record<string, string> = {
    missing_word: "מילה חסרה",
    extra_word: "מילה מיותרת",
    wrong_order: "סדר שגוי",
    spelling_error: "שגיאת כתיב",
    missing_punctuation: "חסר פיסוק",
};

export default function FeedbackDisplay({
    result,
    expectedSentence,
    onContinue,
}: FeedbackDisplayProps) {
    const { isCorrect, errors, normalizedInput, timeTaken } = result;

    return (
        <div className="bg-card border rounded-xl p-6 shadow-lg">
            {/* Result Header */}
            <div className="flex items-center gap-3 mb-6">
                {isCorrect ? (
                    <>
                        <CheckCircle2 className="w-8 h-8 text-green-500" />
                        <div>
                            <h3 className="text-xl font-bold text-green-600 dark:text-green-400">
                                מצוין! התשובה נכונה
                            </h3>
                            {timeTaken !== undefined && (
                                <p className="text-sm text-muted-foreground">
                                    הושלם ב-{timeTaken} שניות
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <XCircle className="w-8 h-8 text-red-500" />
                        <div>
                            <h3 className="text-xl font-bold text-red-600 dark:text-red-400">
                                לא מדויק
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                נמצאו {errors.length} שגיאות
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Show errors if any */}
            {!isCorrect && errors.length > 0 && (
                <div className="mb-6">
                    <h4 className="font-semibold mb-3 flex items-center gap-2" dir="rtl">
                        <AlertCircle className="w-5 h-5" />
                        שגיאות שנמצאו:
                    </h4>
                    <div className="space-y-2">
                        {errors.map((error, index) => (
                            <div
                                key={index}
                                className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg"
                                dir="rtl"
                            >
                                <div className="flex items-start gap-2">
                                    <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs font-semibold">
                                        {ERROR_TYPE_LABELS[error.type] || error.type}
                                    </span>
                                    <p className="text-sm flex-1">{error.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Show comparison */}
            <div className="space-y-4 mb-6">
                {!isCorrect && (
                    <div className="space-y-2">
                        <div className="p-3 bg-muted/50 rounded-lg" dir="rtl">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">
                                התשובה שלך:
                            </p>
                            <p className="text-lg">{normalizedInput || "(ריק)"}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg" dir="rtl">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">
                                התשובה הנכונה:
                            </p>
                            <p className="text-lg font-medium text-green-800 dark:text-green-200">
                                {expectedSentence}
                            </p>
                        </div>
                    </div>
                )}

                {isCorrect && (
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg" dir="rtl">
                        <p className="text-lg font-medium text-green-800 dark:text-green-200">
                            {expectedSentence}
                        </p>
                    </div>
                )}
            </div>

            {/* Continue Button */}
            <Button onClick={onContinue} size="lg" className="w-full">
                {isCorrect ? "המשך לתרגיל הבא" : "נסה שוב"}
            </Button>
        </div>
    );
}
