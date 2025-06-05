import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { ThumbsUp, MessageCircle, Trash2, Edit, Eye, Filter, Search } from 'lucide-react';

export default function TaleplerYonetim() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [talepler, setTalepler] = useState<any[]>([]);
  const [filteredTalepler, setFilteredTalepler] = useState<any[]>([]);
  const [kategori, setKategori] = useState('Tümü');
  const [durum, setDurum] = useState('Tümü');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTalepId, setSelectedTalepId] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  
  const kategoriler = ['Tümü', 'Akademik', 'İdari', 'Yemekhane', 'Ulaşım', 'Barınma', 'Teknik', 'Güvenlik', 'Diğer'];
  const durumlar = ['Tümü', 'Beklemede', 'İşlemde', 'Cevaplandı', 'Çözüldü', 'Reddedildi'];

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login?redirect=talepler-yonetim');
          return;
        }
        
        // Kullanıcı bilgilerini al
        const { data: profile } = await supabase
          .from('profiller')
          .select('*')
          .eq('id', user.id)
          .single();
          
        // Kullanıcı admin değilse ana sayfaya yönlendir
        if (!profile || profile.pozisyon !== 'admin') {
          alert('Bu sayfaya erişim yetkiniz bulunmamaktadır. Sadece admin kullanıcılar erişebilir.');
          router.push('/dashboard');
          return;
        }
        
        setUser({
          ...user,
          profile
        });
        
        // Tüm talepleri getir
        await fetchTalepler();
        
        setLoading(false);
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        router.push('/login');
      }
    };
    
    checkSession();
  }, [router]);
  
  // Talepleri getir
  const fetchTalepler = async () => {
    try {
      const { data, error } = await supabase
        .from('talepler')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) {
        console.error('Talep yükleme hatası:', error);
        return;
      }
      
      setTalepler(data || []);
      setFilteredTalepler(data || []);
    } catch (error) {
      console.error('Talep yükleme hatası:', error);
    }
  };
  
  // Filtreleme işlemi
  useEffect(() => {
    let filtered = [...talepler];
    
    // Kategori filtresi
    if (kategori !== 'Tümü') {
      filtered = filtered.filter(talep => talep.kategori === kategori);
    }
    
    // Durum filtresi
    if (durum !== 'Tümü') {
      filtered = filtered.filter(talep => talep.durum.toLowerCase() === durum.toLowerCase());
    }
    
    // Arama filtresi
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(talep => 
        talep.baslik.toLowerCase().includes(query) || 
        talep.aciklama.toLowerCase().includes(query)
      );
    }
    
    setFilteredTalepler(filtered);
  }, [talepler, kategori, durum, searchQuery]);
  
  // Talep silme
  const deleteTalep = async () => {
    if (!selectedTalepId) return;
    
    try {
      // Önce talep oylarını sil
      await supabase
        .from('talep_oylar')
        .delete()
        .eq('talep_id', selectedTalepId);
        
      // Şimdi talebi sil
      const { error } = await supabase
        .from('talepler')
        .delete()
        .eq('id', selectedTalepId);
        
      if (error) throw error;
      
      // Talepleri güncelle
      setTalepler(talepler.filter(talep => talep.id !== selectedTalepId));
      
      // Modalı kapat
      setShowDeleteModal(false);
      setSelectedTalepId(null);
      
      alert('Talep başarıyla silindi');
    } catch (error) {
      console.error('Talep silme hatası:', error);
      alert('Talep silinirken bir hata oluştu');
    }
  };
  
  // Talep durumunu güncelle
  const updateTalepStatus = async () => {
    if (!selectedTalepId || !selectedStatus) return;
    
    try {
      const { error } = await supabase
        .from('talepler')
        .update({ durum: selectedStatus.toLowerCase() })
        .eq('id', selectedTalepId);
        
      if (error) throw error;
      
      // Talepleri güncelle
      setTalepler(talepler.map(talep => 
        talep.id === selectedTalepId ? { ...talep, durum: selectedStatus.toLowerCase() } : talep
      ));
      
      // Modalı kapat
      setShowStatusModal(false);
      setSelectedTalepId(null);
      setSelectedStatus('');
      
      alert(`Talep durumu "${selectedStatus}" olarak güncellendi`);
    } catch (error) {
      console.error('Talep durumu güncelleme hatası:', error);
      alert('Talep durumu güncellenirken bir hata oluştu');
    }
  };
  
  // Durum değiştirme modalını aç
  const openStatusModal = (talepId: string, currentStatus: string) => {
    setSelectedTalepId(talepId);
    setSelectedStatus(currentStatus);
    setShowStatusModal(true);
  };
  
  // Silme modalını aç
  const openDeleteModal = (talepId: string) => {
    setSelectedTalepId(talepId);
    setShowDeleteModal(true);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }
  
  return (
    <Layout title="Talep Yönetimi">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="bg-[#8B0000] text-white px-6 py-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Talep Yönetimi</h2>
              <p className="text-sm opacity-80">Tüm talepleri görüntüle, düzenle veya sil</p>
            </div>
            <button 
              onClick={() => router.push('/talep-gonder')}
              className="bg-white text-[#8B0000] px-4 py-2 rounded text-sm hover:bg-gray-100 transition-colors"
            >
              Yeni Talep
            </button>
          </div>
          
          {/* Filtreler */}
          <div className="p-4 border-b">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <Filter className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Filtreler:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <select 
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 border-none focus:ring-2 focus:ring-[#8B0000]"
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                >
                  {kategoriler.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
                
                <select 
                  className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 border-none focus:ring-2 focus:ring-[#8B0000]"
                  value={durum}
                  onChange={(e) => setDurum(e.target.value)}
                >
                  {durumlar.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative ml-auto">
                <input
                  type="text"
                  placeholder="Taleplerde ara..."
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Talepler Listesi */}
          <div className="divide-y">
            {filteredTalepler.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Filtrelere uygun talep bulunamadı.</p>
                <p className="mt-2 text-sm">Lütfen farklı filtreler deneyin veya yeni bir talep oluşturun.</p>
              </div>
            ) : (
              filteredTalepler.map(talep => (
                <div key={talep.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{talep.baslik}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{talep.aciklama}</p>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {talep.kategori}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          talep.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' : 
                          talep.durum === 'işlemde' ? 'bg-blue-100 text-blue-800' : 
                          talep.durum === 'cevaplandı' ? 'bg-green-100 text-green-800' : 
                          talep.durum === 'çözüldü' ? 'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {talep.durum.charAt(0).toUpperCase() + talep.durum.slice(1)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => router.push(`/talep/${talep.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        title="Görüntüle"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => openStatusModal(talep.id, talep.durum)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                        title="Durumu Değiştir"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => openDeleteModal(talep.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        title="Sil"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <div className="flex items-center">
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span className="mr-3">{talep.oy_sayisi || 0}</span>
                      <MessageCircle className="h-3 w-3 mr-1" />
                      <span>{talep.yorumlar?.length || 0}</span>
                    </div>
                    <div>
                      {new Date(talep.updated_at || talep.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Talebi Sil</h3>
            <p className="text-gray-700 mb-4">Bu talebi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowDeleteModal(false)}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                onClick={deleteTalep}
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Durum Değiştirme Modalı */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Talep Durumunu Değiştir</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Durum
              </label>
              <select 
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Durum Seçin</option>
                <option value="beklemede">Beklemede</option>
                <option value="işlemde">İşlemde</option>
                <option value="cevaplandı">Cevaplandı</option>
                <option value="çözüldü">Çözüldü</option>
                <option value="reddedildi">Reddedildi</option>
              </select>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowStatusModal(false)}
              >
                İptal
              </button>
              <button
                className="px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000]"
                onClick={updateTalepStatus}
                disabled={!selectedStatus}
              >
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
