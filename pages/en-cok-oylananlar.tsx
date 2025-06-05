import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { ThumbsUp, MessageSquare, Calendar, User, Tag, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toggleVote, checkUserVote } from '../lib/voteUtils';

export default function EnCokOylananlar() {
  const router = useRouter();
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVotes, setUserVotes] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      try {
        // Kullanıcı oturum bilgisini kontrol et
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (user) {
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
        }
        
        // Talepleri getir
        await fetchTalepler();
      } catch (error) {
        console.error('Kullanıcı bilgisi alınırken hata:', error);
        // Hata durumunda da talepleri getir
        await fetchTalepler();
      }
    };
    
    checkUserAndFetchData();
  }, []);
  
  // Oy verme işlemi
  const handleVote = async (e: React.MouseEvent, talepId: string) => {
    e.stopPropagation(); // Talep detay sayfasına yönlendirmeyi engelle
    
    if (!currentUser) {
      router.push(`/login?redirect=en-cok-oylananlar`);
      return;
    }
    
    try {
      // Kullanıcı daha önce oy vermiş mi kontrol et
      const hasVoted = userVotes[talepId];
      
      // Yeni oy işleme fonksiyonunu kullan
      const { success, newVoteCount } = await toggleVote(talepId, currentUser.id, hasVoted);
      
      if (success) {
        if (hasVoted) {
          // Oyu geri çekme durumu
          const newUserVotes = {...userVotes};
          delete newUserVotes[talepId];
          setUserVotes(newUserVotes);
        } else {
          // Yeni oy verme durumu
          setUserVotes({...userVotes, [talepId]: true});
        }
        
        // Talepleri güncelle
        setTalepler(talepler.map(talep => {
          if (talep.id === talepId) {
            return { ...talep, oy_sayisi: newVoteCount };
          }
          return talep;
        }));
      }
    } catch (error) {
      console.error('Oy verme hatası:', error);
    }
  };

  const fetchTalepler = async () => {
    try {
      setLoading(true);
      
      // Talepleri oy sayısına göre sırala (en çok oylanan en üstte)
      const { data, error } = await supabase
        .from('talepler')
        .select('*')
        .order('oy_sayisi', { ascending: false });
      
      if (error) {
        throw error;
      }
        
      // Eğer veriler başarıyla gelirse, her talep için kullanıcı bilgilerini ayrıca al
      if (data && data.length > 0) {
        // Kullanıcı ID'lerini topla
        const userIds = data.map(talep => talep.kullanici_id);
        
        // Kullanıcı profillerini al
        const { data: profiles } = await supabase
          .from('profiller')
          .select('id, ad_soyad, email, pozisyon')
          .in('id', userIds);
          
        // Profil bilgilerini taleplere ekle
        if (profiles) {
          data.forEach(talep => {
            talep.profil = profiles.find(profile => profile.id === talep.kullanici_id);
          });
        }
      }
      
      setTalepler(data || []);
    } catch (err: any) {
      console.error('Talep yükleme hatası:', err);
      setError('Talepler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true,
        locale: tr
      });
    } catch (e) {
      return 'Geçersiz tarih';
    }
  };

  const getDurumRenk = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return 'bg-yellow-100 text-yellow-800';
      case 'inceleniyor':
        return 'bg-blue-100 text-blue-800';
      case 'cozuldu':
        return 'bg-green-100 text-green-800';
      case 'reddedildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDurumText = (durum: string) => {
    switch (durum) {
      case 'beklemede':
        return 'Beklemede';
      case 'inceleniyor':
        return 'İnceleniyor';
      case 'cozuldu':
        return 'Çözüldü';
      case 'reddedildi':
        return 'Reddedildi';
      default:
        return 'Bilinmiyor';
    }
  };

  return (
    <Layout title="En Çok Oylanan Talepler">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#8B0000] text-white px-6 py-4">
            <h2 className="text-xl font-semibold">En Çok Oylanan Talepler</h2>
            <p className="text-sm opacity-80">Fırat Üniversitesi talep sistemi</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {talepler.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>Henüz hiç talep bulunmuyor.</p>
                </div>
              ) : (
                talepler.map((talep) => (
                  <div 
                    key={talep.id} 
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/talep/${talep.id}`)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">{talep.baslik}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{talep.aciklama}</p>
                        
                        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDate(talep.created_at)}
                          </div>
                          
                          <div className="flex items-center">
                            <Tag className="h-3 w-3 mr-1" />
                            {talep.kategori}
                          </div>
                          
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            {talep.seffaflik === true ? 
                              (talep.profil?.ad_soyad || 'İsimsiz Kullanıcı') : 
                              'Anonim'
                            }
                          </div>
                          
                          <div className="flex items-center">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            {talep.yorum_sayisi || 0} yorum
                          </div>
                          
                          <button 
                            onClick={(e) => handleVote(e, talep.id)}
                            className={`flex items-center text-sm px-2 py-1 rounded-md ${userVotes[talep.id] ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                          >
                            <ThumbsUp className={`h-3 w-3 mr-1 ${userVotes[talep.id] ? 'fill-blue-500' : ''}`} />
                            {talep.oy_sayisi || 0} oy
                          </button>
                        </div>
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDurumRenk(talep.durum)}`}>
                          {getDurumText(talep.durum)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
