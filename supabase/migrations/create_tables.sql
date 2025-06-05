-- Talepler tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.talepler (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  kullanici_id UUID NOT NULL REFERENCES public.profiller(id),
  kategori TEXT NOT NULL,
  aciklama TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'beklemede',
  oncelik TEXT DEFAULT 'normal',
  admin_notu TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Kullanıcı profilleri tablosu
CREATE TABLE IF NOT EXISTS public.profiller (
  id UUID REFERENCES auth.users PRIMARY KEY,
  ad TEXT,
  soyad TEXT,
  email TEXT,
  telefon TEXT,
  departman TEXT,
  pozisyon TEXT NOT NULL DEFAULT 'kullanici', -- 'admin' veya 'kullanici'
  avatar_url TEXT,
  kullanici_tipi TEXT NOT NULL DEFAULT 'kullanici', -- 'admin' veya 'kullanici'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Talepler için yorumlar tablosu
CREATE TABLE IF NOT EXISTS public.yorumlar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  talep_id UUID NOT NULL REFERENCES public.talepler(id) ON DELETE CASCADE,
  kullanici_id UUID NOT NULL REFERENCES public.profiller(id),
  yorum TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Talepler için dosya ekleri tablosu
CREATE TABLE IF NOT EXISTS public.dosyalar (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  talep_id UUID NOT NULL REFERENCES public.talepler(id) ON DELETE CASCADE,
  dosya_adi TEXT NOT NULL,
  dosya_url TEXT NOT NULL,
  dosya_tipi TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS Politikaları (Row Level Security)
ALTER TABLE public.talepler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiller ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yorumlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dosyalar ENABLE ROW LEVEL SECURITY;

-- Profiller için politikalar
CREATE POLICY "Profiller herkese açık" ON public.profiller
  FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar kendi profillerini düzenleyebilir" ON public.profiller
  FOR UPDATE
  USING (auth.uid() = id);

-- Talepler için politikalar
CREATE POLICY "Kullanıcılar kendi taleplerini görebilir" ON public.talepler
  FOR SELECT
  USING (auth.uid() = kullanici_id);

CREATE POLICY "Adminler tüm talepleri görebilir" ON public.talepler
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiller
      WHERE id = auth.uid() AND pozisyon = 'admin'
    )
  );

CREATE POLICY "Kullanıcılar talep oluşturabilir" ON public.talepler
  FOR INSERT
  WITH CHECK (auth.uid() = kullanici_id);

CREATE POLICY "Adminler talepleri güncelleyebilir" ON public.talepler
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiller
      WHERE id = auth.uid() AND pozisyon = 'admin'
    )
  );

-- Yorumlar için politikalar
CREATE POLICY "Yorumlar herkese açık" ON public.yorumlar
  FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar yorum ekleyebilir" ON public.yorumlar
  FOR INSERT
  WITH CHECK (auth.uid() = kullanici_id);

-- Dosyalar için politikalar
CREATE POLICY "Dosyalar herkese açık" ON public.dosyalar
  FOR SELECT
  USING (true);

CREATE POLICY "Kullanıcılar dosya ekleyebilir" ON public.dosyalar
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.talepler
      WHERE id = talep_id AND kullanici_id = auth.uid()
    )
  );

-- Otomatik updated_at alanı için fonksiyon ve trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiller_updated_at
BEFORE UPDATE ON public.profiller
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_talepler_updated_at
BEFORE UPDATE ON public.talepler
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column(); 