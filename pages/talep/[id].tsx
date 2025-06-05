import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';
import Head from 'next/head';
import { ThumbsUp, MessageCircle, Clock, ArrowLeft } from 'lucide-react';
import Layout from '../../components/Layout';
import { toggleVote } from '../../lib/voteUtils';

export default function TalepDetay() {
  const router = useRouter();
  const { id } = router.query;
  
  const [talep, setTalep] = useState<any>(null);
  const [yorumlar, setYorumlar] = useState<any[]>([]);
  const [yeniYorum, setYeniYorum] = useState('');
  const [loading, setLoading] = useState(true);
  const [yorumEkleniyor, setYorumEkleniyor] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'akademisyen' | 'ogrenci' | null>(null);
  const [yeniDurum, setYeniDurum] = useState('');
  const [hasVoted, setHasVoted] = useState(false);
  const [oyVeriliyor, setOyVeriliyor] = useState(false);
  
  const durumlar = ['beklemede', 'işlemde', 'cevaplandı', 'çözüldü', 'reddedildi'];

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Kullanıcı oturumunu al
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const user = session.user;
          setUser(user);
          
          // Kullanıcı rolünü al
          const { data: profile } = await supabase
            .from('profiller')
            .select('*')
            .eq('id', user.id)
            .single();
            
          setUserRole(profile?.pozisyon || null);
          
          // Kullanıcının oy durumunu kontrol et
          const { data: userVote } = await supabase
            .from('talep_oylar')
            .select('*')
            .eq('talep_id', id)
            .eq('kullanici_id', user.id)
            .maybeSingle();
            
          setHasVoted(!!userVote);
        }
        
        // Talep detaylarını al
        const { data: talepDetay, error: talepError } = await supabase
          .from('talepler')
          .select(`
            *,
            yorumlar (
              id, 
              kullanici_id, 
              yorum, 
              created_at
            )
          `)
          .eq('id', id)
          .single();
          
        // Hata detaylarını konsola yazdır
        if (talepError) {
          console.error('Talep yükleme hatası (detaylı):', JSON.stringify(talepError));
        }
          
        if (talepError) {
          console.error('Talep yükleme hatası:', talepError);
          return;
        }
        
        if (talepDetay) {
          setTalep(talepDetay);
          setYeniDurum(talepDetay.durum);
            
          if (talepDetay.yorumlar && Array.isArray(talepDetay.yorumlar)) {
            // Yorumları tarihe göre sırala
            const sortedYorumlar = talepDetay.yorumlar.sort((a: any, b: any) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
            setYorumlar(sortedYorumlar);
          }
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  const handleYorumGonder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !yeniYorum.trim() || !id) {
      console.log('Yorum eklemek için gerekli bilgiler eksik:', { user, yeniYorum: yeniYorum.trim(), id });
      return;
    }
    
    try {
      setYorumEkleniyor(true);
      
      // Yeni yorum objesi
      const yeniYorumObjesi = {
        talep_id: id.toString(),
        kullanici_id: user.id,
        yorum: yeniYorum.trim(),
        created_at: new Date().toISOString()
      };
      
      // Yorum ekle - ilişkili sorgu olmadan
      const { data: yeniYorumData, error } = await supabase
        .from('yorumlar')
        .insert([yeniYorumObjesi])
        .select('*');
        
      if (error) {
        console.error('Yorum ekleme hatası:', error);
        alert(`Yorum eklenirken bir hata oluştu: ${error.message}`);
        return;
      }
      
      // Yeni yorumu state'e ekle
      if (yeniYorumData && yeniYorumData.length > 0) {
        // Kullanıcı bilgilerini manuel olarak ekle
        const yeniYorum = {
          ...yeniYorumData[0],
          kullanici: {
            id: user.id,
            ad_soyad: user?.user_metadata?.ad_soyad || 'Kullanıcı',
            pozisyon: userRole || 'ogrenci'
          }
        };
        
        setYorumlar([...yorumlar, yeniYorum]);
        setYeniYorum(''); // Input alanını temizle
        alert('Yorumunuz başarıyla eklendi!');
      } else {
        // Veritabanına yorum eklenmesine rağmen veri geri dönmediyse
        // Tüm yorumları tekrar çekelim
        const { data: tumYorumlar, error: yorumHata } = await supabase
          .from('yorumlar')
          .select('*')
          .eq('talep_id', id);
          
        if (yorumHata) {
          console.error('Yorumları yeniden yükleme hatası:', yorumHata);
        } else if (tumYorumlar) {
          setYorumlar(tumYorumlar);
          setYeniYorum(''); // Input alanını temizle
          alert('Yorumunuz eklendi!');
        }
          
        if (talepDetay?.yorumlar) {
          const sortedYorumlar = talepDetay.yorumlar.sort((a: any, b: any) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
          setYorumlar(sortedYorumlar);
          setYeniYorum(''); // Input alanını temizle
          alert('Yorumunuz eklendi!');
        }
      }
    } catch (error) {
      console.error('Yorum gönderme hatası:', error);
      alert('Yorum gönderme sırasında bir hata oluştu.');
    } finally {
      setYorumEkleniyor(false);
    }
  };
  
  // Yorum silme fonksiyonu
  const handleYorumSil = async (yorumId: string) => {
    if (!user) {
      console.log('Yorum silmek için kullanıcı girişi gerekli');
      return;
    }
    
    try {
      // Yorum sahibi veya admin/akademisyen kontrolü
      const silinecekYorum = yorumlar.find(y => y.id === yorumId);
      
      if (!silinecekYorum) {
        alert('Silinecek yorum bulunamadı!');
        return;
      }
      
      const isOwner = silinecekYorum.kullanici_id === user.id;
      const canDelete = isOwner || ['admin', 'akademisyen'].includes(userRole || '');
      
      if (!canDelete) {
        alert('Bu yorumu silme yetkiniz yok!');
        return;
      }
      
      // Yorumu veritabanından sil
      const { error } = await supabase
        .from('yorumlar')
        .delete()
        .eq('id', yorumId);
        
      if (error) {
        console.error('Yorum silme hatası:', error);
        alert(`Yorum silinirken bir hata oluştu: ${error.message}`);
        return;
      }
      
      // Yorumlar listesini güncelle
      const filtrelenmisYorumlar = yorumlar.filter(yorum => yorum.id !== yorumId);
      setYorumlar(filtrelenmisYorumlar);
      
      // Başarı mesajı
      alert('Yorum başarıyla silindi!');
      
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      alert('Yorum silme sırasında bir hata oluştu.');
    }
  };

  const handleDurumGuncelle = async () => {
    if (!talep || !user || !['admin', 'akademisyen'].includes(userRole || '')) {
      return;
    }
    
    try {
      // Talep durumunu güncelle
      const { data, error } = await supabase
        .from('talepler')
        .update({ durum: yeniDurum })
        .eq('id', talep.id)
        .select()
        .single();
        
      if (error) {
        console.error('Durum güncelleme hatası:', error);
        return;
      }
      
      // Başarılı güncelleme
      setTalep({ ...talep, durum: yeniDurum });
      alert('Talep durumu güncellendi!');
      
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
    }
  };
  
  const handleVote = async () => {
    if (!user) {
      router.push(`/login?redirect=talep&id=${id}`);
      return;
    }
    
    if (!talep || !talep.id) {
      alert('Talep bilgisi bulunamadı. Lütfen sayfayı yenileyin.');
      return;
    }
    
    try {
      setOyVeriliyor(true);
      
      // Oy verme işlemini gerçekleştir (voteUtils.js'deki fonksiyonu kullan)
      const result = await toggleVote(talep.id, user.id);
      
      if (result.success) {
        // Başarılı oy işlemi, talep verilerini güncelle
        const { data: updatedTalep } = await supabase
          .from('talepler')
          .select('oy_sayisi')
          .eq('id', talep.id)
          .single();
        
        if (updatedTalep) {
          // Talep nesnesini güncelle
          setTalep(prev => ({
            ...prev,
            oy_sayisi: updatedTalep.oy_sayisi
          }));
          
          // Kullanıcının oy durumunu güncelle
          setHasVoted(result.action === "added");
        }
      } else {
        console.error("Oy verme hatası:", result.error);
        alert("Oy işlemi sırasında bir hata oluştu.");
      }
    } catch (error) {
      console.error('Oy verme hatası:', error);
      alert('Oy verme işlemi sırasında bir hata oluştu.');
    } finally {
      setOyVeriliyor(false);
    }
  };
  
  if (loading) {
    return (
      <Layout title="Talep Detayı">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
        </div>
      </Layout>
    );
  }
  
  if (!talep) {
    return (
      <Layout title="Talep Bulunamadı">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900">Talep bulunamadı</h2>
            <p className="mt-2 text-gray-600">İstediğiniz talep bulunamadı veya erişim izniniz yok.</p>
            <button 
              onClick={() => router.push('/talepler')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#8B0000] hover:bg-[#6B0000] focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000]"
            >
              Talepler Sayfasına Dön
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${talep.baslik} | Talep Detayı`}>
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => router.push('/talepler')}
          className="flex items-center text-[#8B0000] hover:text-[#6B0000] mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Talepler Listesine Dön
        </button>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          {/* Talep Başlık Bölümü */}
          <div className="bg-[#8B0000] text-white px-6 py-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Talep Detayı</h2>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full bg-white ${
                talep.durum === 'beklemede' ? 'text-yellow-700' :
                talep.durum === 'işlemde' ? 'text-blue-700' :
                talep.durum === 'cevaplandı' ? 'text-green-700' :
                talep.durum === 'çözüldü' ? 'text-purple-700' :
                'text-red-700'
              }`}>
                {talep.durum.charAt(0).toUpperCase() + talep.durum.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Talep İçerik Bölümü */}
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{talep.baslik}</h1>
            
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="bg-red-50 text-[#8B0000] text-xs font-medium px-2.5 py-1 rounded">
                {talep.kategori}
              </span>
              {talep.seffaflik === 'acik' && talep.kullanici && (
                <span className="text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {talep.kullanici.ad_soyad}
                </span>
              )}
              {talep.seffaflik === 'anonim' && (
                <span className="text-sm text-gray-600 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Anonim
                </span>
              )}
              <span className="text-sm text-gray-600 flex items-center ml-auto">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(talep.olusturulma_zamani).toLocaleString('tr-TR')}
              </span>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mb-6">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{talep.aciklama}</p>
            </div>
            
            <div className="flex items-center">
              <button 
                onClick={handleVote}
                disabled={oyVeriliyor}
                className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${hasVoted 
                  ? 'bg-red-50 text-[#8B0000] hover:bg-red-100' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
              >
                <ThumbsUp className={`h-4 w-4 mr-1 ${hasVoted ? 'text-[#8B0000] fill-[#8B0000]' : 'text-gray-600'}`} />
                <span>{talep.oy_sayisi || 0} kişi destekliyor {hasVoted && '(Destekliyorsunuz)'}</span>
              </button>
            </div>
            
            {/* Admin veya Akademisyen için Durum Güncelleme */}
            {['admin', 'akademisyen'].includes(userRole || '') && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-lg font-medium text-gray-800 mb-3">Durum Güncelle</h4>
                
                <div className="flex items-center space-x-3">
                  <select
                    value={yeniDurum}
                    onChange={(e) => setYeniDurum(e.target.value)}
                    className="block w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000]"
                  >
                    {durumlar.map((durum) => (
                      <option key={durum} value={durum}>{durum.charAt(0).toUpperCase() + durum.slice(1)}</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={handleDurumGuncelle}
                    className="px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000]"
                  >
                    Güncelle
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Yorumlar Bölümü */}
        <div id="yorumlar" className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Yorumlar ({yorumlar.length})
            </h3>
          </div>
          
          {/* Yorum Listesi */}
          <div className="divide-y divide-gray-200">
            {yorumlar.length === 0 ? (
              <div className="p-8 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-gray-500">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
              </div>
            ) : (
              yorumlar.map((yorum) => (
                <div key={yorum.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center mb-3">
                    <span className="font-medium text-gray-900">
                      {yorum.kullanici?.ad_soyad || 'Kullanıcı'}
                    </span>
                    {yorum.kullanici?.pozisyon && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        yorum.kullanici.pozisyon === 'admin' ? 'bg-red-50 text-[#8B0000]' :
                        yorum.kullanici.pozisyon === 'akademisyen' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {yorum.kullanici.pozisyon.charAt(0).toUpperCase() + yorum.kullanici.pozisyon.slice(1)}
                      </span>
                    )}
                    <span className="ml-auto text-sm text-gray-500">
                      {new Date(yorum.created_at).toLocaleString('tr-TR')}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{yorum.yorum}</p>
                  
                  {/* Admin veya yorumu yazan kişi için düzenleme/silme butonları */}
                  {(userRole === 'admin' || userRole === 'akademisyen' || (user && user.id === yorum.kullanici_id)) && (
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          if (confirm('Bu yorumu silmek istediğinize emin misiniz?')) {
                            handleYorumSil(yorum.id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Sil
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Yorum Ekleme Formu */}
          {user && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h4 className="text-lg font-medium text-gray-800 mb-3">Yorum Ekle</h4>
              <form onSubmit={handleYorumGonder}>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000] placeholder-gray-400"
                  placeholder="Yorumunuzu yazın..."
                  value={yeniYorum}
                  onChange={(e) => setYeniYorum(e.target.value)}
                  required
                  disabled={yorumEkleniyor}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={yorumEkleniyor || !yeniYorum.trim()}
                    className="px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {yorumEkleniyor ? 'Gönderiliyor...' : 'Yorumu Gönder'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {!user && (
            <div className="p-6 border-t border-gray-200 text-center bg-gray-50">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-gray-600 mb-3">Yorum yapmak için giriş yapmalısınız.</p>
              <button 
                onClick={() => router.push('/login')}
                className="px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000]"
              >
                Giriş Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}