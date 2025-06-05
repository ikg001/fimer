import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  FileText,
  Users,
  Settings,
  Send,
  List
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const Navbar = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userPozisyon, setUserPozisyon] = useState<'admin' | 'akademisyen' | 'ogrenci' | null>(null);
  const [userName, setUserName] = useState<string>('');
  
  useEffect(() => {
    async function getUserSession() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setIsLoggedIn(true);
        
        // Kullanıcı rolünü al
        const { data: profile } = await supabase
          .from('profiller')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setUserPozisyon(profile.pozisyon);
          setUserName(profile.ad_soyad || user.email);
        }
      }
    }
    
    getUserSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserPozisyon(null);
    router.push('/login');
  };

  return (
    <nav className="bg-[#8B0000] text-white w-full shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/en-cok-oylananlar" className="flex items-center">
              <div className="mr-3 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 200 200" className="flex-shrink-0">
                  <rect x="10" y="10" width="180" height="180" fill="none" stroke="white" strokeWidth="10" />
                  <rect x="30" y="30" width="65" height="65" fill="white" />
                  <rect x="105" y="30" width="65" height="65" fill="#8B0000" stroke="white" strokeWidth="5" />
                  <rect x="30" y="105" width="65" height="65" fill="#8B0000" stroke="white" strokeWidth="5" />
                  <rect x="105" y="105" width="65" height="65" fill="white" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white tracking-wide">Fırat Üniversitesi</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/dashboard' ? 'border-b-2 border-white' : ''}`}
            >
              <Home className="h-4 w-4 mr-1" />
              Ana Sayfa
            </Link>
            
            {/* Talep Gönder - Tüm kullanıcılar için */}
            {isLoggedIn && (
              <Link
                href="/talep-gonder"
                className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/talep-gonder' ? 'border-b-2 border-white' : ''}`}
              >
                <Send className="h-4 w-4 mr-1" />
                Talep Gönder
              </Link>
            )}
            
            {/* Talepler - Tüm kullanıcılar için */}
            <Link
              href="/talepler"
              className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/talepler' ? 'border-b-2 border-white' : ''}`}
            >
              <List className="h-4 w-4 mr-1" />
              Talepler
            </Link>
            
            {/* Taleplerim - Giriş yapmış kullanıcılar için */}
            {isLoggedIn && (
              <Link
                href="/taleplerim"
                className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/taleplerim' ? 'border-b-2 border-white' : ''}`}
              >
                <FileText className="h-4 w-4 mr-1" />
                Taleplerim
              </Link>
            )}
            
            {/* Talepleri Düzenle - Sadece admin için */}
            {isLoggedIn && userPozisyon === 'admin' && (
              <Link
                href="/talepler-yonetim"
                className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/talepler-yonetim' ? 'border-b-2 border-white' : ''}`}
              >
                <Settings className="h-4 w-4 mr-1" />
                Talepleri Düzenle
              </Link>
            )}
            
            {/* Kullanıcılar - Sadece admin için */}
            {isLoggedIn && userPozisyon === 'admin' && (
              <Link
                href="/kullanicilar"
                className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/kullanicilar' ? 'border-b-2 border-white' : ''}`}
              >
                <Users className="h-4 w-4 mr-1" />
                Kullanıcılar
              </Link>
            )}
            
            {/* Profil Ayarları - Giriş yapmış kullanıcılar için */}
            {isLoggedIn && (
              <Link
                href="/profil-ayarlari"
                className={`text-white hover:text-gray-200 transition-colors flex items-center ${router.pathname === '/profil-ayarlari' ? 'border-b-2 border-white' : ''}`}
              >
                <Settings className="h-4 w-4 mr-1" />
                Profil Ayarları
              </Link>
            )}
            
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-gray-200 transition-colors flex items-center"
                >
                  <User className="h-4 w-4 mr-1" />
                  Giriş
                </Link>
                <Link
                  href="/register"
                  className="bg-white text-[#8B0000] px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Kayıt Ol
                </Link>
              </>
            ) : (
              <button 
                onClick={handleLogout}
                className="text-white hover:text-gray-200 transition-colors flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>Çıkış</span>
              </button>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-[#6B0000] focus:outline-none"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1 border-t border-[#6B0000]">
              <Link
                href="/dashboard"
                className="block py-2 text-white hover:text-gray-200 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Link>
              {/* Talep Gönder - Tüm kullanıcılar için */}
              {isLoggedIn && (
                <Link
                  href="/talep-gonder"
                  className="block py-2 text-white hover:text-gray-200 flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Talep Gönder
                </Link>
              )}
              <Link
                href="/talepler"
                className="block py-2 text-white hover:text-gray-200 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <List className="h-4 w-4 mr-2" />
                Talepler
              </Link>
              <Link
                href="/taleplerim"
                className="block py-2 text-white hover:text-gray-200 flex items-center"
                onClick={() => setIsOpen(false)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Taleplerim
              </Link>
              {isLoggedIn && (
                <>
                  {userPozisyon === 'admin' && (
                    <>
                      <Link
                        href="/kullanicilar"
                        className="block py-2 text-white hover:text-gray-200 flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Kullanıcılar
                      </Link>
                      <Link
                        href="/talepler-yonetim"
                        className="block py-2 text-white hover:text-gray-200 flex items-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Talepleri Düzenle
                      </Link>
                    </>
                  )}
                  <Link
                    href="/profil-ayarlari"
                    className="block py-2 text-white hover:text-gray-200 flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Profil Ayarları
                  </Link>
                </>
              )}
              {!isLoggedIn ? (
                <div className="pt-2 mt-2 border-t border-[#6B0000] flex flex-col space-y-2">
                  <Link
                    href="/login"
                    className="block py-2 text-white hover:text-gray-200 flex items-center"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Giriş
                  </Link>
                  <Link
                    href="/register"
                    className="bg-white text-[#8B0000] px-3 py-2 rounded-md text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Kayıt Ol
                  </Link>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full text-left py-2 text-white hover:text-gray-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Çıkış</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
