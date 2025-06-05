import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import Link from 'next/link';
import { ThumbsUp } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const kategoriler = ['Akademik', 'İdari', 'Yemekhane', 'Ulaşım', 'Barınma', 'Teknik', 'Güvenlik', 'Diğer'];
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [taleplerByKategori, setTaleplerByKategori] = useState<{[key: string]: any[]}>({});
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsLoggedIn(true);
        
        // Kullanıcının oylarını al
        const { data: votes } = await supabase
          .from('talep_oylar')
          .select('talep_id')
          .eq('kullanici_id', user.id);
          
        if (votes) {
          const votesMap: {[key: string]: boolean} = {};
          votes.forEach((vote: any) => {
            votesMap[vote.talep_id] = true;
          });
          setUserVotes(votesMap);
        }
        
        // Kategorilere göre talepleri al
        await fetchTalepler();
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);
  
  const fetchTalepler = async () => {
    try {
      // Tüm kategoriler için talepleri al
      const { data: talepler, error } = await supabase
        .from('talepler')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
        
      if (error) {
        console.error('Talepler yüklenirken hata:', error);
        return;
      }
      
      // Talepleri kategorilere göre grupla
      const talepMap: {[key: string]: any[]} = {};
      
      kategoriler.forEach(kategori => {
        talepMap[kategori] = talepler?.filter(talep => talep.kategori === kategori) || [];
      });
      
      setTaleplerByKategori(talepMap);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
    }
  };
  
  const handleKategoriClick = (kategori: string) => {
    if (!isLoggedIn) {
      // Kategori bilgisini URL parametresi olarak ekle
      router.push(`/login?redirect=talepler&kategori=${kategori}`);
    } else {
      // Zaten giriş yapmış kullanıcıyı talepler sayfasına yönlendir
      router.push(`/talepler?kategori=${kategori}`);
    }
  };
  
  const handleVote = async (talepId: string) => {
    if (!isLoggedIn || !user) {
      router.push(`/login?redirect=talep&id=${talepId}`);
      return;
    }
    
    try {
      // Kullanıcı daha önce oy vermiş mi kontrol et
      if (userVotes[talepId]) {
        // Daha önce oy verilmiş, oyu kaldır
        await supabase
          .from('talep_oylar')
          .delete()
          .eq('kullanici_id', user.id)
          .eq('talep_id', talepId);
          
        // Talep oy sayısını azalt
        await supabase
          .from('talepler')
          .update({ oy_sayisi: supabase.rpc('decrement', { x: 1 }) })
          .eq('id', talepId);
          
        // State'i güncelle
        const newUserVotes = {...userVotes};
        delete newUserVotes[talepId];
        setUserVotes(newUserVotes);
        
        // Talepleri yenile
        await fetchTalepler();
      } else {
        // Yeni oy ekle
        await supabase
          .from('talep_oylar')
          .insert({
            kullanici_id: user.id,
            talep_id: talepId,
            created_at: new Date().toISOString()
          });
          
        // Talep oy sayısını artır
        await supabase
          .from('talepler')
          .update({ oy_sayisi: supabase.rpc('increment', { x: 1 }) })
          .eq('id', talepId);
          
        // State'i güncelle
        setUserVotes({...userVotes, [talepId]: true});
        
        // Talepleri yenile
        await fetchTalepler();
      }
    } catch (error) {
      console.error('Oy verme hatası:', error);
    }
  };

  return (
    <Layout title="Merkezi Kimlik Doğrulama Servisi" description="Fırat Üniversitesi Merkezi Kimlik Doğrulama Servisi">
      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-[#8B0000] text-white px-6 py-4">
                <h2 className="text-xl font-semibold">Merkezi Kimlik Doğrulama Servisi</h2>
              </div>
              <div className="p-6">
                <div className="text-center py-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-4">
                    Fırat Üniversitesi Talep Yönetim Sistemi
                  </h1>
                  <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                    Sisteme giriş yaparak taleplerinizi oluşturabilir, takip edebilir ve yönetebilirsiniz.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      onClick={() => router.push('/login')}
                      className="px-6 py-3 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors"
                    >
                      Giriş Yap
                    </button>
                    <button
                      onClick={() => router.push('/register')}
                      className="px-6 py-3 border border-[#8B0000] text-[#8B0000] rounded-md hover:bg-red-50 transition-colors"
                    >
                      Kayıt Ol
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Talep Oluştur</h3>
                  </div>
                  <p className="text-gray-600">
                    Yeni talep oluşturarak destek ekibimize hızlıca ulaşabilir, sorunlarınızı çözebilirsiniz.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-100 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8B0000]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800">Talepleri Takip Et</h3>
                  </div>
                  <p className="text-gray-600">
                    Oluşturduğunuz taleplerin durumunu anlık olarak takip edebilir, güncellemeleri görebilirsiniz.
                  </p>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-medium text-gray-800">Talep Kategorileri</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {kategoriler.map((kategori) => (
                    <div 
                      key={kategori} 
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => handleKategoriClick(kategori)}
                    >
                      <div className="text-center mb-3">
                        <span className="text-[#8B0000] font-medium">{kategori}</span>
                      </div>
                      
                      {/* Kategorideki talepler */}
                      {isLoggedIn && taleplerByKategori[kategori] && taleplerByKategori[kategori].length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {taleplerByKategori[kategori].slice(0, 2).map((talep) => (
                            <div key={talep.id} className="border border-gray-200 rounded p-2 bg-white text-left">
                              <Link href={`/talep/${talep.id}`} className="block">
                                <h4 className="text-sm font-medium text-gray-800 truncate">{talep.baslik}</h4>
                              </Link>
                              <div className="flex items-center justify-between mt-1">
                                <div className="text-xs text-gray-500">
                                  {new Date(talep.olusturulma_zamani).toLocaleDateString('tr-TR')}
                                </div>
                                <button 
                                  className={`flex items-center text-xs ${userVotes[talep.id] ? 'text-[#8B0000]' : 'text-gray-500'}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVote(talep.id);
                                  }}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1" />
                                  {talep.oy_sayisi || 0}
                                </button>
                              </div>
                            </div>
                          ))}
                          {taleplerByKategori[kategori].length > 2 && (
                            <div className="text-center mt-1">
                              <Link href={`/talepler?kategori=${kategori}`} className="text-xs text-[#8B0000] hover:underline">
                                Daha fazla göster ({taleplerByKategori[kategori].length - 2} talep daha)
                              </Link>
                            </div>
                          )}
                        </div>
                      ) : isLoggedIn ? (
                        <div className="text-center text-xs text-gray-500 mt-2">
                          Bu kategoride henüz talep bulunmuyor
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
      </div>
    </Layout>
  );
}