# FIMER Projesi Kodlama Standartları

Bu dokümanda, FIMER projesi geliştirme sürecinde uyulması gereken kodlama standartları ve prensipler yer almaktadır.

## 1. Genel Kurallar

- **Anlamlı İsimlendirme**: Değişkenler, fonksiyonlar ve komponentler anlamlı ve açıklayıcı isimler olmalıdır.
- **Türkçe İsimlendirme**: Projemizin hedef kitlesi Türkçe konuşan kullanıcılar olduğundan, değişken, fonksiyon ve dosya isimleri Türkçe olabilir.
- **Kısa Fonksiyonlar**: Her fonksiyon tek bir iş yapmalı ve kısa olmalıdır (20 satırı geçmemelidir).
- **Yorum Kullanımı**: Kod kendi kendini açıklamalıdır. Karmaşık iş mantığını açıklayan yorumlar dışında, gereksiz yorumlardan kaçınılmalıdır.
- **DRY (Don't Repeat Yourself)**: Kod tekrarından kaçınılmalıdır. Tekrar eden kodlar fonksiyonlar, hook'lar veya komponentler olarak ayrıştırılmalıdır.

## 2. Komponent Yapısı

- **Tek Sorumluluk İlkesi**: Her komponent tek bir sorumluluk taşımalıdır.
- **Props Drilling'den Kaçınma**: Birçok seviye arasında prop geçişi yapmak yerine, Context API veya state yönetim çözümleri kullanılmalıdır.
- **Küçük Komponentler**: Komponentler küçük ve odaklı olmalıdır. Büyük komponentler daha küçük alt komponentlere ayrılmalıdır.
- **Yeniden Kullanılabilirlik**: Komponentler mümkün olduğunca yeniden kullanılabilir olmalıdır.

## 3. Dosya Organizasyonu

- **Modülerlik**: İlgili kodlar ilgili klasörlerde bir arada tutulmalıdır.
- **Tutarlı Klasör Yapısı**: Dosya ve klasör yapısı tutarlı olmalıdır. 
- **İçe Aktarma Düzeni**: İmport ifadeleri şu sırada olmalıdır:
  1. React ve React kütüphaneleri
  2. Diğer üçüncü parti kütüphaneler
  3. Yerel komponentler 
  4. Yerel hooks
  5. Yardımcı fonksiyonlar
  6. Stiller

## 4. Stil ve Formatlar

- **ESLint ve Prettier**: Kod formatlama için ESLint ve Prettier kullanılmalıdır.
- **CSS Sınıf İsimlendirmesi**: Tailwind CSS kullanıldığından BEM gibi metodolojilere gerek yoktur.
- **Responsive Tasarım**: Tüm komponentler mobil cihazlarda da düzgün görüntülenmelidir.

## 5. State Yönetimi

- **Yerel State**: Sadece mevcut komponenti ilgilendiren state'ler için useState kullanılmalıdır.
- **Paylaşılan State**: Birden fazla komponentin erişmesi gereken state'ler için React Context API kullanılmalıdır.
- **Form Durumları**: Karmaşık formlar için React Hook Form gibi kütüphaneler kullanılmalıdır.

## 6. API ve Veri İşlemleri

- **Try-Catch Kullanımı**: Tüm asenkron işlemler try-catch blokları içinde ele alınmalıdır.
- **Hata İşleme**: Hatalar kullanıcıya uygun şekilde gösterilmelidir.
- **Yükleme Durumları**: Veri yükleme durumları uygun şekilde ele alınmalıdır.

## 7. Performans

- **Memorization**: Pahalı hesaplamalar için useMemo ve useCallback kullanılmalıdır.
- **Lazy Loading**: Sayfa ve büyük komponentler için lazy loading kullanılmalıdır.
- **Optimizasyon**: Görsel optimizasyonu için Next.js'in Image komponenti kullanılmalıdır.

## 8. Güvenlik

- **Kullanıcı Girdisi Doğrulama**: Tüm kullanıcı girdileri hem istemci hem de sunucu tarafında doğrulanmalıdır.
- **XSS Koruması**: dangerouslySetInnerHTML kullanımından kaçınılmalıdır.
- **Hassas Bilgiler**: API anahtarları, sırlar ve hassas bilgiler çevresel değişkenlerde saklanmalıdır.

## 9. Erişilebilirlik

- **Semantik HTML**: Uygun semantik HTML etiketleri kullanılmalıdır.
- **Klavye Navigasyonu**: Tüm interaktif öğeler klavye ile erişilebilir olmalıdır.
- **ARIA Özellikleri**: Gerektiğinde ARIA özellikleri eklenmelidir.

## 10. Git Kullanımı

- **Açıklayıcı Commit Mesajları**: Commit mesajları açık ve açıklayıcı olmalıdır.
- **Feature Branches**: Her yeni özellik için ayrı bir branch oluşturulmalıdır.
- **Pull Request'ler**: Kod incelemeleri için pull request'ler kullanılmalıdır. 