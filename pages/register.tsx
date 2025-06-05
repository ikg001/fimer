import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import Head from 'next/head'

const Register = () => {
  const router = useRouter()
  const [adSoyad, setAdSoyad] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fakulte, setFakulte] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/dashboard')
      }
    }

    checkAuth()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adSoyad.trim() || !username.trim() || !email.trim() || !password.trim()) {
      setError('Lütfen tüm alanları doldurun')
      return
    }
    
    // Email formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Lütfen geçerli bir email adresi girin')
      return
    }

    if (password !== confirmPassword) {
      setError('Parolalar eşleşmiyor')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Supabase ile kayıt ol ve otomatik giriş yap
      const { data, error } = await supabase.auth.signUp({
        email: email, // Artık gerçek email kullanıyoruz
        password,
        options: {
          data: {
            ad_soyad: adSoyad,
            username: username,
            fakulte: fakulte
          },
          // Email doğrulaması kaldırıldı
        }
      })

      if (error) throw error

      // Profil tablosuna kaydet
      if (data?.user) {
        const { error: profileError } = await supabase
          .from('profiller')
          .insert([
            { 
              id: data.user.id,
              ad_soyad: adSoyad,
              email: email,
              username: username,
              fakulte: fakulte
            }
          ])
          
        if (profileError) throw profileError

        // Oturumu doğrudan açalım
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password
        })

        if (signInError) throw signInError

        // Başarılı kayıt ve giriş
        router.push('/dashboard')
      }
      
    } catch (err: any) {
      console.error('Kayıt hatası:', err)
      setError(err.message || 'Kayıt olurken bir hata oluştu')
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
          <div className="flex items-center">
            <div className="relative group">
              <button className="text-white focus:outline-none">Kullanıcılar</button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-md p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">Merkezi Kimlik</h2>
              <h3 className="text-lg font-medium text-gray-700">Doğrulama Servisi</h3>
              <p className="text-gray-600 mt-2">Yeni Kullanıcı Kaydı</p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    className="border rounded w-full px-3 py-2 pl-10" 
                    placeholder="Ad Soyad"
                    value={adSoyad}
                    onChange={(e) => setAdSoyad(e.target.value)}
                    required 
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    className="border rounded w-full px-3 py-2 pl-10" 
                    placeholder="Kullanıcı Adı"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative">
                  <input 
                    type="email" 
                    className="border rounded w-full px-3 py-2 pl-10" 
                    placeholder="Email Adresi"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative">
                  <input 
                    type="password" 
                    className="border rounded w-full px-3 py-2 pl-10" 
                    placeholder="Parola"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative">
                  <input 
                    type="password" 
                    className="border rounded w-full px-3 py-2 pl-10" 
                    placeholder="Parolayı Tekrar Girin"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <div className="relative">
                  <input 
                    type="text" 
                    className="border rounded w-full px-3 py-2 pl-10" 
                    placeholder="Fakülte"
                    value={fakulte}
                    onChange={(e) => setFakulte(e.target.value)}
                    required 
                  />
                  <div className="absolute left-3 top-2.5 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#8B0000] text-white py-2 rounded hover:bg-[#6B0000] disabled:opacity-50"
              >
                {loading ? 'KAYIT YAPILIYOR...' : 'KAYIT OL'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Zaten hesabınız var mı? <a href="/login" className="text-blue-600 hover:underline">Giriş Yap</a>
              </p>
            </div>
          </div>
        </main>

        {/* Language Selector */}
        <div className="text-center py-4">
          <div className="inline-flex">
            <a href="#" className="text-blue-600 hover:underline mr-2 border-r pr-2">English</a>
            <a href="#" className="text-blue-600 hover:underline">Türkçe</a>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register