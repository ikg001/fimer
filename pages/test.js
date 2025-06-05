import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function TestPage() {
  const [talepler, setTalepler] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectionInfo, setConnectionInfo] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Bağlantı bilgilerini kontrol et
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        setConnectionInfo({
          url: url,
          key: key ? 'Mevcut' : 'Yok',
          isUrlValid: url && url.startsWith('https://'),
          isKeyValid: key && key.startsWith('eyJ')
        });

        if (!url || !key) {
          throw new Error('Supabase bağlantı bilgileri eksik');
        }

        // Önce basit bir test yapalım
        const { data: testData, error: testError } = await supabase
          .from('talepler')
          .select('id')
          .limit(1);

        if (testError) {
          throw testError;
        }

        // Eğer test başarılıysa tüm verileri çekelim
        const { data, error } = await supabase
          .from('talepler')
          .select('*');
        
        if (error) {
          throw error;
        }

        setTalepler(data || []);
      } catch (err) {
        console.error('Bağlantı Hatası:', err);
        setError({
          message: err.message,
          details: err.details,
          hint: err.hint,
          code: err.code,
          stack: err.stack
        });
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Bağlantı Testi</h1>
      
      {connectionInfo && (
        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Bağlantı Bilgileri:</h2>
          <p><strong>URL:</strong> {connectionInfo.url}</p>
          <p><strong>URL Geçerli:</strong> {connectionInfo.isUrlValid ? '✅' : '❌'}</p>
          <p><strong>API Key:</strong> {connectionInfo.key}</p>
          <p><strong>API Key Geçerli:</strong> {connectionInfo.isKeyValid ? '✅' : '❌'}</p>
        </div>
      )}
      
      {loading && <p>Yükleniyor...</p>}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Hata Detayları:</p>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}
      
      {!loading && !error && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Talepler:</h2>
          {talepler.length === 0 ? (
            <p>Henüz talep bulunmuyor.</p>
          ) : (
            <ul className="list-disc pl-5">
              {talepler.map((talep) => (
                <li key={talep.id} className="mb-2">
                  <p><strong>Kategori:</strong> {talep.kategori}</p>
                  <p><strong>Açıklama:</strong> {talep.aciklama}</p>
                  <p><strong>Durum:</strong> {talep.durum}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
} 