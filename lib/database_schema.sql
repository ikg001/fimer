-- Database schema for FIMER application

-- Ensure we have the required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create or update the talepler table
DO $$ 
BEGIN
  -- Check if talepler table exists
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'talepler') THEN
    -- Create talepler table if it doesn't exist
    CREATE TABLE talepler (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      kullanici_id UUID REFERENCES auth.users(id),
      baslik TEXT NOT NULL,
      aciklama TEXT NOT NULL,
      kategori TEXT NOT NULL,
      durum TEXT NOT NULL DEFAULT 'beklemede',
      oy_sayisi INTEGER DEFAULT 0,
      seffaflik BOOLEAN DEFAULT TRUE,
      olusturulma_zamani TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  ELSE
    -- Add missing columns if table exists
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'talepler' AND column_name = 'oy_sayisi') THEN
        ALTER TABLE talepler ADD COLUMN oy_sayisi INTEGER DEFAULT 0;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding oy_sayisi column: %', SQLERRM;
    END;
    
    BEGIN
      IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'talepler' AND column_name = 'seffaflik') THEN
        ALTER TABLE talepler ADD COLUMN seffaflik BOOLEAN DEFAULT TRUE;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Error adding seffaflik column: %', SQLERRM;
    END;
  END IF;
END $$;

-- Create the talep_oylar table for tracking votes
CREATE TABLE IF NOT EXISTS talep_oylar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talep_id UUID NOT NULL REFERENCES talepler(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(kullanici_id, talep_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_talepler_kullanici_id ON talepler(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_talepler_kategori ON talepler(kategori);
CREATE INDEX IF NOT EXISTS idx_talepler_durum ON talepler(durum);
CREATE INDEX IF NOT EXISTS idx_talep_oylar_kullanici_id ON talep_oylar(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_talep_oylar_talep_id ON talep_oylar(talep_id);

-- Create functions for incrementing and decrementing vote counts
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
