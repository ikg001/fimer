# FIMER - Fırat Üniversitesi İletişim Merkezi Sistemi

FIMER, Fırat Üniversitesi öğrencilerinin öneri, talep ve şikayetlerini dijital ortamda öğretim elemanlarına ve idari birimlere ulaştıran bir platformdur.

## Teknolojiler

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Mimari:** Clean Code

## Başlangıç

### Gereksinimler

- Node.js 14.x veya üzeri
- npm veya yarn

### Kurulum

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/fimer.git
cd fimer
```

2. Bağımlılıkları yükleyin:
```bash
npm install
# veya
yarn install
```

3. `.env.local` dosyasını oluşturun ve Supabase bilgilerinizi ekleyin:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Geliştirme sunucusunu başlatın:
```bash
npm run dev
# veya
yarn dev
```

5. Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açarak uygulamayı görüntüleyin.

## Proje Yapısı

- `pages/`: Next.js sayfa komponentleri
- `components/`: Yeniden kullanılabilir React komponentleri
- `services/`: API ve veri işleme fonksiyonları
- `lib/`: Utility ve konfigürasyon dosyaları
- `constants/`: Sabit değerler ve ayarlar
- `styles/`: Global CSS ve stil dosyaları

## Supabase Veri Modeli

### Tablolar

#### talepler
- `id`: UUID (Primary Key)
- `kullanici_id`: UUID (Foreign Key -> users.id)
- `kategori`: String
- `aciklama`: Text
- `durum`: String (Enum: 'beklemede', 'inceleniyor', 'tamamlandı', 'reddedildi')
- `created_at`: Timestamp
- `updated_at`: Timestamp

## Katkıda Bulunma

1. Bu repo'yu fork edin
2. Feature branch'inizi oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inize push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır. 
