import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { User, Mail, Phone, School, BookOpen, Save, Key, AlertTriangle, Upload, Camera, Check, X } from 'lucide-react';
import { safeApiCall, getReadableErrorMessage } from '../lib/errorHandling';
import { isOnline, setupNetworkListeners, saveFormToLocalStorage, getFormFromLocalStorage, clearFormFromLocalStorage } from '../lib/networkUtils';
import NetworkStatusAlert from '../components/NetworkStatusAlert';
import { uploadProfilePhoto } from '../lib/storageUtils';

export default function ProfilAyarlari() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
  const [adSoyad, setAdSoyad] = useState('');
  const [ogrenciNo, setOgrenciNo] = useState('');
  const [telefon, setTelefon] = useState('');
  const [fakulte, setFakulte] = useState('');
  const [bolum, setBolum] = useState('');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Profil fotoğrafı state
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  
  // Şifre gücü state
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordFeedback, setPasswordFeedback] = useState('');
  
  const fakulteler = [
    'Mühendislik Fakültesi',
    'Fen Fakültesi',
    'Eğitim Fakültesi',
    'İktisadi ve İdari Bilimler Fakültesi',
    'Tıp Fakültesi',
    'Diş Hekimliği Fakültesi',
    'Veteriner Fakültesi',
    'İnsani ve Sosyal Bilimler Fakültesi',
    'İlahiyat Fakültesi',
    'Sağlık Bilimleri Fakültesi',
    'Spor Bilimleri Fakültesi',
    'Teknoloji Fakültesi',
    'Diğer'
  ];

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Retry mekanizması ile kullanıcı bilgilerini getir
        const { success, data, error } = await safeApiCall(
          async () => {
            return await supabase.auth.getUser();
          },
          {
            retryCount: 3,
            defaultErrorMessage: 'Oturum bilgileriniz alınamadı'
          }
        );
        
        if (!success || !data?.user) {
          console.error('Oturum bilgileri alınamadı:', error);
          router.push('/login?redirect=profil-ayarlari');
          return;
        }
        
        const user = data.user;
        
        // Kullanıcı bilgilerini al - retry mekanizması ile
        const { success: profileSuccess, data: profile, error: profileError } = await safeApiCall(
          async () => {
            return await supabase
              .from('profiller')
              .select('*')
              .eq('id', user.id)
              .single();
          },
          {
            retryCount: 3,
            defaultErrorMessage: 'Profil bilgileriniz alınamadı'
          }
        );
        
        if (!profileSuccess) {
          console.error('Profil bilgileri alınamadı:', profileError);
          setErrorMessage(getReadableErrorMessage(profileError, 'Profil bilgileriniz alınamadı'));
        }
          
        setUser({
          ...user,
          profile: profile || {}
        });
        
        // Form alanlarını doldur
        if (profile) {
          setAdSoyad(profile.ad_soyad || '');
          setOgrenciNo(profile.ogrenci_no || '');
          setTelefon(profile.telefon || '');
          setFakulte(profile.fakulte || '');
          setBolum(profile.bolum || '');
          setProfilePhoto(profile.profile_photo || null);
        }
        
        // Yerel depolamadaki verileri kontrol et ve form boşsa doldur
        const savedFormData = getFormFromLocalStorage('profile-settings') as Record<string, any> | null;
        if (savedFormData) {
          const profileData = profile as Record<string, any> || {};
          if (!profile || 
              (savedFormData.adSoyad && savedFormData.adSoyad !== profileData.ad_soyad) ||
              (savedFormData.ogrenciNo && savedFormData.ogrenciNo !== profileData.ogrenci_no) ||
              (savedFormData.telefon && savedFormData.telefon !== profileData.telefon) ||
              (savedFormData.fakulte && savedFormData.fakulte !== profileData.fakulte) ||
              (savedFormData.bolum && savedFormData.bolum !== profileData.bolum)) {
            // Yerel depodaki veriler farklı ise kullanıcıya bildir
            setErrorMessage('Kaydedilmemiş değişiklikleriniz var. Form alanlarında yerel olarak saklanan verileri görebilirsiniz.');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
        setErrorMessage(getReadableErrorMessage(error as Error, 'Oturum bilgileriniz kontrol edilirken bir hata oluştu'));
        router.push('/login');
      }
    };
    
    checkSession();
  }, [router]);
  
  // Form verilerini yerel depolamada sakla
  useEffect(() => {
    if (!loading && user) {
      saveFormToLocalStorage('profile-settings', {
        adSoyad,
        ogrenciNo,
        telefon,
        fakulte,
        bolum
      });
    }
  }, [adSoyad, ogrenciNo, telefon, fakulte, bolum, loading, user]);

  // Yerel depolamadan form verilerini yükle
  useEffect(() => {
    if (user) {
      const savedFormData = getFormFromLocalStorage('profile-settings') as {
        adSoyad?: string;
        ogrenciNo?: string;
        telefon?: string;
        fakulte?: string;
        bolum?: string;
      } | null;
      
      if (savedFormData && !adSoyad && !ogrenciNo) {
        // Eğer form boşsa ve kaydedilmiş veri varsa
        setAdSoyad(savedFormData.adSoyad || '');
        setOgrenciNo(savedFormData.ogrenciNo || '');
        setTelefon(savedFormData.telefon || '');
        setFakulte(savedFormData.fakulte || '');
        setBolum(savedFormData.bolum || '');
      }
    }
  }, [user, adSoyad, ogrenciNo]);

  // Ağ durumu değişikliklerini dinle
  useEffect(() => {
    const handleOffline = () => {
      setErrorMessage('İnternet bağlantınız kesildi. Değişiklikleriniz yerel olarak saklanacak.');
    };
    
    const handleOnline = () => {
      setSuccessMessage('İnternet bağlantınız kuruldu. Bekleyen değişiklikleriniz senkronize edilebilir.');
    };
    
    const cleanup = setupNetworkListeners(handleOffline, handleOnline);
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);
  
  // Profil bilgilerini güncelle
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Formda validasyon kontrolü
    if (!adSoyad.trim()) {
      setErrorMessage('Ad Soyad alanı boş bırakılamaz');
      return;
    }
    
    // Verileri her zaman lokalde sakla
    saveFormToLocalStorage('profile-settings', {
      adSoyad,
      ogrenciNo,
      telefon,
      fakulte,
      bolum
    });
    
    if (!isOnline()) {
      setErrorMessage('İnternet bağlantınız yok. Değişiklikleriniz yerel olarak saklandı ve bağlantı kurulduğunda otomatik olarak gönderilecek.');
      return;
    }
    
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      const updateData = {
        ad_soyad: adSoyad,
        ogrenci_no: ogrenciNo,
        telefon: telefon,
        fakulte: fakulte,
        bolum: bolum,
        updated_at: new Date().toISOString()
      };
      
      // Retry mekanizması ile API çağrısı
      const { success, data, error } = await safeApiCall(
        async () => {
          return await supabase
            .from('profiller')
            .update(updateData)
            .eq('id', user.id);
        },
        {
          retryCount: 3,
          retryDelay: 1000,
          defaultErrorMessage: 'Profil bilgileriniz güncellenirken bir sorun oluştu. Lütfen tekrar deneyin.'
        }
      );
      
      if (!success) {
        throw new Error(error);
      }
      
      setSuccessMessage('Profil bilgileriniz başarıyla güncellendi');
      clearFormFromLocalStorage('profile-settings'); // Başarılı kayıttan sonra önbelleği temizle
      
      // Kullanıcı state'ini güncelle
      setUser({
        ...user,
        profile: {
          ...user.profile,
          ...updateData
        }
      });
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setErrorMessage(getReadableErrorMessage(error as Error, 'Profil bilgileriniz güncellenirken bir hata oluştu'));
    } finally {
      setSaving(false);
      
      // 3 saniye sonra başarı mesajını kaldır
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };
  
  // Şifre gücünü kontrol et
  const checkPasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength(0);
      setPasswordFeedback('');
      return;
    }
    
    let strength = 0;
    let feedback = '';
    
    // Uzunluk kontrolü
    if (password.length >= 8) {
      strength += 1;
    } else {
      feedback = 'Şifre en az 8 karakter olmalıdır';
      setPasswordStrength(strength);
      setPasswordFeedback(feedback);
      return;
    }
    
    // Küçük harf kontrolü
    if (/[a-z]/.test(password)) {
      strength += 1;
    }
    
    // Büyük harf kontrolü
    if (/[A-Z]/.test(password)) {
      strength += 1;
    }
    
    // Rakam kontrolü
    if (/[0-9]/.test(password)) {
      strength += 1;
    }
    
    // Özel karakter kontrolü
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 1;
    }
    
    // Geri bildirim
    if (strength === 1) {
      feedback = 'Çok zayıf';
    } else if (strength === 2) {
      feedback = 'Zayıf';
    } else if (strength === 3) {
      feedback = 'Orta';
    } else if (strength === 4) {
      feedback = 'İyi';
    } else if (strength === 5) {
      feedback = 'Çok iyi';
    }
    
    setPasswordStrength(strength);
    setPasswordFeedback(feedback);
  };
  
  // Yeni şifre değiştiğinde gücünü kontrol et
  useEffect(() => {
    checkPasswordStrength(newPassword);
  }, [newPassword]);
  
  // Profil fotoğrafı yükleme
  const handleProfilePhotoClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Dosya boyutu kontrolü (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setPhotoError('Dosya boyutu 2MB\'dan büyük olamaz');
      return;
    }
    
    // Dosya türü kontrolü
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      setPhotoError('Sadece JPG, PNG ve GIF formatları desteklenmektedir');
      return;
    }
    
    try {
      setUploadingPhoto(true);
      setPhotoError(null);
      
      const { success, data, error } = await uploadProfilePhoto(file, user.id);
      
      if (!success || !data) {
        throw new Error(error || 'Fotoğraf yüklenirken bir hata oluştu');
      }
      
      // Profil fotoğrafı URL'sini güncelle
      const { success: updateSuccess, error: updateError } = await safeApiCall(
        async () => {
          return await supabase
            .from('profiller')
            .update({
              profile_photo: data.url
            })
            .eq('id', user.id);
        },
        {
          retryCount: 3,
          defaultErrorMessage: 'Profil fotoğrafı güncellenirken bir hata oluştu'
        }
      );
      
      if (!updateSuccess) {
        throw new Error(updateError || 'Profil fotoğrafı güncellenirken bir hata oluştu');
      }
      
      setProfilePhoto(data.url);
      setSuccessMessage('Profil fotoğrafınız başarıyla güncellendi');
      
      // Kullanıcı state'ini güncelle
      setUser({
        ...user,
        profile: {
          ...user.profile,
          profile_photo: data.url
        }
      });
    } catch (error) {
      console.error('Profil fotoğrafı yükleme hatası:', error);
      setPhotoError((error as Error).message || 'Fotoğraf yüklenirken bir hata oluştu');
    } finally {
      setUploadingPhoto(false);
    }
  };
  
  // Şifre değiştir
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Şifre validasyonu
    if (!currentPassword) {
      setErrorMessage('Mevcut şifrenizi girmelisiniz');
      return;
    }
    
    if (!newPassword) {
      setErrorMessage('Yeni şifrenizi girmelisiniz');
      return;
    }
    
    if (passwordStrength < 3) {
      setErrorMessage('Daha güçlü bir şifre seçmelisiniz (en az orta seviyede)');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Yeni şifreler eşleşmiyor');
      return;
    }
    
    if (!isOnline()) {
      setErrorMessage('İnternet bağlantınız yok. Şifre değişikliği işlemi internet bağlantısı gerektirmektedir.');
      return;
    }
    
    try {
      setSaving(true);
      setSuccessMessage('');
      setErrorMessage('');
      
      // Önce mevcut şifreyle giriş yap
      const { success: signInSuccess, error: signInError } = await safeApiCall(
        async () => {
          return await supabase.auth.signInWithPassword({
            email: user.email,
            password: currentPassword
          });
        },
        {
          retryCount: 2,
          defaultErrorMessage: 'Giriş doğrulama işlemi sırasında bir hata oluştu'
        }
      );
      
      if (!signInSuccess) {
        setErrorMessage(signInError || 'Mevcut şifreniz hatalı');
        return;
      }
      
      // Şifreyi güncelle
      const { success, error } = await safeApiCall(
        async () => {
          return await supabase.auth.updateUser({
            password: newPassword
          });
        },
        {
          retryCount: 3,
          defaultErrorMessage: 'Şifre değiştirme işlemi sırasında bir hata oluştu'
        }
      );
      
      if (!success) {
        throw new Error(error);
      }
      
      setSuccessMessage('Şifreniz başarıyla güncellendi');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Şifre değiştirme hatası:', error);
      setErrorMessage(getReadableErrorMessage(error as Error, 'Şifreniz değiştirilirken bir hata oluştu'));
    } finally {
      setSaving(false);
      
      // 3 saniye sonra başarı mesajını kaldır
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }
  
  return (
    <Layout title="Profil Ayarları">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Ağ durum bildirimi */}
          <NetworkStatusAlert className="mb-4" />
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-[#8B0000] text-white px-6 py-4">
              <h2 className="text-xl font-semibold">Profil Ayarları</h2>
              <p className="text-sm opacity-80">Kişisel bilgilerinizi güncelleyin</p>
            </div>
            
            {!isOnline() && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">Çevrimdışı moddasınız. Değişiklikleriniz geçici olarak saklanacak ve internet bağlantısı kurulduğunda kaydedilecektir.</p>
                  </div>
                </div>
              </div>
            )}
            
            {successMessage && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{successMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-6">
              <form onSubmit={handleUpdateProfile}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Kişisel Bilgiler</h3>
                    
                    {/* Profil Fotoğrafı */}
                    <div className="mb-6 flex flex-col items-center">
                      <div 
                        className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 cursor-pointer group"
                        onClick={handleProfilePhotoClick}
                      >
                        {profilePhoto ? (
                          <img 
                            src={profilePhoto} 
                            alt="Profil Fotoğrafı" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                            <User className="h-16 w-16 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="h-8 w-8 text-white" />
                        </div>
                        {uploadingPhoto && (
                          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/jpeg,image/png,image/gif"
                        onChange={handleFileChange}
                      />
                      <button 
                        type="button" 
                        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                        onClick={handleProfilePhotoClick}
                      >
                        Fotoğraf Yükle
                      </button>
                      {photoError && (
                        <p className="text-xs text-red-500 mt-1">{photoError}</p>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm bg-gray-100"
                            value={user.email}
                            disabled
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Email adresi değiştirilemez</p>
                      </div>
                      
                      <div>
                        <label htmlFor="adSoyad" className="block text-sm font-medium text-gray-700 mb-1">
                          Ad Soyad
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="adSoyad"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                            placeholder="Ad Soyad"
                            value={adSoyad}
                            onChange={(e) => setAdSoyad(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="ogrenciNo" className="block text-sm font-medium text-gray-700 mb-1">
                          Öğrenci / Personel No
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="ogrenciNo"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                            placeholder="Öğrenci / Personel No"
                            value={ogrenciNo}
                            onChange={(e) => setOgrenciNo(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="telefon" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="telefon"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                            placeholder="Telefon Numarası"
                            value={telefon}
                            onChange={(e) => setTelefon(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Akademik Bilgiler</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="fakulte" className="block text-sm font-medium text-gray-700 mb-1">
                          Fakülte
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <School className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            id="fakulte"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                            value={fakulte}
                            onChange={(e) => setFakulte(e.target.value)}
                          >
                            <option value="">Fakülte Seçin</option>
                            {fakulteler.map((f) => (
                              <option key={f} value={f}>{f}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="bolum" className="block text-sm font-medium text-gray-700 mb-1">
                          Bölüm
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BookOpen className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="bolum"
                            className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                            placeholder="Bölüm"
                            value={bolum}
                            onChange={(e) => setBolum(e.target.value)}
                          />
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="button"
                          className="flex items-center text-[#8B0000] hover:text-[#6B0000]"
                          onClick={() => setShowPasswordChange(!showPasswordChange)}
                        >
                          <Key className="h-4 w-4 mr-1" />
                          {showPasswordChange ? 'Şifre Değiştirmeyi İptal Et' : 'Şifremi Değiştir'}
                        </button>
                        
                        {showPasswordChange && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-md">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">Şifre Değiştir</h4>
                            
                            <div className="space-y-3">
                              <div>
                                <label htmlFor="currentPassword" className="block text-xs font-medium text-gray-700 mb-1">
                                  Mevcut Şifre
                                </label>
                                <input
                                  type="password"
                                  id="currentPassword"
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                                  value={currentPassword}
                                  onChange={(e) => setCurrentPassword(e.target.value)}
                                  required={showPasswordChange}
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700 mb-1">
                                  Yeni Şifre
                                </label>
                                <input
                                  type="password"
                                  id="newPassword"
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                                  value={newPassword}
                                  onChange={(e) => setNewPassword(e.target.value)}
                                  required={showPasswordChange}
                                />
                              </div>
                              
                              <div>
                                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 mb-1">
                                  Yeni Şifre (Tekrar)
                                </label>
                                <input
                                  type="password"
                                  id="confirmPassword"
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-[#8B0000] focus:border-[#8B0000] sm:text-sm"
                                  value={confirmPassword}
                                  onChange={(e) => setConfirmPassword(e.target.value)}
                                  required={showPasswordChange}
                                />
                              </div>
                              
                              <button
                                type="button"
                                className="w-full bg-[#8B0000] text-white py-2 rounded hover:bg-[#6B0000] disabled:opacity-50 mt-2"
                                onClick={handleChangePassword}
                                disabled={saving || !currentPassword || !newPassword || !confirmPassword}
                              >
                                {saving ? 'Şifre Değiştiriliyor...' : 'Şifremi Değiştir'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center bg-[#8B0000] text-white px-4 py-2 rounded hover:bg-[#6B0000] disabled:opacity-50"
                    disabled={saving}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
