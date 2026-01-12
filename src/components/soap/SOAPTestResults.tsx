import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import {
    Loader2,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    Clock,
    Calendar,
    Award,
    TrendingUp,
    BarChart3,
} from 'lucide-react';
import { useSOAPTestResults, useSOAPTestStats } from '@/hooks/queries/useSOAPTestResults';
import { format } from 'date-fns';

export const SOAPTestResults: React.FC = () => {
    const navigate = useNavigate();
    const { data: results, isLoading, error } = useSOAPTestResults();
    const { data: stats } = useSOAPTestStats();
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());

    const toggleExpanded = (resultId: string) => {
        setExpandedResults(prev => {
            const newSet = new Set(prev);
            if (newSet.has(resultId)) {
                newSet.delete(resultId);
            } else {
                newSet.add(resultId);
            }
            return newSet;
        });
    };

    const getScoreColor = (percentage: number) => {
        if (percentage >= 90) return 'text-green-600';
        if (percentage >= 70) return 'text-blue-600';
        if (percentage >= 50) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getPassBadge = (percentage: number) => {
        if (percentage >= 70) {
            return <Badge className="bg-green-600">Passed</Badge>;
        }
        return <Badge variant="destructive">Failed</Badge>;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
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
                    Failed to load test results. Please try again later.
                </AlertDescription>
            </Alert>
        );
    }

    // No results yet
    if (!results || results.length === 0) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>No Test Results Yet</CardTitle>
                    <CardDescription>
                        You haven't completed any SOAP exercises tests yet. Take your first test to see your results here!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={() => navigate('/soap-test')}>
                        Take Your First Test
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Statistics Overview */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Tests</p>
                                    <p className="text-2xl font-bold">{stats.totalTests}</p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Average Score</p>
                                    <p className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                                        {stats.averageScore}%
                                    </p>
                                </div>
                                <Award className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Exercises</p>
                                    <p className="text-2xl font-bold">{stats.totalCorrect}/{stats.totalExercises}</p>
                                </div>
                                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Time Spent</p>
                                    <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
                                </div>
                                <Clock className="w-8 h-8 text-primary opacity-50" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Results List */}
            <Card>
                <CardHeader>
                    <CardTitle>Test History</CardTitle>
                    <CardDescription>View your past test results and performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {results.map((result) => {
                        const percentage = Math.round((result.exercises_correct / result.exercises_attempted) * 100);
                        const isExpanded = expandedResults.has(result.id);

                        return (
                            <Collapsible
                                key={result.id}
                                open={isExpanded}
                                onOpenChange={() => toggleExpanded(result.id)}
                            >
                                <Card className="border-2">
                                    <CollapsibleTrigger className="w-full">
                                        <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="text-left">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground">
                                                                {format(new Date(result.test_date), 'PPP p')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className={`text-2xl font-bold ${getScoreColor(percentage)}`}>
                                                                {percentage}%
                                                            </span>
                                                            <span className="text-muted-foreground">
                                                                ({result.exercises_correct}/{result.exercises_attempted})
                                                            </span>
                                                            {getPassBadge(percentage)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="text-right">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className="w-4 h-4" />
                                                            {formatTime(result.total_time_seconds)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Avg: {result.average_time_per_exercise.toFixed(1)}s/exercise
                                                        </div>
                                                    </div>
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                                                    ) : (
                                                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <CardContent className="pt-0">
                                            <Separator className="mb-4" />
                                            <div className="space-y-3">
                                                <h4 className="font-semibold mb-3">Exercise Breakdown</h4>
                                                {result.exercises_data.map((exercise, index) => (
                                                    <div
                                                        key={exercise.exerciseId}
                                                        className={`p-4 rounded-lg border ${exercise.isCorrect
                                                                ? 'bg-green-50 border-green-200 dark:bg-green-950/20'
                                                                : 'bg-red-50 border-red-200 dark:bg-red-950/20'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div className="flex items-center gap-2">
                                                                {exercise.isCorrect ? (
                                                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                                ) : (
                                                                    <XCircle className="w-5 h-5 text-red-600" />
                                                                )}
                                                                <span className="font-medium">Exercise {index + 1}</span>
                                                                <Badge variant="outline">{exercise.exerciseId}</Badge>
                                                            </div>
                                                            <span className="text-sm text-muted-foreground">
                                                                {exercise.timeSpent}s
                                                            </span>
                                                        </div>

                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <span className="font-medium">Your answer: </span>
                                                                <span className={exercise.isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                                                                    {exercise.userAnswer}
                                                                </span>
                                                            </div>
                                                            {!exercise.isCorrect && (
                                                                <div>
                                                                    <span className="font-medium">Expected: </span>
                                                                    <span className="text-green-700 dark:text-green-400">
                                                                        {exercise.expectedAnswer}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {exercise.errors && exercise.errors.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {exercise.errors.map((error, i) => (
                                                                        <Badge key={i} variant="destructive" className="text-xs">
                                                                            {error.replace(/_/g, ' ')}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </CollapsibleContent>
                                </Card>
                            </Collapsible>
                        );
                    })}
                </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex justify-center">
                <Button onClick={() => navigate('/soap-test')} size="lg">
                    Take Another Test
                </Button>
            </div>
        </div>
    );
};
