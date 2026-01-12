#!/usr/bin/env python3
"""
Script to create Supabase tables for SOAP exercises and upload data from JSON file.
This script will:
1. Create soap_exercises table
2. Create soap_test_results table
3. Set up Row Level Security (RLS) policies
4. Upload exercises from soapExercises.json
"""

import os
import json
import sys
from pathlib import Path
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from automation/.env
load_dotenv()

# Get Supabase credentials
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file")
    sys.exit(1)

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def create_tables():
    """Create the necessary tables in Supabase using SQL"""
    print("\n📦 Creating database tables...")
    
    # SQL for creating soap_exercises table
    create_exercises_table = """
    -- Drop table if exists (for re-running script)
    DROP TABLE IF EXISTS public.soap_exercises CASCADE;
    
    -- Create soap_exercises table
    CREATE TABLE public.soap_exercises (
        id TEXT PRIMARY KEY,
        language TEXT NOT NULL,
        soap_section TEXT NOT NULL,
        backstory JSONB NOT NULL,
        task JSONB NOT NULL,
        sentence JSONB NOT NULL,
        word_bank JSONB NOT NULL,
        validation JSONB NOT NULL,
        timing JSONB NOT NULL,
        difficulty JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );
    
    -- Create index for faster queries
    CREATE INDEX idx_soap_exercises_section ON public.soap_exercises(soap_section);
    CREATE INDEX idx_soap_exercises_difficulty ON public.soap_exercises((difficulty->>'level'));
    
    -- Enable RLS
    ALTER TABLE public.soap_exercises ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policy: Allow public read access
    CREATE POLICY "Allow public read access" 
        ON public.soap_exercises 
        FOR SELECT 
        USING (true);
    
    -- RLS Policy: Allow authenticated users to insert (for admin purposes)
    CREATE POLICY "Allow authenticated insert" 
        ON public.soap_exercises 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (true);
    """
    
    # SQL for creating soap_test_results table
    create_results_table = """
    -- Drop table if exists (for re-running script)
    DROP TABLE IF EXISTS public.soap_test_results CASCADE;
    
    -- Create soap_test_results table
    CREATE TABLE public.soap_test_results (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        test_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
        exercises_attempted INTEGER NOT NULL,
        exercises_correct INTEGER NOT NULL,
        total_time_seconds INTEGER NOT NULL,
        average_time_per_exercise NUMERIC(10, 2),
        exercises_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
    );
    
    -- Create indexes for faster queries
    CREATE INDEX idx_soap_test_results_user ON public.soap_test_results(user_id);
    CREATE INDEX idx_soap_test_results_date ON public.soap_test_results(test_date DESC);
    
    -- Enable RLS
    ALTER TABLE public.soap_test_results ENABLE ROW LEVEL SECURITY;
    
    -- RLS Policy: Users can only read their own results
    CREATE POLICY "Users can read own results" 
        ON public.soap_test_results 
        FOR SELECT 
        USING (auth.uid() = user_id);
    
    -- RLS Policy: Users can only insert their own results
    CREATE POLICY "Users can insert own results" 
        ON public.soap_test_results 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    """
    
    try:
        # Execute SQL to create tables
        print("  Creating soap_exercises table...")
        supabase.rpc('exec_sql', {'sql': create_exercises_table}).execute()
        print("  ✓ soap_exercises table created")
        
        print("  Creating soap_test_results table...")
        supabase.rpc('exec_sql', {'sql': create_results_table}).execute()
        print("  ✓ soap_test_results table created")
        
        print("✅ Tables created successfully!\n")
        return True
    except Exception as e:
        print(f"❌ Error creating tables: {str(e)}")
        print("\nNote: You may need to run this SQL manually in the Supabase SQL Editor:")
        print("\n" + "="*80)
        print(create_exercises_table)
        print("\n" + "="*80)
        print(create_results_table)
        print("="*80 + "\n")
        return False

def upload_exercises():
    """Upload exercises from JSON file to Supabase"""
    print("📤 Uploading exercises from JSON file...")
    
    # Path to the JSON file
    json_path = Path(__file__).parent.parent / 'public' / 'data' / 'soapExercises.json'
    
    if not json_path.exists():
        print(f"❌ Error: JSON file not found at {json_path}")
        return False
    
    try:
        # Read JSON file
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        exercises = data.get('exercises', [])
        print(f"  Found {len(exercises)} exercises in JSON file")
        
        # Transform exercises for database insertion
        db_exercises = []
        for exercise in exercises:
            db_exercise = {
                'id': exercise['id'],
                'language': exercise['language'],
                'soap_section': exercise['soapSection'],
                'backstory': exercise['backStory'],
                'task': exercise['task'],
                'sentence': exercise['sentence'],
                'word_bank': exercise['wordBank'],
                'validation': exercise['validation'],
                'timing': exercise['timing'],
                'difficulty': exercise['difficulty']
            }
            db_exercises.append(db_exercise)
        
        # Upload to Supabase (upsert to handle re-runs)
        print(f"  Uploading {len(db_exercises)} exercises to Supabase...")
        result = supabase.table('soap_exercises').upsert(db_exercises).execute()
        
        print(f"✅ Successfully uploaded {len(result.data)} exercises!\n")
        return True
        
    except Exception as e:
        print(f"❌ Error uploading exercises: {str(e)}")
        return False

def verify_data():
    """Verify that data was uploaded correctly"""
    print("🔍 Verifying uploaded data...")
    
    try:
        # Count exercises
        result = supabase.table('soap_exercises').select('id', count='exact').execute()
        count = result.count
        
        print(f"  Total exercises in database: {count}")
        
        # Count by SOAP section
        sections = ['Subjective', 'Objective', 'Assessment', 'Plan']
        for section in sections:
            result = supabase.table('soap_exercises').select('id', count='exact').eq('soap_section', section).execute()
            section_count = result.count
            print(f"  - {section}: {section_count}")
        
        print("✅ Data verification complete!\n")
        return True
        
    except Exception as e:
        print(f"❌ Error verifying data: {str(e)}")
        return False

def main():
    """Main execution function"""
    print("\n" + "="*80)
    print("SOAP Exercises Database Setup")
    print("="*80)
    
    # Step 1: Create tables
    if not create_tables():
        print("\n⚠️  Table creation failed. Please create tables manually and try again.")
        print("You can still proceed to upload data if tables already exist.\n")
        response = input("Do you want to continue with data upload? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Step 2: Upload exercises
    if not upload_exercises():
        print("\n❌ Upload failed. Exiting.")
        sys.exit(1)
    
    # Step 3: Verify data
    verify_data()
    
    print("="*80)
    print("✅ Setup complete! Your SOAP exercises are now in Supabase.")
    print("="*80 + "\n")

if __name__ == "__main__":
    main()
