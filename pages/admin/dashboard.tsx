import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabaseClient';

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [talepler, setTalepler] = useState<any[]>([]);
  const [taleplerLoading, setTaleplerLoading] = useState(true);
  const durumlar = ['beklemede', 'onaylandı', 'reddedildi'];
  const [editStates, setEditStates] = useState<{[key: string]: {durum: string, mesaj: string}}>({});

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      // Kullanıcı bilgilerini al
      const { data: profile } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // Admin kontrolü
      if (!profile || profile.pozisyon !== 'admin') {
        // Admin değilse normal kullanıcı paneline yönlendir
        router.push('/dashboard');
        return;
      }
      
      setUser({
        ...user,
        profile
      });
      
      setLoading(false);
      // Talepleri çek
      setTaleplerLoading(true);
      const { data: taleplerData } = await supabase
        .from('talepler')
        .select('*')
        .order('olusturulma_zamani', { ascending: false });
      setTalepler(taleplerData || []);
      setTaleplerLoading(false);
    };
    
    checkSession();
  }, [router]);
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleEditChange = (id: string, field: 'durum' | 'mesaj', value: string) => {
    setEditStates((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleUpdate = async (talep: any) => {
    const { durum, mesaj } = editStates[talep.id] || { durum: talep.durum, mesaj: talep.mesaj };
    const { error } = await supabase
      .from('talepler')
      .update({ durum, mesaj })
      .eq('id', talep.id);
    if (!error) {
      setTalepler((prev) => prev.map(t => t.id === talep.id ? { ...t, durum, mesaj } : t));
      alert('Talep güncellendi!');
    } else {
      alert('Güncelleme hatası: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Paneli | Talep Yönetim Sistemi</title>
        <meta name="description" content="Talep yönetim sistemi admin paneli" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-indigo-600">Talep Yönetim Sistemi</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <a
                    href="#"
                    className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Dashboard
                  </a>
                  <a
                    href="#"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Talepler
                  </a>
                  <a
                    href="#"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Kullanıcılar
                  </a>
                  <a
                    href="#"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Ayarlar
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <button
                    onClick={handleSignOut}
                    className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Paneli</h1>
          </div>
        </header>

        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            {/* Admin özeti kartları */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Kart 1 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Toplam Talep
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">0</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Tümünü görüntüle
                    </a>
                  </div>
                </div>
              </div>

              {/* Kart 2 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Bekleyen Talepler
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">0</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Tümünü görüntüle
                    </a>
                  </div>
                </div>
              </div>

              {/* Kart 3 */}
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                      <svg className="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Toplam Kullanıcı
                        </dt>
                        <dd>
                          <div className="text-lg font-medium text-gray-900">1</div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-5 py-3">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                      Tümünü görüntüle
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Eylem kartı */}
            <div className="mt-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Yeni Kullanıcı Ekle
                </h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>
                    Sisteme yeni bir kullanıcı eklemek için aşağıdaki butona tıklayın.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Kullanıcı Ekle
                  </button>
                </div>
              </div>
            </div>

            {/* Talepler Tablosu */}
            <div className="mt-8 bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Tüm Talepler
                </h3>
                {taleplerLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                  </div>
                ) : talepler.length === 0 ? (
                  <div className="text-gray-500">Henüz talep bulunmuyor.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oluşturulma</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesaj</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {talepler.map((talep) => (
                          <tr key={talep.id}>
                            <td className="px-4 py-2 whitespace-nowrap">{talep.baslik}</td>
                            <td className="px-4 py-2 whitespace-nowrap max-w-xs truncate">{talep.aciklama}</td>
                            <td className="px-4 py-2 whitespace-nowrap">{talep.kategori}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <select
                                className="border rounded px-2 py-1"
                                value={editStates[talep.id]?.durum ?? talep.durum}
                                onChange={e => handleEditChange(talep.id, 'durum', e.target.value)}
                              >
                                {durumlar.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">{new Date(talep.olusturulma_zamani).toLocaleString('tr-TR')}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <textarea
                                className="border rounded px-2 py-1 w-40"
                                rows={2}
                                placeholder="Mesaj yaz..."
                                value={editStates[talep.id]?.mesaj ?? talep.mesaj ?? ''}
                                onChange={e => handleEditChange(talep.id, 'mesaj', e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded"
                                onClick={() => handleUpdate(talep)}
                              >
                                Kaydet
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
        </main>
      </div>
    </>
  );
} 