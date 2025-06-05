import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Supabase bağlantısı test ediliyor...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Basit bir sorgu deneyin
        const { data, error } = await supabase.from('profiller').select('count(*)', { count: 'exact', head: true });
        
        if (error) {
          throw error;
        }
        
        setStatus('success');
        setMessage('Bağlantı başarılı! Supabase\'e bağlanabiliyorsunuz.');
      } catch (err: any) {
        console.error('Bağlantı hatası:', err);
        setStatus('error');
        setMessage('Bağlantı hatası!');
        setError(err.message || 'Bilinmeyen hata');
      }
    };
    
    testConnection();
  }, []);
  
  return (
    <>
      <Head>
        <title>Supabase Bağlantı Testi</title>
        <meta name="description" content="Supabase bağlantı test sayfası" />
      </Head>
      
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Supabase Bağlantı Testi
            </h2>
          </div>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Bağlantı Durumu
              </h3>
              
              <div className="mt-4">
                {status === 'loading' && (
                  <div className="flex items-center">
                    <div className="mr-2 animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-500">{message}</p>
                  </div>
                )}
                
                {status === 'success' && (
                  <div className="flex items-center text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p>{message}</p>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="text-red-600">
                    <p className="font-medium">{message}</p>
                    {error && (
                      <p className="mt-1 text-sm">
                        {error}
                      </p>
                    )}
                    <div className="mt-4">
                      <h4 className="font-medium">Olası çözümler:</h4>
                      <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
                        <li>Supabase URL ve Anon Key doğru olduğundan emin olun</li>
                        <li>Tarayıcı konsolunda (F12) diğer hata mesajlarını kontrol edin</li>
                        <li>Supabase Dashboard'da projenizin aktif olduğunu doğrulayın</li>
                        <li>Network sekmesinde hata yanıtını inceleyin</li>
                        <li>Profiller tablosunun Supabase'de oluşturulduğunu kontrol edin</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-5">
                <div className="bg-gray-100 p-4 rounded-md text-sm">
                  <h4 className="font-medium">Supabase Yapılandırma Bilgileri:</h4>
                  <pre className="mt-2 overflow-x-auto">
                    URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}<br />
                    Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 8)}...
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 