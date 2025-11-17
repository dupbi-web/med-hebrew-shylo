-- Fix the handle_new_user_with_consent function to use correct column name
CREATE OR REPLACE FUNCTION public.handle_new_user_with_consent()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile using 'id' not 'user_id'
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'display_name')
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$;