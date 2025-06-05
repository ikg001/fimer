-- Supabase SQL fonksiyonları

-- Oy sayısını artırmak için fonksiyon
CREATE OR REPLACE FUNCTION increment(x integer)
RETURNS integer AS $$
BEGIN
  RETURN x + 1;
END;
$$ LANGUAGE plpgsql;

-- Oy sayısını azaltmak için fonksiyon
CREATE OR REPLACE FUNCTION decrement(x integer)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, x - 1); -- Negatif değer olmaması için
END;
$$ LANGUAGE plpgsql;

-- Talep oylar tablosu (eğer yoksa)
CREATE TABLE IF NOT EXISTS talep_oylar (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talep_id UUID NOT NULL REFERENCES talepler(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(kullanici_id, talep_id)
);

-- Talep oylar tablosuna indeks ekle
CREATE INDEX IF NOT EXISTS talep_oylar_kullanici_id_idx ON talep_oylar(kullanici_id);
CREATE INDEX IF NOT EXISTS talep_oylar_talep_id_idx ON talep_oylar(talep_id);

-- Talepler tablosuna oy_sayisi sütunu ekle (eğer yoksa)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'talepler' AND column_name = 'oy_sayisi'
  ) THEN
    ALTER TABLE talepler ADD COLUMN oy_sayisi INTEGER DEFAULT 0;
  END IF;
END $$;
