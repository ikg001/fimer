import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Head from 'next/head';
import Link from 'next/link';
import { ThumbsUp, MessageCircle, Eye } from 'lucide-react';
import Layout from '../components/Layout';
import { toggleVote, checkUserVote } from '../lib/voteUtils';

export default function TaleplerPage() {
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [kategori, setKategori] = useState('Tümü');
  const [durum, setDurum] = useState('Tümü');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'akademisyen' | 'ogrenci' | null>(null);
  const [userVotes, setUserVotes] = useState<{[key: string]: boolean}>({});
  const router = useRouter();
  
  const kategoriler = ['Tümü', 'Akademik', 'İdari', 'Yemekhane', 'Ulaşım', 'Barınma', 'Teknik', 'Diğer'];
  const durumlar = ['Tümü', 'Beklemede', 'İşlemde', 'Cevaplandı', 'Çözüldü', 'Reddedildi'];

  // URL'den kategori parametresini al
  useEffect(() => {
    const { kategori: urlKategori } = router.query;
    if (urlKategori && typeof urlKategori === 'string') {
      setKategori(urlKategori);
    }
  }, [router.query]);

  const handleKategoriChange = (newKategori: string) => {
    setKategori(newKategori);
  };

  const handleDurumChange = (newDurum: string) => {
    setDurum(newDurum);
  };

  const handleVote = async (talepId: string) => {
    if (!currentUser) {
      router.push(`/login?redirect=talepler`);
      return;
    }
    
    try {
      // Oy verme işlemini gerçekleştir
      const result = await toggleVote(talepId, currentUser.id);
      
      if (result.success) {
        // Başarılı oy işlemi
        // Oy durumunu güncelle
        const isAdded = result.action === 'added';
        
        if (isAdded) {
          // Oy eklendi
          setUserVotes({...userVotes, [talepId]: true});
        } else {
          // Oy silindi
          const newUserVotes = {...userVotes};
          delete newUserVotes[talepId];
          setUserVotes(newUserVotes);
        }
        
        // Veritabanından güncel oy sayısını al
        const { data: updatedTalep } = await supabase
          .from('talepler')
          .select('oy_sayisi')
          .eq('id', talepId)
          .single();
        
        if (updatedTalep) {
          // Talepleri güncelle
          setTalepler(talepler.map(talep => {
            if (talep.id === talepId) {
              return { ...talep, oy_sayisi: updatedTalep.oy_sayisi };
            }
            return talep;
          }));
        }
      } else {
        console.error('Oy verme hatası:', result.error);
        alert('Oy işlemi sırasında bir hata oluştu.');
      }
    } catch (error) {
      console.error('Oy verme hatası:', error);
      alert('Oy işlemi sırasında bir hata oluştu.');
    }
  };

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        // Önce oturum bilgisini kontrol et
        const { data: { session } } = await supabase.auth.getSession();
        
        // Sorguları gerçekleştir
        await fetchTalepler(session?.user || null);
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };
    
    // Kullanıcı bilgilerini ve tüm talepleri getiren fonksiyon
    const fetchTalepler = async (user: any) => {
      try {
        if (user) {
          setCurrentUser(user);
          
          // Kullanıcı rolünü al
          const { data: profile } = await supabase
            .from('profiller')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setUserRole(profile.pozisyon);
          }
          
          // Kullanıcının oy verdiği talepleri al
          const { data: userVotesData } = await supabase
            .from('talep_oylar')
            .select('talep_id')
            .eq('kullanici_id', user.id);
            
          if (userVotesData) {
            const votesMap: {[key: string]: boolean} = {};
            userVotesData.forEach((vote: any) => {
              votesMap[vote.talep_id] = true;
            });
            setUserVotes(votesMap);
          }
          
          // Talepleri al - profiller tablosuyla birleştirme yapmadan
          let query = supabase.from('talepler').select()
            .order('updated_at', { ascending: false });
          
          // Rol bazlı filtreleme
          if (profile && profile.pozisyon === 'ogrenci') {
            // Öğrenciler sadece kendi taleplerini ve açık olanları görebilir
            query = query.or(`kullanici_id.eq.${user.id},seffaflik.eq.acik`);
          } else if (profile && profile.pozisyon === 'akademisyen') {
            // Akademisyenler kendi fakültelerindeki talepleri görebilir
            if (profile.fakulte) {
              query = query.eq('fakulte', profile.fakulte);
            }
          }
          // Admin tüm talepleri görebilir
          
          const { data, error } = await query;
          
          if (error) {
            console.error('Talep yükleme hatası:', error);
            return;
          }
          
          setTalepler(data || []);
        } else {
          // Kullanıcı giriş yapmamışsa, sadece açık talepleri göster
          const { data, error } = await supabase
            .from('talepler')
            .select()
            .eq('seffaflik', 'acik')
            .order('updated_at', { ascending: false });
            
          if (error) {
            console.error('Talep yükleme hatası:', error);
            return;
          }
          
          setTalepler(data || []);
        }
      } catch (error) {
        console.error('Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserAndData();
  }, []);

  // Filtrele
  const filtreliTalepler = talepler.filter(t => {
    const kategoriUygun = kategori === 'Tümü' || t.kategori === kategori;
    const durumUygun = durum === 'Tümü' || t.durum.toLowerCase() === durum.toLowerCase();
    return kategoriUygun && durumUygun;
  });

  return (
    <Layout title="Taleplerim">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="bg-[#8B0000] text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Tüm Talepler</h2>
            <p className="text-sm opacity-80">Talep ve isteklerinizi görüntüleyebilirsiniz</p>
          </div>
          
          {/* Filtreler */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                <div className="flex flex-wrap gap-2">
                  {kategoriler.map(kat => (
                    <button
                      key={kat}
                      className={`px-3 py-1 text-sm rounded-full ${kategori === kat ? 'bg-[#8B0000] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => handleKategoriChange(kat)}
                    >
                      {kat}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <div className="flex flex-wrap gap-2">
                  {durumlar.map(d => (
                    <button
                      key={d}
                      className={`px-3 py-1 text-sm rounded-full ${durum === d ? 'bg-[#8B0000] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                      onClick={() => handleDurumChange(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Talepler Listesi */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B0000]"></div>
              </div>
            ) : filtreliTalepler.length === 0 ? (
              <div className="text-gray-500 bg-gray-50 p-8 rounded-lg text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Seçilen filtrelere uygun talep bulunamadı.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filtreliTalepler.map((talep) => (
                  <div key={talep.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="p-5">
                      <div className="flex justify-between mb-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                          talep.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' :
                          talep.durum === 'işlemde' ? 'bg-blue-100 text-blue-800' :
                          talep.durum === 'cevaplandı' ? 'bg-green-100 text-green-800' :
                          talep.durum === 'çözüldü' ? 'bg-purple-100 text-purple-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {talep.durum.charAt(0).toUpperCase() + talep.durum.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(talep.olusturulma_zamani).toLocaleString('tr-TR')}
                        </span>
                      </div>
                      
                      <h2 className="text-lg font-semibold text-gray-800 mb-2">{talep.baslik}</h2>
                      
                      <div className="flex items-center mb-3">
                        <span className="bg-red-50 text-[#8B0000] text-xs font-medium px-2.5 py-0.5 rounded">
                          {talep.kategori}
                        </span>
                        {talep.seffaflik === 'acik' && talep.kullanici && (
                          <span className="ml-2 text-sm text-gray-500">
                            {talep.kullanici.ad_soyad}
                          </span>
                        )}
                        {talep.seffaflik === 'anonim' && (
                          <span className="ml-2 text-sm text-gray-500">
                            Anonim
                          </span>
                        )}
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">{talep.aciklama}</p>
                      
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                        <div className="flex space-x-4">
                          <button 
                            className={`flex items-center ${userVotes[talep.id] ? 'text-[#8B0000]' : 'text-gray-500'} mr-3`}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleVote(talep.id);
                            }}
                          >
                            <ThumbsUp className={`h-3 w-3 mr-1 ${userVotes[talep.id] ? 'fill-[#8B0000]' : ''}`} />
                            <span>{talep.oy_sayisi || 0}</span>
                          </button>
                          <button 
                            className="flex items-center text-gray-500 hover:text-[#8B0000]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              router.push(`/talep/${talep.id}#yorumlar`);
                            }}
                          >
                            <MessageCircle className="h-3 w-3 mr-1" />
                            <span>{talep.yorumlar?.length || 0}</span>
                          </button>
                        </div>
                        
                        <Link href={`/talep/${talep.id}`} className="flex items-center text-gray-500 hover:text-[#8B0000]">
                          <Eye className="h-4 w-4 mr-1" />
                          <span>Detaylar</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center mt-6">
          <Link 
            href="/talep-gonder" 
            className="px-6 py-3 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors shadow-md"
          >
            Yeni Talep Oluştur
          </Link>
        </div>
      </div>
    </Layout>
  );
}