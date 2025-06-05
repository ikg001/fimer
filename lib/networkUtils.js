/**
 * Ağ bağlantısı ve offline durumu yönetmek için yardımcı fonksiyonlar
 */

// Local storage anahtarları
const KEYS = {
  PENDING_REQUESTS: 'fimer_pending_requests',
  FORM_DATA: 'fimer_form_data',
  LAST_SYNC: 'fimer_last_sync'
};

/**
 * Ağ bağlantısını kontrol eden fonksiyon
 * @returns {boolean} Ağ bağlantısı varsa true, yoksa false
 */
export const isOnline = () => {
  return typeof navigator !== 'undefined' && navigator.onLine;
};

/**
 * Ağ bağlantısı durumunu dinleyen hook
 * @param {Function} onOffline - Offline olunca çağrılacak fonksiyon
 * @param {Function} onOnline - Online olunca çağrılacak fonksiyon
 * @returns {Function} Dinleyicileri temizleyen fonksiyon
 */
export const setupNetworkListeners = (onOffline, onOnline) => {
  if (typeof window === 'undefined') return () => {};

  window.addEventListener('offline', onOffline);
  window.addEventListener('online', onOnline);

  return () => {
    window.removeEventListener('offline', onOffline);
    window.removeEventListener('online', onOnline);
  };
};

/**
 * Form verilerini local storage'a kaydeden fonksiyon
 * @param {string} formId - Form tanımlayıcısı (örn: 'talep-gonder', 'profil-guncelle')
 * @param {Object} formData - Kaydedilecek form verileri
 */
export const saveFormToLocalStorage = (formId, formData) => {
  if (typeof localStorage === 'undefined') return;

  try {
    // Mevcut form verilerini al
    const savedForms = JSON.parse(localStorage.getItem(KEYS.FORM_DATA) || '{}');
    
    // Yeni form verilerini ekle
    savedForms[formId] = {
      data: formData,
      timestamp: new Date().toISOString()
    };
    
    // Güncellenmiş verileri kaydet
    localStorage.setItem(KEYS.FORM_DATA, JSON.stringify(savedForms));
  } catch (error) {
    console.error('Form verileri kaydedilemedi:', error);
  }
};

/**
 * Local storage'dan form verilerini getiren fonksiyon
 * @param {string} formId - Form tanımlayıcısı
 * @returns {Object|null} Form verileri veya null
 */
export const getFormFromLocalStorage = (formId) => {
  if (typeof localStorage === 'undefined') return null;

  try {
    const savedForms = JSON.parse(localStorage.getItem(KEYS.FORM_DATA) || '{}');
    return savedForms[formId]?.data || null;
  } catch (error) {
    console.error('Form verileri alınamadı:', error);
    return null;
  }
};

/**
 * Local storage'dan form verilerini silen fonksiyon
 * @param {string} formId - Form tanımlayıcısı
 */
export const clearFormFromLocalStorage = (formId) => {
  if (typeof localStorage === 'undefined') return;

  try {
    const savedForms = JSON.parse(localStorage.getItem(KEYS.FORM_DATA) || '{}');
    
    if (savedForms[formId]) {
      delete savedForms[formId];
      localStorage.setItem(KEYS.FORM_DATA, JSON.stringify(savedForms));
    }
  } catch (error) {
    console.error('Form verileri silinemedi:', error);
  }
};

/**
 * Bekleyen API isteklerini local storage'a kaydeden fonksiyon
 * @param {Object} request - API isteği bilgileri
 * @param {string} request.endpoint - API endpoint'i
 * @param {string} request.method - HTTP metodu (GET, POST, vb.)
 * @param {Object} request.data - İstek verileri
 * @param {string} request.id - İstek için benzersiz ID
 */
export const savePendingRequest = (request) => {
  if (typeof localStorage === 'undefined') return;

  try {
    const pendingRequests = JSON.parse(localStorage.getItem(KEYS.PENDING_REQUESTS) || '[]');
    
    // İsteğe timestamp ekle
    const requestWithTimestamp = {
      ...request,
      timestamp: new Date().toISOString()
    };
    
    pendingRequests.push(requestWithTimestamp);
    localStorage.setItem(KEYS.PENDING_REQUESTS, JSON.stringify(pendingRequests));
  } catch (error) {
    console.error('Bekleyen istek kaydedilemedi:', error);
  }
};

/**
 * Local storage'dan bekleyen API isteklerini getiren fonksiyon
 * @returns {Array} Bekleyen istekler dizisi
 */
export const getPendingRequests = () => {
  if (typeof localStorage === 'undefined') return [];

  try {
    return JSON.parse(localStorage.getItem(KEYS.PENDING_REQUESTS) || '[]');
  } catch (error) {
    console.error('Bekleyen istekler alınamadı:', error);
    return [];
  }
};

/**
 * Local storage'dan bekleyen bir API isteğini silen fonksiyon
 * @param {string} requestId - Silinecek isteğin ID'si
 */
export const removePendingRequest = (requestId) => {
  if (typeof localStorage === 'undefined') return;

  try {
    const pendingRequests = JSON.parse(localStorage.getItem(KEYS.PENDING_REQUESTS) || '[]');
    const filteredRequests = pendingRequests.filter(req => req.id !== requestId);
    
    localStorage.setItem(KEYS.PENDING_REQUESTS, JSON.stringify(filteredRequests));
  } catch (error) {
    console.error('Bekleyen istek silinemedi:', error);
  }
};

/**
 * Offline durumunda bir Toast/bildirim göstermek için yardımcı fonksiyon
 * @param {Function} showToast - Toast/bildirim gösterme fonksiyonu
 */
export const showOfflineNotification = (showToast) => {
  if (typeof showToast === 'function') {
    showToast({
      title: 'Offline Modu',
      description: 'İnternet bağlantınız yok. Bazı özellikler sınırlı olabilir.',
      status: 'warning',
      duration: 5000,
      isClosable: true,
      position: 'top-right'
    });
  }
};

/**
 * Online durumuna geçildiğinde bekleyen istekleri işler
 * @param {Function} processRequest - İsteği işleyecek fonksiyon
 */
export const processPendingRequests = async (processRequest) => {
  if (!isOnline() || typeof processRequest !== 'function') return;

  const pendingRequests = getPendingRequests();
  
  if (pendingRequests.length === 0) return;
  
  // En eski istekten başlayarak işle
  const sortedRequests = [...pendingRequests].sort((a, b) => 
    new Date(a.timestamp) - new Date(b.timestamp)
  );
  
  for (const request of sortedRequests) {
    try {
      await processRequest(request);
      removePendingRequest(request.id);
    } catch (error) {
      console.error(`Bekleyen istek işlenemedi (${request.id}):`, error);
      // Hata durumunda diğer istekleri işlemeye devam et
    }
  }
};
