import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { SOAPExercise, ValidationResult, GameState } from "@/types/soapGame";
import { loadExercises, getRandomExercise } from "@/utils/loadExercises";
import { validateSentence } from "@/utils/soapValidation";
import BackStoryDisplay from "@/components/soap/BackStoryDisplay";
import TypingInterface from "@/components/soap/TypingInterface";
import FeedbackDisplay from "@/components/soap/FeedbackDisplay";
import TimerDisplay from "@/components/soap/TimerDisplay";
import { FileText, Play } from "lucide-react";

export default function SOAPGame() {
    const [exercises, setExercises] = useState<SOAPExercise[]>([]);
    const [currentExercise, setCurrentExercise] = useState<SOAPExercise | null>(null);
    const [gameState, setGameState] = useState<GameState>("menu");
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const [startTime, setStartTime] = useState<number | null>(null);
    const [endTime, setEndTime] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load exercises on mount
    useEffect(() => {
        const init = async () => {
            const loadedExercises = await loadExercises();
            setExercises(loadedExercises);
            setIsLoading(false);
        };
        init();
    }, []);

    const startNewExercise = () => {
        const exercise = getRandomExercise(exercises);
        if (!exercise) return;

        setCurrentExercise(exercise);
        setGameState("backstory");
        setValidationResult(null);
        setStartTime(null);
        setEndTime(null);
    };

    const startTyping = () => {
        setGameState("typing");
        setStartTime(Date.now());
    };

    const handleSubmit = (input: string) => {
        if (!currentExercise) return;

        const end = Date.now();
        setEndTime(end);

        const result = validateSentence(
            input,
            currentExercise.sentence,
            currentExercise.validation
        );

        // Add time taken to result
        if (startTime) {
            result.timeTaken = Math.floor((end - startTime) / 1000);
        }

        setValidationResult(result);
        setGameState("feedback");
    };

    const handleContinue = () => {
        if (validationResult?.isCorrect) {
            // Move to next exercise
            startNewExercise();
        } else {
            // Try again
            setGameState("typing");
            setStartTime(Date.now());
            setEndTime(null);
            setValidationResult(null);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">טוען תרגילים...</p>
                </div>
            </div>
        );
    }

    if (exercises.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
                <div className="text-center max-w-md">
                    <p className="text-lg text-muted-foreground mb-4">
                        לא נמצאו תרגילים. אנא ודא שקובץ הנתונים זמין.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>SOAP Writing Practice - Medical Hebrew Hub</title>
                <meta
                    name="description"
                    content="Practice writing medical SOAP notes in Hebrew"
                />
            </Helmet>

            <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
                <section className="container py-8 md:py-12">
                    <div className="max-w-3xl mx-auto">
                        {/* Menu State */}
                        {gameState === "menu" && (
                            <div className="text-center">
                                <header className="mb-8">
                                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <FileText className="w-10 h-10 text-primary" />
                                    </div>
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                                        תרגול כתיבת SOAP
                                    </h1>
                                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto" dir="rtl">
                                        תרגל כתיבה מדויקת של משפטי מעקב רפואי בעברית עם דגש על הקלדה, מבנה ונכונות
                                    </p>
                                </header>

                                <div className="bg-card border rounded-2xl p-8 shadow-lg">
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-semibold mb-4">איך זה עובד?</h2>
                                        <div className="space-y-3 text-right" dir="rtl">
                                            <div className="flex items-start gap-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                                                    1
                                                </span>
                                                <p className="flex-1 text-muted-foreground">
                                                    קרא את התרחיש הרפואי
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                                                    2
                                                </span>
                                                <p className="flex-1 text-muted-foreground">
                                                    הקלד את המשפט הנכון עם הצעות השלמה אוטומטית
                                                </p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0">
                                                    3
                                                </span>
                                                <p className="flex-1 text-muted-foreground">
                                                    קבל משוב מיידי על דיוק ומהירות
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button onClick={startNewExercise} size="lg" className="text-lg px-8 py-6">
                                        <Play className="w-5 h-5 ml-2" />
                                        התחל תרגול
                                    </Button>

                                    <p className="text-sm text-muted-foreground mt-4">
                                        {exercises.length} תרגילים זמינים
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Backstory State */}
                        {gameState === "backstory" && currentExercise && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold">תרגיל חדש</h2>
                                </div>

                                <BackStoryDisplay
                                    soapSection={currentExercise.soapSection}
                                    backStory={currentExercise.backStory}
                                    taskInstruction={currentExercise.task.instruction}
                                />

                                <div className="flex justify-center">
                                    <Button onClick={startTyping} size="lg">
                                        התחל להקליד
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Typing State */}
                        {gameState === "typing" && currentExercise && (
                            <div className="space-y-6">
                                <div className="bg-card border rounded-xl p-4 shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{currentExercise.soapSection}</h3>
                                        <TimerDisplay startTime={startTime} endTime={endTime} />
                                    </div>
                                </div>

                                <BackStoryDisplay
                                    soapSection={currentExercise.soapSection}
                                    backStory={currentExercise.backStory}
                                    taskInstruction={currentExercise.task.instruction}
                                    allowToggle={true}
                                />

                                <div className="bg-card border rounded-xl p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-4 text-right" dir="rtl">
                                        הקלד את המשפט:
                                    </h3>
                                    <TypingInterface
                                        wordBank={currentExercise.wordBank.words}
                                        onSubmit={handleSubmit}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Feedback State */}
                        {gameState === "feedback" && validationResult && currentExercise && (
                            <div className="space-y-6">
                                <FeedbackDisplay
                                    result={validationResult}
                                    expectedSentence={currentExercise.sentence.expected}
                                    onContinue={handleContinue}
                                />
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </>
    );
}
