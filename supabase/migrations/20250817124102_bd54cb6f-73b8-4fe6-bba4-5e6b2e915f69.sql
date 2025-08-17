-- Drop the old learning_progress table and create new user_mastered_words table
DROP TABLE IF EXISTS public.learning_progress;

-- Create user_mastered_words table
CREATE TABLE public.user_mastered_words (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  word_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint to prevent duplicates
ALTER TABLE public.user_mastered_words 
ADD CONSTRAINT unique_user_word UNIQUE (user_id, word_key);

-- Enable Row Level Security
ALTER TABLE public.user_mastered_words ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own mastered words" 
ON public.user_mastered_words 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mastered words" 
ON public.user_mastered_words 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mastered words" 
ON public.user_mastered_words 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_mastered_words_user_id ON public.user_mastered_words(user_id);
CREATE INDEX idx_user_mastered_words_word_key ON public.user_mastered_words(word_key);