import { useEffect, useState } from 'react';
import { getTalepler } from '../../services/talep';
import KategoriBasi from './KategoriBasi';
import TalepKarti from './TalepKarti';

/**
 * Ana sayfadaki tüm kategorileri ve altındaki talepleri listeleyen bileşen
 */
export default function KategoriListesi() {
  const [talepler, setTalepler] = useState([]);
  const [kategoriler, setKategoriler] = useState({});
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');

  useEffect(() => {
    async function taleplerYukle() {
      try {
        setYukleniyor(true);
        const { success, data, error } = await getTalepler();
        
        if (!success) {
          throw new Error(error);
        }
        
        setTalepler(data);
        
        // Talepleri kategorilere göre grupla
        const kategoriGruplari = data.reduce((gruplar, talep) => {
          if (!gruplar[talep.kategori]) {
            gruplar[talep.kategori] = [];
          }
          gruplar[talep.kategori].push(talep);
          return gruplar;
        }, {});
        
        setKategoriler(kategoriGruplari);
      } catch (err) {
        setHata('Talepler yüklenirken bir hata oluştu: ' + err.message);
        console.error('Talepler yüklenirken hata:', err);
      } finally {
        setYukleniyor(false);
      }
    }
    
    taleplerYukle();
  }, []);

  if (yukleniyor) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-3">Talepler yükleniyor...</span>
      </div>
    );
  }
  
  if (hata) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Bir hata oluştu</h3>
        <p>{hata}</p>
      </div>
    );
  }
  
  if (Object.keys(kategoriler).length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium mb-2">Henüz talep bulunmuyor</h3>
        <p>İlk talebi göndererek başlayabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(kategoriler).map(([kategori, kategoriTalepleri]) => (
        <KategoriBasi 
          key={kategori} 
          kategori={kategori} 
          talepSayisi={kategoriTalepleri.length}
        >
          <div className="mt-3 space-y-3">
            {kategoriTalepleri.map(talep => (
              <TalepKarti key={talep.id} talep={talep} />
            ))}
          </div>
        </KategoriBasi>
      ))}
    </div>
  );
} 