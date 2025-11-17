-- Create user_mastered_words table to store which words users have mastered
CREATE TABLE IF NOT EXISTS public.user_mastered_words (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_key TEXT NOT NULL,
  mastered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, word_key)
);

-- Enable RLS
ALTER TABLE public.user_mastered_words ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own mastered words
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_mastered_words_user_id 
  ON public.user_mastered_words(user_id);

-- Add comment for documentation
COMMENT ON TABLE public.user_mastered_words IS 'Stores words that users have marked as mastered for personalized learning';