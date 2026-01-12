import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock, Award } from 'lucide-react';
import { useSOAPExercises } from '@/hooks/queries/useSOAPExercises';
import { useSaveTestResult, type ExerciseResult } from '@/hooks/queries/useSOAPTestResults';
import { useToast } from '@/hooks/use-toast';

interface SOAPExerciseTestProps {
    soapSection?: string;
    difficulty?: string;
    maxExercises?: number;
}

export const SOAPExerciseTest: React.FC<SOAPExerciseTestProps> = ({
    soapSection,
    difficulty,
    maxExercises,
}) => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fetch exercises
    const { data: exercises, isLoading, error } = useSOAPExercises({ soapSection, difficulty });
    const saveTestResult = useSaveTestResult();

    // State management
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [exerciseResults, setExerciseResults] = useState<ExerciseResult[]>([]);
    const [exerciseStartTime, setExerciseStartTime] = useState<number>(Date.now());
    const [testStartTime] = useState<number>(Date.now());
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [testCompleted, setTestCompleted] = useState(false);

    // Get limited exercises if maxExercises is specified
    const limitedExercises = useMemo(() => {
        if (!exercises) return [];
        return maxExercises ? exercises.slice(0, maxExercises) : exercises;
    }, [exercises, maxExercises]);

    const currentExercise = limitedExercises[currentIndex];

    // Calculate elapsed time
    const [elapsedTime, setElapsedTime] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - exerciseStartTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [exerciseStartTime]);

    // Reset exercise start time when moving to next exercise
    useEffect(() => {
        setExerciseStartTime(Date.now());
        setUserAnswer('');
        setIsSubmitted(false);
        setElapsedTime(0);
    }, [currentIndex]);

    const validateAnswer = (answer: string, expected: string): { isCorrect: boolean; errors: string[] } => {
        const errors: string[] = [];
        const normalizedAnswer = answer.trim().toLowerCase();
        const normalizedExpected = expected.trim().toLowerCase();

        const isCorrect = normalizedAnswer === normalizedExpected;

        if (!isCorrect) {
            const answerTokens = normalizedAnswer.split(/\s+/);
            const expectedTokens = normalizedExpected.split(/\s+/);

            if (answerTokens.length !== expectedTokens.length) {
                errors.push('wrong_word_count');
            }
            if (currentExercise?.sentence.exactOrderRequired) {
                for (let i = 0; i < Math.min(answerTokens.length, expectedTokens.length); i++) {
                    if (answerTokens[i] !== expectedTokens[i]) {
                        errors.push('wrong_order');
                        break;
                    }
                }
            }
            if (currentExercise?.sentence.punctuationRequired && !answer.includes('.')) {
                errors.push('missing_punctuation');
            }
        }

        return { isCorrect, errors };
    };

    const handleSubmitAnswer = () => {
        if (!currentExercise) return;

        const timeSpent = Math.floor((Date.now() - exerciseStartTime) / 1000);
        const { isCorrect, errors } = validateAnswer(userAnswer, currentExercise.sentence.expected);

        const result: ExerciseResult = {
            exerciseId: currentExercise.id,
            userAnswer,
            expectedAnswer: currentExercise.sentence.expected,
            isCorrect,
            timeSpent,
            errors: errors.length > 0 ? errors : undefined,
        };

        setExerciseResults([...exerciseResults, result]);
        setIsSubmitted(true);
    };

    const handleNextExercise = () => {
        if (currentIndex < limitedExercises.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            completeTest();
        }
    };

    const completeTest = async () => {
        const totalTimeSeconds = Math.floor((Date.now() - testStartTime) / 1000);
        const exercisesCorrect = exerciseResults.filter(r => r.isCorrect).length;

        const averageTime = exerciseResults.length > 0 ? totalTimeSeconds / exerciseResults.length : 0;

        try {
            await saveTestResult.mutateAsync({
                exercises_attempted: exerciseResults.length,
                exercises_correct: exercisesCorrect,
                total_time_seconds: totalTimeSeconds,
                average_time_per_exercise: Math.round(averageTime * 100) / 100,
                exercises_data: exerciseResults,
            });

            setTestCompleted(true);

            toast({
                title: 'Test Completed!',
                description: `You scored ${exercisesCorrect}/${exerciseResults.length}`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save test results. Please try again.',
                variant: 'destructive',
            });
            console.error('Error saving test results:', error);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Failed to load exercises. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    // No exercises found
    if (!exercises || exercises.length === 0) {
        return (
            <Alert>
                <AlertDescription>
                    No exercises found for the selected criteria.
                </AlertDescription>
            </Alert>
        );
    }

    // Test completed screen
    if (testCompleted) {
        const score = exerciseResults.filter(r => r.isCorrect).length;
        const total = exerciseResults.length;
        const percentage = Math.round((score / total) * 100);
        const passed = percentage >= 70;

        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        {passed ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                        ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                        )}
                        Test Completed!
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center">
                        <div className="text-6xl font-bold mb-2">
                            {percentage}%
                        </div>
                        <div className="text-xl text-muted-foreground">
                            {score} out of {total} correct
                        </div>
                    </div>

                    <div className="flex justify-center gap-8 pt-4">
                        <div className="text-center">
                            <Award className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <div className="text-sm text-muted-foreground">Status</div>
                            <div className="font-semibold">{passed ? 'Passed' : 'Failed'}</div>
                        </div>
                        <div className="text-center">
                            <Clock className="w-8 h-8 mx-auto mb-2 text-primary" />
                            <div className="text-sm text-muted-foreground">Total Time</div>
                            <div className="font-semibold">
                                {Math.floor((Date.now() - testStartTime) / 1000)}s
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={() => navigate('/soap-results')} className="flex-1">
                            View All Results
                        </Button>
                        <Button onClick={() => window.location.reload()} variant="outline" className="flex-1">
                            Take Another Test
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Test in progress
    const currentResult = isSubmitted ? exerciseResults[exerciseResults.length - 1] : null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                            Exercise {currentIndex + 1} of {limitedExercises.length}
                        </span>
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            {elapsedTime}s
                        </div>
                    </div>
                    <Progress value={((currentIndex + 1) / limitedExercises.length) * 100} />
                </CardContent>
            </Card>

            {/* Current exercise */}
            {currentExercise && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>
                                {currentExercise.soap_section}
                            </CardTitle>
                            <Badge variant="outline">{currentExercise.difficulty.level}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Backstory */}
                        <div className="bg-muted/30 rounded-lg p-4" dir="rtl">
                            {currentExercise.backstory.text.map((paragraph, index) => (
                                <p key={index} className="mb-2 leading-relaxed">
                                    {paragraph}
                                </p>
                            ))}
                        </div>

                        {/* Task instruction */}
                        <Alert>
                            <AlertDescription className="font-medium" dir="rtl">
                                {currentExercise.task.instruction}
                            </AlertDescription>
                        </Alert>

                        {/* Word bank */}
                        <div>
                            <div className="text-sm font-medium mb-2">Word Bank:</div>
                            <div className="flex flex-wrap gap-2" dir="rtl">
                                {currentExercise.word_bank.words.map((word, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setUserAnswer(prev => prev + (prev ? ' ' : '') + word)}
                                        disabled={isSubmitted}
                                    >
                                        {word}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        {/* Typing interface */}
                        <div>
                            <label className="text-sm font-medium mb-2 block">Your Answer:</label>
                            <Textarea
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                disabled={isSubmitted}
                                placeholder="Type your answer here..."
                                className="min-h-[100px]"
                                dir="rtl"
                            />
                        </div>

                        {/* Feedback */}
                        {isSubmitted && currentResult && (
                            <Alert variant={currentResult.isCorrect ? 'default' : 'destructive'}>
                                <div className="flex items-start gap-2">
                                    {currentResult.isCorrect ? (
                                        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    )}
                                    <div className="flex-1 space-y-2">
                                        <AlertDescription>
                                            {currentResult.isCorrect ? 'Correct!' : 'Incorrect'}
                                        </AlertDescription>
                                        {!currentResult.isCorrect && (
                                            <div className="text-sm">
                                                <div><strong>Expected:</strong> {currentResult.expectedAnswer}</div>
                                                {currentResult.errors && currentResult.errors.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-2">
                                                        {currentResult.errors.map((error, i) => (
                                                            <Badge key={i} variant="destructive" className="text-xs">
                                                                {error.replace(/_/g, ' ')}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Alert>
                        )}

                        {/* Actions */}
                        <div className="flex gap-4">
                            {!isSubmitted ? (
                                <Button
                                    onClick={handleSubmitAnswer}
                                    disabled={!userAnswer.trim()}
                                    className="flex-1"
                                >
                                    Submit Answer
                                </Button>
                            ) : (
                                <Button onClick={handleNextExercise} className="flex-1">
                                    {currentIndex < limitedExercises.length - 1 ? 'Next Exercise' : 'Finish Test'}
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
