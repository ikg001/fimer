/**
 * Supabase hata kodlarını ve mesajlarını yönetmek için yardımcı fonksiyonlar
 */

/**
 * Supabase hata mesajlarını kullanıcı dostu mesajlara dönüştürür.
 * @param {Error} error - Supabase veya diğer API hatası
 * @param {string} defaultMessage - Varsayılan hata mesajı
 * @returns {string} Kullanıcı dostu hata mesajı
 */
export const getReadableErrorMessage = (error, defaultMessage = 'Bir hata oluştu') => {
  if (!error) return defaultMessage;

  // Supabase auth hataları
  if (error.code) {
    switch (error.code) {
      case 'PGRST116':
        return 'Kayıt bulunamadı';
      case '23505':
        return 'Bu kayıt zaten mevcut';
      case '23503':
        return 'Bu işlem gerçekleştirilemez çünkü ilişkili kayıtlar bulunuyor';
      case '23514':
        return 'Girilen değerler geçerli değil';
      case 'P0001':
        return 'Veritabanı işlemi başarısız oldu';
      case '42P01':
        return 'Veritabanı tablosu bulunamadı';
      case '42501':
        return 'Bu işlem için yetkiniz bulunmuyor';
      // Auth hataları
      case 'auth/invalid-email':
        return 'Geçersiz e-posta adresi';
      case 'auth/user-disabled':
        return 'Bu kullanıcı hesabı devre dışı bırakılmış';
      case 'auth/user-not-found':
        return 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı';
      case 'auth/wrong-password':
        return 'Hatalı şifre';
      case 'auth/email-already-in-use':
        return 'Bu e-posta adresi zaten kullanımda';
      case 'auth/operation-not-allowed':
        return 'Bu işlem şu anda izin verilmiyor';
      case 'auth/weak-password':
        return 'Şifre çok zayıf. Daha güçlü bir şifre kullanın';
      case 'auth/too-many-requests':
        return 'Çok fazla giriş denemesi yapıldı. Lütfen daha sonra tekrar deneyin';
      default:
        // Eğer kod tanınmıyorsa ve hata mesajı varsa, onu kullan
        return error.message || defaultMessage;
    }
  }

  // Ağ hataları
  if (error.message) {
    if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
      return 'İnternet bağlantınızda bir sorun var. Lütfen bağlantınızı kontrol edin';
    }
    if (error.message.includes('timeout')) {
      return 'Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin';
    }
    return error.message;
  }

  return defaultMessage;
};

/**
 * Belirli bir API çağrısını yeniden deneyen bir fonksiyon
 * @param {Function} apiCall - Çağrılacak API fonksiyonu
 * @param {number} maxRetries - Maksimum yeniden deneme sayısı
 * @param {number} retryDelay - İki deneme arasındaki bekleme süresi (ms)
 * @returns {Promise} API çağrısının sonucu
 */
export const retryApiCall = async (apiCall, maxRetries = 3, retryDelay = 1000) => {
  let lastError = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      console.log(`API çağrısı başarısız oldu (${i + 1}/${maxRetries}):`, error);
      lastError = error;
      
      // Ağ hatası değilse tekrar denemeyi durdur
      if (!isNetworkError(error)) {
        break;
      }
      
      // Son denemede değilsek bekle
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (i + 1))); // Artan bekleme süresi
      }
    }
  }
  
  throw lastError;
};

/**
 * Bir hatanın ağ hatası olup olmadığını kontrol eder
 * @param {Error} error - Kontrol edilecek hata
 * @returns {boolean} Ağ hatası ise true, değilse false
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  // Hata mesajı varsa kontrol et
  if (error.message) {
    return error.message.includes('network') || 
           error.message.includes('fetch') || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('timeout') ||
           error.message.includes('Network request failed');
  }
  
  // Hata tipi varsa kontrol et (TypeError genellikle ağ hatalarında oluşur)
  return error instanceof TypeError;
};

/**
 * Supabase veya diğer API çağrılarını yönetmek için bir sarmalayıcı fonksiyon
 * Bu fonksiyon hata yönetimi ve yeniden deneme özelliği sağlar
 * @param {Function} apiCallFn - API çağrı fonksiyonu
 * @param {Object} options - Seçenekler
 * @returns {Promise} İşlem sonucu
 */
export const safeApiCall = async (apiCallFn, options = {}) => {
  const { 
    retryCount = 3,
    retryDelay = 1000,
    defaultErrorMessage = 'İşlem sırasında bir hata oluştu',
    shouldRetry = true
  } = options;

  try {
    // Ağ bağlantısını kontrol et
    if (!navigator.onLine) {
      throw new Error('İnternet bağlantınız yok. Lütfen bağlantınızı kontrol edin ve tekrar deneyin.');
    }

    // API çağrısını yap, eğer yeniden deneme aktifse retry mekanizmasını kullan
    const result = shouldRetry
      ? await retryApiCall(apiCallFn, retryCount, retryDelay)
      : await apiCallFn();
    
    return { success: true, data: result.data, error: null };
  } catch (error) {
    console.error('API çağrısı hatası:', error);
    
    return { 
      success: false, 
      data: null, 
      error: getReadableErrorMessage(error, defaultErrorMessage) 
    };
  }
};
