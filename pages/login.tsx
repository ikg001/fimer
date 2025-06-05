import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Head from 'next/head'
import { safeApiCall, getReadableErrorMessage } from '../lib/errorHandling'
import { isOnline, setupNetworkListeners, saveFormToLocalStorage, getFormFromLocalStorage, clearFormFromLocalStorage } from '../lib/networkUtils'
import NetworkStatusAlert from '../components/NetworkStatusAlert'

export default function Login() {
  const router = useRouter()
  const { redirect, kategori, talepId } = router.query

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginType, setLoginType] = useState<'admin' | 'user'>('user')

  // Ağ durumu kontrolü ve kullanıcıya bildirim
  useEffect(() => {
    const handleOffline = () => {
      setError('İnternet bağlantınız kesildi. Giriş yapabilmek için internet bağlantınız gereklidir.')
    }
    
    const handleOnline = () => {
      if (error && error.includes('İnternet bağlantınız kesildi')) {
        setError(null)
      }
    }
    
    const cleanup = setupNetworkListeners(handleOffline, handleOnline)
    return () => {
      if (typeof cleanup === 'function') {
        cleanup()
      }
    }
  }, [error])

  // Email adresini LocalStorage'dan geri yükle (sadece email, güvenlik için parola değil)
  useEffect(() => {
    const savedLoginData = getFormFromLocalStorage('login-form') as { email?: string } | null
    if (savedLoginData && savedLoginData.email && !email) {
      setEmail(savedLoginData.email)
    }
  }, [])

  // Email değiştiğinde LocalStorage'a kaydet
  useEffect(() => {
    if (email) {
      saveFormToLocalStorage('login-form', { email })
    }
  }, [email])

  // Kullanıcı zaten giriş yapmışsa yönlendir
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { success, data, error } = await safeApiCall(
          async () => await supabase.auth.getUser(),
          {
            retryCount: 3,
            defaultErrorMessage: 'Oturum bilgileriniz kontrol edilemedi'
          }
        )

        if (!success) {
          console.error('Oturum kontrolü başarısız:', error)
          return
        }

        const user = data?.user
        if (user) {
          const { success: profileSuccess, data: profile } = await safeApiCall(
            async () => await supabase
              .from('profiller')
              .select('pozisyon')
              .eq('id', user.id)
              .single(),
            {
              retryCount: 2,
              defaultErrorMessage: 'Kullanıcı profili alınamadı'
            }
          )

          // Redirect parametrelerine göre yönlendir
          if (redirect === 'talepler' && kategori) {
            router.push(`/talepler?kategori=${kategori}`)
          } else if (redirect === 'talep' && talepId) {
            router.push(`/talep/${talepId}`)
          } else {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error)
      }
    }

    checkAuth()
  }, [router, redirect, kategori, talepId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('Lütfen tüm alanları doldurun')
      return
    }
    
    // İnternet bağlantısı kontrolü
    if (!isOnline()) {
      setError('İnternet bağlantınız yok. Giriş yapabilmek için internet bağlantınız gereklidir.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Giriş için retry mekanizması
      const { success, data, error: loginError } = await safeApiCall(
        async () => await supabase.auth.signInWithPassword({
          email,
          password,
        }),
        {
          retryCount: 3,
          retryDelay: 1000,
          defaultErrorMessage: 'Giriş yapılırken bir hata oluştu',
          shouldRetry: true
        }
      )

      if (!success || !data?.user) {
        throw new Error(loginError || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.')
      }

      // Admin girişi için kontrol
      if (loginType === 'admin') {
        // Admin mi kontrol et - retry mekanizması ile
        const { success: profileSuccess, data: profile, error: profileError } = await safeApiCall(
          async () => await supabase
            .from('profiller')
            .select('pozisyon')
            .eq('id', data.user.id)
            .single(),
          {
            retryCount: 2,
            defaultErrorMessage: 'Profil bilgileriniz kontrol edilirken bir hata oluştu',
          }
        )
          
        if (!profileSuccess || !profile || profile.pozisyon !== 'admin') {
          await supabase.auth.signOut()
          throw new Error('Admin yetkiniz bulunmamaktadır. Lütfen normal giriş yapınız.')
        }
      }
      
      // Giriş başarılı olduğunda form verilerini temizle
      clearFormFromLocalStorage('login-form')

      // Başarılı girişten sonra yönlendir
      if (redirect === 'talepler' && kategori) {
        router.push(`/talepler?kategori=${kategori}`)
      } else if (redirect === 'talep' && talepId) {
        router.push(`/talep/${talepId}`)
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      console.error('Giriş hatası:', err)
      setError(getReadableErrorMessage(err, 'Giriş başarısız. Email ve şifrenizi kontrol edin.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Merkezi Kimlik Doğrulama Servisi | Fırat Üniversitesi</title>
      </Head>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Offline durumu bildirimi */}
        <div className="absolute top-0 w-full z-50">
          <NetworkStatusAlert />
        </div>
        {/* Header */}
        <header className="bg-[#8B0000] text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
                <line x1="15" y1="3" x2="15" y2="21"></line>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
            </div>
            <h1 className="text-xl font-medium">Fırat Üniversitesi</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Merkezi Kimlik</h2>
              <h3 className="text-lg font-medium text-gray-700">Doğrulama Servisi</h3>
            </div>

            <div className="mb-6">
              <h4 className="text-center text-gray-600 mb-4">Giriş Tipini Seçin</h4>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              )}

              <div className="mt-4 flex rounded-md shadow-sm">
                <button
                  type="button"
                  className={`relative inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium rounded-l-md ${loginType === 'user' ? 'bg-[#8B0000] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  onClick={() => setLoginType('user')}
                >
                  Öğrenci / Akademisyen
                </button>
                <button
                  type="button"
                  className={`relative inline-flex items-center justify-center flex-1 px-4 py-2 text-sm font-medium rounded-r-md ${loginType === 'admin' ? 'bg-[#8B0000] text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  onClick={() => setLoginType('admin')}
                >
                  Admin
                </button>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">
                      Email adresi
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000] focus:z-10 sm:text-sm"
                      placeholder={loginType === 'admin' ? 'Admin email adresi' : 'Email adresi'}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">
                      Parola
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000] focus:z-10 sm:text-sm"
                      placeholder="Parola"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-[#8B0000] focus:ring-[#8B0000] border-gray-300 rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                      Beni Hatırla
                    </label>
                  </div>

                  <div className="text-sm">
                    <a href="#" className="font-medium text-[#8B0000] hover:text-[#6B0000]">
                      Şifremi Unuttum
                    </a>
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#8B0000] text-white py-2 rounded hover:bg-[#6B0000] disabled:opacity-50 mt-4"
                >
                  {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
                </button>
              </form>
            </div>

            <div className="text-center mt-4 text-sm text-gray-600">
              <p>Hesabınız yok mu? <a href="/register" className="text-[#8B0000] hover:underline">Kayıt Olun</a></p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white py-4 text-center text-gray-500 text-sm">
          <p> {new Date().getFullYear()} Fırat Üniversitesi. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </>
  )
}
