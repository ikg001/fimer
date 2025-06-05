import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { supabase } from '../lib/supabaseClient'
import '../styles/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)
  const [supabaseError, setSupabaseError] = useState<string | null>(null)

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Basit bir health check - daha basit bir sorgu kullanıyoruz
        await supabase.from('profiller').select('id').limit(1)
        setIsSupabaseReady(true)
      } catch (error: any) {
        console.error('Supabase bağlantı hatası:', error)
        setSupabaseError(error.message || 'Supabase bağlantısı sağlanamadı')
      }
    }
    
    checkSupabase()
  }, [])

  if (supabaseError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h1 className="text-red-600 text-xl font-bold mb-4">Bağlantı Hatası</h1>
          <p className="text-gray-800 mb-4">
            Supabase'e bağlanırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.
          </p>
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
            <p className="text-sm text-red-700">{supabaseError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    )
  }

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}