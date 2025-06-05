-- Fix database schema issues

-- 1. Ensure the talepler table has the correct columns
ALTER TABLE IF EXISTS talepler 
ADD COLUMN IF NOT EXISTS oy_sayisi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seffaflik TEXT DEFAULT 'acik';

-- 2. Fix the foreign key relationship
-- First, check if the kullanici_id column exists in talepler
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'talepler' AND column_name = 'kullanici_id'
  ) THEN
    -- Add kullanici_id column if it doesn't exist
    ALTER TABLE talepler ADD COLUMN kullanici_id UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- 3. Create the talep_oylar table if it doesn't exist
CREATE TABLE IF NOT EXISTS talep_oylar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  talep_id UUID REFERENCES talepler(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(kullanici_id, talep_id)
);

-- 4. Create increment and decrement functions
CREATE OR REPLACE FUNCTION increment(x integer)
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(x, 0) + 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement(x integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, COALESCE(x, 0) - 1);
END;
$$ LANGUAGE plpgsql;
