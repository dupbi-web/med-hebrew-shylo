-- Create user_consent table to track GDPR consent
CREATE TABLE public.user_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  terms_accepted BOOLEAN NOT NULL DEFAULT false,
  privacy_accepted BOOLEAN NOT NULL DEFAULT false,
  data_processing_accepted BOOLEAN NOT NULL DEFAULT false,
  marketing_accepted BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_consent
CREATE POLICY "Users can view their own consent"
  ON public.user_consent
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent"
  ON public.user_consent
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own consent"
  ON public.user_consent
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_consent_updated_at
  BEFORE UPDATE ON public.user_consent
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create data_deletion_requests table
CREATE TABLE public.data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  request_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  completed_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for data_deletion_requests
CREATE POLICY "Users can view their own deletion requests"
  ON public.data_deletion_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create deletion requests"
  ON public.data_deletion_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add consent tracking to handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user_with_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name');
  
  RETURN new;
END;
$$;

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_with_consent();