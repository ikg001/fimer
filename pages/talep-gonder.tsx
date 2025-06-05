import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';
import Layout from '../components/Layout';
import { Upload, X, File, Paperclip } from 'lucide-react';
import { uploadFile } from '../lib/storageUtils';
import { safeApiCall, getReadableErrorMessage } from '../lib/errorHandling';
import { isOnline } from '../lib/networkUtils';
import NetworkStatusAlert from '../components/NetworkStatusAlert';

export default function TalepGonder() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  
  // Form state
  const [baslik, setBaslik] = useState('');
  const [aciklama, setAciklama] = useState('');
  const [kategori, setKategori] = useState('Akademik');
  const [seffaflik, setSeffaflik] = useState<'anonim' | 'acik'>('acik');
  
  // Dosya ekleri için state
  const [attachments, setAttachments] = useState<Array<{file: File, uploading: boolean, error?: string, url?: string, path?: string}>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const kategoriler = ['Akademik', 'İdari', 'Yemekhane', 'Ulaşım', 'Barınma', 'Teknik', 'Güvenlik', 'Diğer'];

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      // Kullanıcı profilini al ve rolünü kontrol et
      const { data: profile } = await supabase
        .from('profiller')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setUser(user);
      
      if (profile) {
        const role = profile.pozisyon || 'kullanici';
        setUserRole(role);
        
        // Tüm kullanıcılar talep gönderebilir
        setIsAuthorized(true);
      }
      
      setLoading(false);
    };
    
    checkSession();
  }, [router]);
  
  // Dosya boyutunu formatla
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // Dosya türünü kontrol et
  const isValidFileType = (file: File): boolean => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    return allowedTypes.includes(file.type);
  };
  
  // Dosya seçme işlemi
  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Dosya değişikliği işlemi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Maksimum 3 dosya kontrolü
    const remainingSlots = 3 - attachments.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    
    const newAttachments = filesToAdd.map(file => {
      // Dosya boyutu kontrolü (10MB)
      if (file.size > 10 * 1024 * 1024) {
        return { file, uploading: false, error: 'Dosya boyutu 10MB\'dan büyük olamaz' };
      }
      
      // Dosya türü kontrolü
      if (!isValidFileType(file)) {
        return { file, uploading: false, error: 'Desteklenmeyen dosya türü' };
      }
      
      return { file, uploading: false };
    });
    
    setAttachments([...attachments, ...newAttachments]);
    
    // Input değerini sıfırla
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Bu satır kaldırıldı
  
  // Dosya kaldırma
  const removeFile = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  // Talep dosyası yükleme fonksiyonu
  const uploadTalepAttachment = async (file: File, userId: string, talepId: string) => {
    const bucket = 'talep-dosyalari';
    const folder = `${userId}/${talepId}`;
    return await uploadFile(file, bucket, folder, userId);
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!baslik.trim() || !aciklama.trim()) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }
    
    if (!isOnline()) {
      setError('İnternet bağlantınız yok. Talep göndermek için internet bağlantısı gereklidir.');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Önce seffaflik değerini boolean'a çevirelim
      const seffaflikValue = seffaflik === 'acik' ? true : false;
      
      // Önce talebi oluştur
      const { data, error } = await supabase
        .from('talepler')
        .insert([
          {
            kullanici_id: user.id,
            baslik,
            aciklama,
            kategori,
            seffaflik: seffaflikValue,
            durum: 'beklemede',
            oy_sayisi: 0
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Talep ID'sini al
      const talepId = data[0].id;
      
      // Dosya ekleri varsa yükle
      if (attachments.length > 0) {
        // Tüm dosyaları yükleme durumuna getir
        setAttachments(attachments.map(att => ({ ...att, uploading: true })));
        
        // Her dosyayı sırayla yükle
        const uploadPromises = attachments.map(async (attachment, index) => {
          try {
            const { success, data, error } = await uploadTalepAttachment(attachment.file, user.id, talepId);
            
            if (!success || !data) {
              throw new Error(error || 'Dosya yüklenirken bir hata oluştu');
            }
            
            // Dosya bilgilerini veritabanına kaydet
            await supabase
              .from('talep_dosyalari')
              .insert([
                {
                  talep_id: talepId,
                  kullanici_id: user.id,
                  dosya_adi: attachment.file.name,
                  dosya_boyutu: attachment.file.size,
                  dosya_turu: attachment.file.type,
                  dosya_url: data.url,
                  dosya_path: data.path
                }
              ]);
            
            // Başarılı yüklemeyi güncelle
            const newAttachments = [...attachments];
            newAttachments[index] = {
              ...newAttachments[index],
              uploading: false,
              url: data.url,
              path: data.path
            };
            setAttachments(newAttachments);
            
          } catch (err) {
            console.error('Dosya yükleme hatası:', err);
            // Hata durumunu güncelle
            const newAttachments = [...attachments];
            newAttachments[index] = {
              ...newAttachments[index],
              uploading: false,
              error: err instanceof Error ? err.message : 'Dosya yüklenirken bir hata oluştu'
            };
            setAttachments(newAttachments);
          }
        });
        
        await Promise.all(uploadPromises);
      }
      
      // Başarıyla gönderildi
      router.push('/dashboard');
      
    } catch (err: any) {
      console.error('Talep gönderme hatası:', err);
      setError(getReadableErrorMessage(err, 'Talep gönderilirken bir hata oluştu'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8B0000]"></div>
      </div>
    );
  }
  
  // Tüm kullanıcılar talep oluşturabilir

  return (
    <Layout title="Talep Gönder">
      <div className="container mx-auto px-4 py-8">
        {/* Ağ durum bildirimi */}
        <NetworkStatusAlert className="mb-4" />
        
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-[#8B0000] text-white px-6 py-4">
              <h2 className="text-xl font-semibold">Yeni Talep Oluştur</h2>
              <p className="text-sm opacity-80">Lütfen talep detaylarını aşağıdaki forma girin</p>
            </div>
            
            <div className="p-6">
              {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="kategori" className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori
                    </label>
                    <div className="relative">
                      <select
                        id="kategori"
                        name="kategori"
                        className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000]"
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
                      >
                        {kategoriler.map((kat) => (
                          <option key={kat} value={kat}>{kat}</option>
                        ))}
                      </select>
                      <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="seffaflik" className="block text-sm font-medium text-gray-700 mb-1">
                      Şeffaflık
                    </label>
                    <div className="flex items-center space-x-6 mt-2">
                      <div className="flex items-center">
                        <input
                          id="acik"
                          name="seffaflik"
                          type="radio"
                          className="focus:ring-[#8B0000] h-4 w-4 text-[#8B0000] border-gray-300"
                          checked={seffaflik === 'acik'}
                          onChange={() => setSeffaflik('acik')}
                        />
                        <label htmlFor="acik" className="ml-2 block text-sm text-gray-700">
                          Açık (Herkes görebilir)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="anonim"
                          name="seffaflik"
                          type="radio"
                          className="focus:ring-[#8B0000] h-4 w-4 text-[#8B0000] border-gray-300"
                          checked={seffaflik === 'anonim'}
                          onChange={() => setSeffaflik('anonim')}
                        />
                        <label htmlFor="anonim" className="ml-2 block text-sm text-gray-700">
                          Anonim (İsim gizli kalır)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="baslik" className="block text-sm font-medium text-gray-700 mb-1">
                    Başlık
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="baslik"
                      id="baslik"
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000]"
                      placeholder="Talebinizin başlığı"
                      value={baslik}
                      onChange={(e) => setBaslik(e.target.value)}
                      required
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="aciklama" className="block text-sm font-medium text-gray-700 mb-1">
                    Açıklama
                  </label>
                  <div className="relative">
                    <textarea
                      id="aciklama"
                      name="aciklama"
                      rows={5}
                      className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#8B0000] focus:border-[#8B0000]"
                      placeholder="Talebinizi detaylı olarak açıklayın"
                      value={aciklama}
                      onChange={(e) => setAciklama(e.target.value)}
                      required
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Dosya Ekleri Bölümü */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dosya Ekleri (İsteğe Bağlı)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-4 mt-1">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Paperclip className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Dosya eklemek için tıklayın veya sürükleyin</p>
                      <p className="text-xs text-gray-400">Maksimum 3 dosya, her biri en fazla 10MB (JPG, PNG, PDF, DOC, DOCX)</p>
                      <button
                        type="button"
                        onClick={handleFileSelect}
                        className="mt-2 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors flex items-center"
                        disabled={attachments.length >= 3}
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Dosya Seç
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        multiple
                        disabled={attachments.length >= 3}
                      />
                    </div>
                    
                    {/* Seçilen Dosyalar */}
                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Seçilen Dosyalar:</p>
                        <ul className="divide-y divide-gray-200">
                          {attachments.map((attachment, index) => (
                            <li key={index} className="py-2 flex items-center justify-between">
                              <div className="flex items-center">
                                <File className="h-5 w-5 text-gray-500 mr-2" />
                                <div>
                                  <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{attachment.file.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(attachment.file.size)}</p>
                                  {attachment.error && (
                                    <p className="text-xs text-red-500">{attachment.error}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center">
                                {attachment.uploading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#8B0000]"></div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="text-gray-400 hover:text-red-500"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4 mt-6 border-t border-gray-100">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000]"
                    onClick={() => router.push('/dashboard')}
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#8B0000] hover:bg-[#6B0000] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8B0000]"
                  >
                    {submitting ? 'Gönderiliyor...' : 'Gönder'}
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