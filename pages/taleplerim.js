import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getUserTalepler } from '../services/talep';
import TalepKarti from '../components/talep/TalepKarti';
import Link from 'next/link';
import { supabase } from '../lib/supabaseClient';
import { PlusCircle } from 'lucide-react';

export default function Taleplerim() {
  const [talepler, setTalepler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUserAndTalepler() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);
      try {
        setYukleniyor(true);
        const { success, data, error } = await getUserTalepler(user.id);
        if (!success) {
          throw new Error(error);
        }
        setTalepler(data);
      } catch (err) {
        setHata('Talepleriniz yüklenirken bir hata oluştu: ' + err.message);
        console.error('Talepler yüklenirken hata:', err);
      } finally {
        setYukleniyor(false);
      }
    }
    fetchUserAndTalepler();
  }, []);

  if (yukleniyor) {
    return (
      <Layout title="Taleplerim">
        <div className="flex justify-center items-center p-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#8B0000]"></div>
          <span className="ml-3 text-gray-600">Talepleriniz yükleniyor...</span>
        </div>
      </Layout>
    );
  }
  
  if (hata) {
    return (
      <Layout title="Taleplerim - Hata">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium mb-2">Bir hata oluştu</h3>
            <p>{hata}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-[#8B0000] text-white rounded-md hover:bg-[#6B0000] transition-colors"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Taleplerim">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
          <div className="bg-[#8B0000] text-white px-6 py-4">
            <h2 className="text-xl font-semibold">Taleplerim</h2>
            <p className="text-sm opacity-80">Önceden gönderdiğiniz talep ve şikayetlerinizin listesi</p>
          </div>
          
          {talepler.length === 0 ? (
            <div className="p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Henüz bir talebiniz bulunmuyor</h3>
              <p className="text-gray-600 mb-6">Yeni bir talep göndererek başlayabilirsiniz.</p>
              <Link
                href="/talep-gonder"
                className="inline-flex items-center px-5 py-2.5 bg-[#8B0000] text-white font-medium rounded-md hover:bg-[#6B0000] transition-colors shadow-sm"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Talep Oluştur
              </Link>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Toplam <span className="font-medium text-gray-800">{talepler.length}</span> talep bulundu
                </p>
                
                <Link
                  href="/talep-gonder"
                  className="inline-flex items-center px-4 py-2 bg-[#8B0000] text-white font-medium rounded-md hover:bg-[#6B0000] transition-colors shadow-sm"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Yeni Talep Oluştur
                </Link>
              </div>
              
              <div className="space-y-4">
                {talepler.map(talep => (
                  <div key={talep.id} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
                    <TalepKarti talep={talep} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}