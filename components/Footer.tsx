import React, { useContext } from 'react'
import { ThemeContext } from '../App'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Hata kontrolleri
if (!supabaseUrl) console.error('NEXT_PUBLIC_SUPABASE_URL tanımlı değil')
if (!supabaseAnonKey) console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY tanımlı değil')

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true
  },
  global: {
    fetch: (...args) => fetch(...args)
  }
})

export const Footer = () => {
  const { theme } = useContext(ThemeContext)

  return (
    <footer
      className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} py-6`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-blue-600">FİMER</span>
            <p className="text-sm mt-1">Şikayet ve Talep Yönetim Sistemi</p>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold mb-2">İletişim</h3>
              <p className="text-sm">destek@fimer.com</p>
              <p className="text-sm">+90 (555) 123-4567</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Bağlantılar</h3>
              <ul className="text-sm">
                <li>
                  <a href="#" className="hover:underline">
                    Hakkımızda
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Kullanım Şartları
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} FİMER. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  )
} 