import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Type definitions
export interface SOAPExercise {
    id: string;
    language: string;
    soap_section: string;
    backstory: {
        type: string;
        text: string[];
    };
    task: {
        instruction: string;
    };
    sentence: {
        expected: string;
        tokens: string[];
        punctuationRequired: boolean;
        exactOrderRequired: boolean;
        exactGrammarRequired: boolean;
    };
    word_bank: {
        words: string[];
        suggestionMode: string;
    };
    validation: {
        allowSpellingErrors: boolean;
        markErrorsOnSubmit: boolean;
        errorTypes: string[];
    };
    timing: {
        enableTimer: boolean;
        startOn: string;
    };
    difficulty: {
        level: string;
        note: string;
    };
    created_at?: string;
}

interface UseSOAPExercisesOptions {
    soapSection?: string;
    difficulty?: string;
    enabled?: boolean;
}

/**
 * Hook to fetch SOAP exercises from Supabase
 * @param options - Optional filters for soap section and difficulty level
 */
export const useSOAPExercises = (options: UseSOAPExercisesOptions = {}) => {
    const { soapSection, difficulty, enabled = true } = options;

    return useQuery({
        queryKey: ['soap-exercises', soapSection, difficulty],
        queryFn: async (): Promise<SOAPExercise[]> => {
            let query = supabase
                .from('soap_exercises')
                .select('*')
                .order('id', { ascending: true });

            // Apply filters if provided
            if (soapSection) {
                query = query.eq('soap_section', soapSection);
            }

            if (difficulty) {
                query = query.eq('difficulty->>level', difficulty);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(`Failed to fetch SOAP exercises: ${error.message}`);
            }

            return data || [];
        },
        enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

/**
 * Hook to fetch a single SOAP exercise by ID
 * @param exerciseId - The ID of the exercise to fetch
 */
export const useSOAPExercise = (exerciseId: string) => {
    return useQuery({
        queryKey: ['soap-exercise', exerciseId],
        queryFn: async (): Promise<SOAPExercise | null> => {
            const { data, error } = await supabase
                .from('soap_exercises')
                .select('*')
                .eq('id', exerciseId)
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // No rows found
                    return null;
                }
                throw new Error(`Failed to fetch SOAP exercise: ${error.message}`);
            }

            return data;
        },
        enabled: !!exerciseId,
    });
};

/**
 * Hook to get unique SOAP sections from exercises
 */
export const useSOAPSections = () => {
    return useQuery({
        queryKey: ['soap-sections'],
        queryFn: async (): Promise<string[]> => {
            const { data, error } = await supabase
                .from('soap_exercises')
                .select('soap_section');

            if (error) {
                throw new Error(`Failed to fetch SOAP sections: ${error.message}`);
            }

            // Get unique sections
            const uniqueSections = [...new Set(data.map(item => item.soap_section))];
            return uniqueSections.sort();
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};
