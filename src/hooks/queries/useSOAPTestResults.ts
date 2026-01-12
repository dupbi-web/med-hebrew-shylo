import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Type definitions
export interface ExerciseResult {
    exerciseId: string;
    userAnswer: string;
    expectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    errors?: string[];
}

export interface SOAPTestResult {
    id: string;
    user_id: string;
    test_date: string;
    exercises_attempted: number;
    exercises_correct: number;
    total_time_seconds: number;
    average_time_per_exercise: number;
    exercises_data: ExerciseResult[];
    created_at: string;
}

export interface CreateTestResultInput {
    exercises_attempted: number;
    exercises_correct: number;
    total_time_seconds: number;
    average_time_per_exercise: number;
    exercises_data: ExerciseResult[];
}

/**
 * Hook to fetch test results for the current user
 */
export const useSOAPTestResults = () => {
    return useQuery({
        queryKey: ['soap-test-results'],
        queryFn: async (): Promise<SOAPTestResult[]> => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be authenticated to view test results');
            }

            const { data, error } = await supabase
                .from('soap_test_results')
                .select('*')
                .eq('user_id', user.id)
                .order('test_date', { ascending: false });

            if (error) {
                throw new Error(`Failed to fetch test results: ${error.message}`);
            }

            return data || [];
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};

/**
 * Hook to fetch a single test result by ID
 */
export const useSOAPTestResult = (resultId: string) => {
    return useQuery({
        queryKey: ['soap-test-result', resultId],
        queryFn: async (): Promise<SOAPTestResult | null> => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be authenticated to view test results');
            }

            const { data, error } = await supabase
                .from('soap_test_results')
                .select('*')
                .eq('id', resultId)
                .eq('user_id', user.id)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    return null;
                }
                throw new Error(`Failed to fetch test result: ${error.message}`);
            }

            return data;
        },
        enabled: !!resultId,
    });
};

/**
 * Hook to save a new test result
 */
export const useSaveTestResult = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: CreateTestResultInput): Promise<SOAPTestResult> => {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be authenticated to save test results');
            }

            const { data, error } = await supabase
                .from('soap_test_results')
                .insert({
                    user_id: user.id,
                    exercises_attempted: input.exercises_attempted,
                    exercises_correct: input.exercises_correct,
                    total_time_seconds: input.total_time_seconds,
                    average_time_per_exercise: input.average_time_per_exercise,
                    exercises_data: input.exercises_data,
                })
                .select()
                .single();

            if (error) {
                throw new Error(`Failed to save test result: ${error.message}`);
            }

            return data;
        },
        onSuccess: () => {
            // Invalidate and refetch test results
            queryClient.invalidateQueries({ queryKey: ['soap-test-results'] });
        },
    });
};

/**
 * Hook to get test statistics for the current user
 */
export const useSOAPTestStats = () => {
    return useQuery({
        queryKey: ['soap-test-stats'],
        queryFn: async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('User must be authenticated to view test stats');
            }

            const { data, error } = await supabase
                .from('soap_test_results')
                .select('exercises_attempted, exercises_correct, total_time_seconds')
                .eq('user_id', user.id);

            if (error) {
                throw new Error(`Failed to fetch test stats: ${error.message}`);
            }

            if (!data || data.length === 0) {
                return {
                    totalTests: 0,
                    totalExercises: 0,
                    totalCorrect: 0,
                    averageScore: 0,
                    totalTimeSpent: 0,
                };
            }

            const totalTests = data.length;
            const totalExercises = data.reduce((sum, test) => sum + test.exercises_attempted, 0);
            const totalCorrect = data.reduce((sum, test) => sum + test.exercises_correct, 0);
            const totalTimeSpent = data.reduce((sum, test) => sum + test.total_time_seconds, 0);
            const averageScore = totalExercises > 0 ? (totalCorrect / totalExercises) * 100 : 0;

            return {
                totalTests,
                totalExercises,
                totalCorrect,
                averageScore: Math.round(averageScore * 10) / 10,
                totalTimeSpent,
            };
        },
        staleTime: 1000 * 30, // 30 seconds
    });
};
