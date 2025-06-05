import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [talepler, setTalepler] = useState<any[]>([]);
  const [loadingTalepler, setLoadingTalepler] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Kullanıcı bilgilerini al
      const { data: profile } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', user.id)
        .single();
        
      setUser({
        ...user,
        profile
      });
      
      setLoading(false);
      
      // Kullanıcının taleplerini al
      await fetchUserTalepler(user.id);
    };
    
    checkSession();
  }, [router]);
  
  const fetchUserTalepler = async (userId: string) => {
    try {
      setLoadingTalepler(true);
      
      const { data, error } = await supabase
        .from('talepler')
        .select('*')
        .eq('kullanici_id', userId);
      
      if (error) {
        console.error('Talep yükleme hatası:', error);
        return;
      }
      
      setTalepler(data || []);
    } catch (error) {
      console.error('Talep yükleme hatası:', error);
    } finally {
      setLoadingTalepler(false);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }

  return (
    <Layout title="Kontrol Paneli">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#8B0000] text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Merkezi Kimlik Doğrulama Servisi</h2>
            <p className="text-sm opacity-80">Kullanıcı Kontrol Paneli</p>
          </div>
          
          {/* Tabs */}
          <div className="flex border-b">
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'profile' ? 'border-b-2 border-[#8B0000] text-[#8B0000]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('profile')}
            >
              Profil Bilgileri
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'requests' ? 'border-b-2 border-[#8B0000] text-[#8B0000]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('requests')}
            >
              Taleplerim
            </button>
            <button 
              className={`px-6 py-3 text-sm font-medium ${activeTab === 'settings' ? 'border-b-2 border-[#8B0000] text-[#8B0000]' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('settings')}
            >
              Ayarlar
            </button>
          </div>

          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Kullanıcı Bilgileri</h3>
                  
                  <div className="space-y-3">
                    <div className="flex border-b border-gray-200 pb-3">
                      <span className="text-gray-600 w-1/3">Kullanıcı Adı:</span>
                      <span className="text-gray-900 font-medium">{user.email}</span>
                    </div>
                    
                    <div className="flex border-b border-gray-200 pb-3">
                      <span className="text-gray-600 w-1/3">Ad Soyad:</span>
                      <span className="text-gray-900 font-medium">{user.profile?.ad_soyad || '-'}</span>
                    </div>
                    
                    <div className="flex border-b border-gray-200 pb-3">
                      <span className="text-gray-600 w-1/3">Fakülte:</span>
                      <span className="text-gray-900 font-medium">{user.profile?.fakulte || '-'}</span>
                    </div>
                    
                    <div className="flex">
                      <span className="text-gray-600 w-1/3">Hesap Tipi:</span>
                      <span className="text-gray-900 font-medium">
                        {user.profile?.pozisyon === 'admin' ? 'Yönetici' : 
                         user.profile?.pozisyon === 'akademisyen' ? 'Akademisyen' : 
                         user.profile?.pozisyon === 'ogrenci' ? 'Öğrenci' : 'Kullanıcı'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Hızlı İşlemler</h3>
                  
                  <div className="space-y-3">
                    {/* Yeni Talep Oluştur butonu - Tüm kullanıcılar için */}
                    <button 
                      onClick={() => router.push('/talep-gonder')}
                      className="w-full bg-[#8B0000] text-white py-2 rounded hover:bg-[#6B0000] transition-colors"
                    >
                      Yeni Talep Oluştur
                    </button>
                    
                    {/* Talepleri Düzenle butonu - Sadece admin kullanıcılar için */}
                    {user.profile?.pozisyon === 'admin' && (
                      <button 
                        onClick={() => router.push('/talepler-yonetim')}
                        className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition-colors"
                      >
                        Talepleri Düzenle
                      </button>
                    )}
                    
                    <button 
                      onClick={handleSignOut}
                      className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-100 transition-colors"
                    >
                      Çıkış Yap
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Requests Tab Content */}
          {activeTab === 'requests' && (
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-800">Taleplerim</h3>
                  {/* Yeni Talep butonu - Tüm kullanıcılar için */}
                  <button 
                    onClick={() => router.push('/talep-gonder')}
                    className="bg-[#8B0000] text-white px-4 py-2 rounded text-sm hover:bg-[#6B0000] transition-colors"
                  >
                    Yeni Talep
                  </button>
                </div>
              </div>
              
              <div className="bg-white border rounded-lg overflow-hidden">
                {loadingTalepler ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#8B0000] mx-auto"></div>
                    <p className="mt-2 text-gray-500">Talepleriniz yükleniyor...</p>
                  </div>
                ) : talepler.length === 0 ? (
                  <div className="p-8 text-center text-gray-500" data-component-name="Dashboard">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p data-component-name="Dashboard">Henüz aktif talebiniz bulunmuyor.</p>
                    <p className="mt-2 text-sm" data-component-name="Dashboard">Yeni bir talep oluşturmak için "Yeni Talep" butonuna tıklayın.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {talepler.map((talep) => (
                      <div key={talep.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/talep/${talep.id}`)}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900">{talep.baslik}</h4>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{talep.aciklama}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${talep.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' : 
                            talep.durum === 'işlemde' ? 'bg-blue-100 text-blue-800' : 
                            talep.durum === 'cevaplandı' ? 'bg-green-100 text-green-800' : 
                            talep.durum === 'çözüldü' ? 'bg-green-100 text-green-800' : 
                            'bg-red-100 text-red-800'}`}>
                            {talep.durum.charAt(0).toUpperCase() + talep.durum.slice(1)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                          <div>
                            <span className="bg-gray-100 px-2 py-1 rounded">{talep.kategori}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">• Oy: {talep.oy_sayisi || 0}</span>
                            <span>{new Date(talep.updated_at || talep.olusturulma_zamani).toLocaleDateString('tr-TR')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Settings Tab Content */}
          {activeTab === 'settings' && (
            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Hesap Ayarları</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Şifre Değiştir</label>
                    <button className="bg-[#8B0000] text-white px-4 py-2 rounded text-sm hover:bg-[#6B0000] transition-colors">
                      Şifre Değiştir
                    </button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <label className="block text-gray-700 mb-2">Hesabı Kapat</label>
                    <button className="border border-red-500 text-red-500 px-4 py-2 rounded text-sm hover:bg-red-50 transition-colors">
                      Hesabımı Kapat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}