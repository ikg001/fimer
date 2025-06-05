import { supabase } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid';

/**
 * Dosya yükleme işlemleri için yardımcı fonksiyonlar
 */

/**
 * Dosya yüklemek için kullanılan fonksiyon
 * @param {File} file - Yüklenecek dosya
 * @param {string} bucket - Storage bucket adı
 * @param {string} folder - Dosyanın yükleneceği klasör
 * @param {string} userId - Kullanıcı ID'si (dosya adına eklenecek)
 * @returns {Promise<{success: boolean, data: any, error: string|null}>} - İşlem sonucu
 */
export const uploadFile = async (file, bucket, folder, userId) => {
  try {
    if (!file) {
      throw new Error('Dosya bulunamadı');
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      throw new Error('Dosya boyutu 10MB\'dan büyük olamaz');
    }

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Desteklenmeyen dosya türü. Lütfen JPG, PNG, GIF, PDF veya Word dosyası yükleyin');
    }

    // Benzersiz dosya adı oluştur
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${uuidv4()}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Dosyayı yükle
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Dosya URL'sini al
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return { 
      success: true, 
      data: {
        path: filePath,
        url: urlData.publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Dosya yükleme hatası:', error);
    return { 
      success: false, 
      data: null, 
      error: error.message || 'Dosya yüklenirken bir hata oluştu' 
    };
  }
};

/**
 * Profil fotoğrafı yüklemek için kullanılan fonksiyon
 * @param {File} file - Yüklenecek profil fotoğrafı
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{success: boolean, data: any, error: string|null}>} - İşlem sonucu
 */
export const uploadProfilePhoto = async (file, userId) => {
  // Görsel dosya kontrolü
  if (file.type !== 'image/jpeg' && file.type !== 'image/png' && file.type !== 'image/gif') {
    return { 
      success: false, 
      data: null, 
      error: 'Lütfen JPG, PNG veya GIF formatında bir görsel yükleyin' 
    };
  }
  
  return uploadFile(file, 'profiles', 'avatars', userId);
};

/**
 * Talep eki yüklemek için kullanılan fonksiyon
 * @param {File} file - Yüklenecek dosya
 * @param {string} userId - Kullanıcı ID'si
 * @param {string} talepId - Talep ID'si
 * @returns {Promise<{success: boolean, data: any, error: string|null}>} - İşlem sonucu
 */
export const uploadTalepAttachment = async (file, userId, talepId) => {
  return uploadFile(file, 'attachments', `talep_${talepId}`, userId);
};

/**
 * Dosya silmek için kullanılan fonksiyon
 * @param {string} bucket - Storage bucket adı
 * @param {string} filePath - Silinecek dosyanın yolu
 * @returns {Promise<{success: boolean, error: string|null}>} - İşlem sonucu
 */
export const deleteFile = async (bucket, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;

    return { success: true, error: null };
  } catch (error) {
    console.error('Dosya silme hatası:', error);
    return { 
      success: false, 
      error: error.message || 'Dosya silinirken bir hata oluştu' 
    };
  }
};

/**
 * Dosya listesini almak için kullanılan fonksiyon
 * @param {string} bucket - Storage bucket adı
 * @param {string} folder - Klasör yolu
 * @returns {Promise<{success: boolean, data: any, error: string|null}>} - İşlem sonucu
 */
export const listFiles = async (bucket, folder) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder);

    if (error) throw error;

    return { success: true, data, error: null };
  } catch (error) {
    console.error('Dosya listesi alınırken hata:', error);
    return { 
      success: false, 
      data: null, 
      error: error.message || 'Dosya listesi alınırken bir hata oluştu' 
    };
  }
};
