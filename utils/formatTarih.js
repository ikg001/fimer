/**
 * ISO tarih formatını okunabilir Türkçe formata çevirir
 * @param {string} isoTarih - ISO formatında tarih string
 * @returns {string} Formatlanmış tarih string (ör: "23 Nisan 2025, 14:30")
 */
export function formatTarih(isoTarih) {
  if (!isoTarih) return '';

  const tarih = new Date(isoTarih);
  
  const aylar = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const gun = tarih.getDate();
  const ay = aylar[tarih.getMonth()];
  const yil = tarih.getFullYear();
  
  const saat = tarih.getHours().toString().padStart(2, '0');
  const dakika = tarih.getMinutes().toString().padStart(2, '0');
  
  return `${gun} ${ay} ${yil}, ${saat}:${dakika}`;
}

/**
 * Geçen süreyi hesaplar (ör: "3 gün önce", "5 dakika önce")
 * @param {string} isoTarih - ISO formatında tarih string
 * @returns {string} Geçen süre string
 */
export function gecenSure(isoTarih) {
  if (!isoTarih) return '';

  const tarih = new Date(isoTarih);
  const simdi = new Date();
  
  const farkSaniye = Math.floor((simdi - tarih) / 1000);
  
  if (farkSaniye < 60) {
    return `${farkSaniye} saniye önce`;
  }
  
  const farkDakika = Math.floor(farkSaniye / 60);
  if (farkDakika < 60) {
    return `${farkDakika} dakika önce`;
  }
  
  const farkSaat = Math.floor(farkDakika / 60);
  if (farkSaat < 24) {
    return `${farkSaat} saat önce`;
  }
  
  const farkGun = Math.floor(farkSaat / 24);
  if (farkGun < 30) {
    return `${farkGun} gün önce`;
  }
  
  const farkAy = Math.floor(farkGun / 30);
  if (farkAy < 12) {
    return `${farkAy} ay önce`;
  }
  
  const farkYil = Math.floor(farkAy / 12);
  return `${farkYil} yıl önce`;
} 