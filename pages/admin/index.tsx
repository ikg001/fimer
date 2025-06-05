import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';
import { Users, FileText, UserPlus, LogOut, Search } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Kullanıcı admin mi kontrol et
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setLoading(true);
        
        // Kullanıcı bilgilerini al
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          router.push('/login?redirect=admin');
          return;
        }
        
        // Admin mi kontrol et
        const { data: profile } = await supabase
          .from('profiller')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!profile || profile.pozisyon !== 'admin') {
          // Admin değilse login sayfasına yönlendir
          await supabase.auth.signOut();
          router.push('/login?redirect=admin');
          return;
        }
        
        setUser({
          ...user,
          profile
        });
        
        // Kullanıcıları ve talepleri yükle
        await Promise.all([
          fetchUsers(),
          fetchRequests()
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Admin kontrol hatası:', error);
        router.push('/login');
      }
    };
    
    checkAdmin();
  }, [router]);
  
  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      // Tüm kullanıcıları getir
      const { data: profiles, error } = await supabase
        .from('profiller')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setUsers(profiles || []);
    } catch (error) {
      console.error('Kullanıcıları getirme hatası:', error);
    }
  };
  
  // Talepleri getir
  const fetchRequests = async () => {
    try {
      // Tüm talepleri getir
      const { data, error } = await supabase
        .from('talepler')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setRequests(data || []);
    } catch (error) {
      console.error('Talepleri getirme hatası:', error);
    }
  };
  
  // Talebi sil
  const deleteRequest = async (id: string) => {
    if (!confirm('Bu talebi silmek istediğinize emin misiniz?')) return;
    
    try {
      // Önce talep oylarını sil
      await supabase
        .from('talep_oylar')
        .delete()
        .eq('talep_id', id);
        
      // Şimdi talebi sil
      const { error } = await supabase
        .from('talepler')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Talepleri güncelle
      setRequests(requests.filter(req => req.id !== id));
      
      alert('Talep başarıyla silindi');
    } catch (error) {
      console.error('Talep silme hatası:', error);
      alert('Talep silinirken bir hata oluştu');
    }
  };
  
  // Talep durumunu güncelle
  const updateRequestStatus = async (id: string, durum: string) => {
    try {
      const { error } = await supabase
        .from('talepler')
        .update({ durum })
        .eq('id', id);
        
      if (error) throw error;
      
      // Talepleri güncelle
      setRequests(requests.map(req => 
        req.id === id ? { ...req, durum } : req
      ));
      
      alert(`Talep durumu "${durum}" olarak güncellendi`);
    } catch (error) {
      console.error('Talep durumu güncelleme hatası:', error);
      alert('Talep durumu güncellenirken bir hata oluştu');
    }
  };
  
  // Yeni admin ekle
  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAdminEmail) {
      setErrorMessage('Lütfen bir email adresi girin');
      return;
    }
    
    try {
      setAddingAdmin(true);
      setErrorMessage('');
      
      // Kullanıcıyı email ile bul
      const { data: profile, error: profileError } = await supabase
        .from('profiller')
        .select('*')
        .eq('email', newAdminEmail)
        .single();
        
      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setErrorMessage('Bu email adresi ile kayıtlı bir kullanıcı bulunamadı');
        } else {
          throw profileError;
        }
        return;
      }
      
      // Kullanıcıyı admin yap
      const { error: updateError } = await supabase
        .from('profiller')
        .update({ pozisyon: 'admin' })
        .eq('id', profile.id);
        
      if (updateError) throw updateError;
      
      // Kullanıcıları güncelle
      await fetchUsers();
      
      setNewAdminEmail('');
      setShowAddAdminModal(false);
      alert('Kullanıcı başarıyla admin yapıldı');
    } catch (error) {
      console.error('Admin ekleme hatası:', error);
      setErrorMessage('Admin eklenirken bir hata oluştu');
    } finally {
      setAddingAdmin(false);
    }
  };
  
  // Çıkış yap
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  
  // Arama filtreleme
  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.ad_soyad?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.pozisyon?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredRequests = requests.filter(req => 
    req.baslik?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.aciklama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.kategori?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    req.durum?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }
  
  return (
    <>
      <Head>
        <title>Admin Paneli | Fırat Üniversitesi</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#8B0000] text-white">
          <div className="p-4 border-b border-[#6B0000]">
            <h1 className="text-xl font-semibold">Admin Paneli</h1>
            <p className="text-sm opacity-75">Fırat Üniversitesi</p>
          </div>
          
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm opacity-75">Giriş yapan:</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            
            <nav className="mt-8 space-y-2">
              <button 
                className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'users' ? 'bg-[#6B0000]' : 'hover:bg-[#6B0000]'}`}
                onClick={() => setActiveTab('users')}
              >
                <Users className="h-5 w-5 mr-3" />
                <span>Kullanıcılar</span>
              </button>
              
              <button 
                className={`flex items-center w-full p-3 rounded-md transition-colors ${activeTab === 'requests' ? 'bg-[#6B0000]' : 'hover:bg-[#6B0000]'}`}
                onClick={() => setActiveTab('requests')}
              >
                <FileText className="h-5 w-5 mr-3" />
                <span>Talepler</span>
              </button>
              
              <button 
                className="flex items-center w-full p-3 rounded-md transition-colors hover:bg-[#6B0000]"
                onClick={() => setShowAddAdminModal(true)}
              >
                <UserPlus className="h-5 w-5 mr-3" />
                <span>Admin Ekle</span>
              </button>
              
              <button 
                className="flex items-center w-full p-3 rounded-md transition-colors hover:bg-[#6B0000] mt-8"
                onClick={handleSignOut}
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span>Çıkış Yap</span>
              </button>
            </nav>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {activeTab === 'users' ? 'Kullanıcı Yönetimi' : 'Talep Yönetimi'}
              </h2>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ara..."
                  className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kullanıcı
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fakülte
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-[#8B0000] rounded-full flex items-center justify-center text-white">
                              {user.ad_soyad ? user.ad_soyad.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.ad_soyad || 'İsimsiz Kullanıcı'}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.pozisyon === 'admin' ? 'bg-purple-100 text-purple-800' : 
                              user.pozisyon === 'akademisyen' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'}`}>
                            {user.pozisyon === 'admin' ? 'Admin' : 
                             user.pozisyon === 'akademisyen' ? 'Akademisyen' : 
                             user.pozisyon === 'ogrenci' ? 'Öğrenci' : 'Kullanıcı'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.fakulte || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Aktif
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {/* Requests Tab */}
            {activeTab === 'requests' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Talep
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durum
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Oy
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{request.baslik}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">{request.aciklama}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {request.kategori}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select 
                            className={`px-2 py-1 text-xs rounded-full border-0 
                              ${request.durum === 'beklemede' ? 'bg-yellow-100 text-yellow-800' : 
                                request.durum === 'işlemde' ? 'bg-blue-100 text-blue-800' : 
                                request.durum === 'cevaplandı' ? 'bg-green-100 text-green-800' : 
                                request.durum === 'çözüldü' ? 'bg-green-100 text-green-800' : 
                                'bg-red-100 text-red-800'}`}
                            value={request.durum}
                            onChange={(e) => updateRequestStatus(request.id, e.target.value)}
                          >
                            <option value="beklemede">Beklemede</option>
                            <option value="işlemde">İşlemde</option>
                            <option value="cevaplandı">Cevaplandı</option>
                            <option value="çözüldü">Çözüldü</option>
                            <option value="reddedildi">Reddedildi</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {request.oy_sayisi || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button 
                            onClick={() => router.push(`/talep/${request.id}`)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Görüntüle
                          </button>
                          <button 
                            onClick={() => deleteRequest(request.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Yeni Admin Ekle</h3>
            
            {errorMessage && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}
            
            <form onSubmit={addAdmin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Kullanıcı Email Adresi
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#8B0000] focus:border-transparent"
                  placeholder="ornek@firat.edu.tr"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Bu email adresi ile kayıtlı bir kullanıcı olmalıdır.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowAddAdminModal(false)}
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] disabled:opacity-50"
                  disabled={addingAdmin}
                >
                  {addingAdmin ? 'Ekleniyor...' : 'Admin Yap'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
