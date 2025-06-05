-- Talep dosyaları için tablo oluşturma
CREATE TABLE IF NOT EXISTS talep_dosyalari (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talep_id UUID NOT NULL REFERENCES talepler(id) ON DELETE CASCADE,
  kullanici_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dosya_adi TEXT NOT NULL,
  dosya_boyutu BIGINT NOT NULL,
  dosya_turu TEXT NOT NULL,
  dosya_url TEXT NOT NULL,
  dosya_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profil tablosuna profil fotoğrafı alanı ekleme
ALTER TABLE profiller ADD COLUMN IF NOT EXISTS profile_photo TEXT;

-- Fakülte ve bölüm tabloları
CREATE TABLE IF NOT EXISTS fakulteler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bolumler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fakulte_id UUID NOT NULL REFERENCES fakulteler(id) ON DELETE CASCADE,
  ad TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(fakulte_id, ad)
);

-- Kullanıcı etkinlik kayıtları için tablo
CREATE TABLE IF NOT EXISTS kullanici_etkinlikleri (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kullanici_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etkinlik_turu TEXT NOT NULL, -- 'giris', 'cikis', 'talep_olusturma', 'talep_guncelleme', vb.
  detay JSONB,
  ip_adresi TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sık Sorulan Sorular tablosu
CREATE TABLE IF NOT EXISTS sss (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soru TEXT NOT NULL,
  cevap TEXT NOT NULL,
  kategori TEXT,
  sira INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_talep_dosyalari_talep_id ON talep_dosyalari(talep_id);
CREATE INDEX IF NOT EXISTS idx_talep_dosyalari_kullanici_id ON talep_dosyalari(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_bolumler_fakulte_id ON bolumler(fakulte_id);
CREATE INDEX IF NOT EXISTS idx_kullanici_etkinlikleri_kullanici_id ON kullanici_etkinlikleri(kullanici_id);
CREATE INDEX IF NOT EXISTS idx_kullanici_etkinlikleri_etkinlik_turu ON kullanici_etkinlikleri(etkinlik_turu);
