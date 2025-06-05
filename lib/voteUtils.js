import { supabase } from './supabaseClient';

/**
 * Talep oylarını yönetmek için yardımcı fonksiyonlar
 */

/**
 * Bir talebe oy vermek veya oyu geri çekmek için kullanılır
 * @param {string} talepId - Talep ID'si
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<{success: boolean, action: string}>} - İşlem sonucu
 */
export async function toggleVote(talepId, userId) {
  if (!talepId || !userId) {
    console.error("Oy verme işlemi için talep ID veya kullanıcı ID eksik", { talepId, userId });
    return { success: false, error: "Gerekli bilgiler eksik" };
  }
  
  try {
    // İlk olarak kullanıcının bu talebe daha önce oy verip vermediğini kontrol et
    const { data: existingVote, error: checkError } = await supabase
      .from('talep_oylar')
      .select('*')
      .eq('talep_id', talepId)
      .eq('kullanici_id', userId)
      .maybeSingle();
    
    if (checkError) {
      console.error("Oy kontrolü hatası:", checkError);
      return { success: false, error: checkError };
    }
    
    // Supabase işlemlerini transaction benzeri bir yapıda yapalım
    if (existingVote) {
      // Oy daha önce verilmiş, oyu kaldır
      const { error: deleteError } = await supabase
        .from('talep_oylar')
        .delete()
        .eq('talep_id', talepId)
        .eq('kullanici_id', userId);
      
      if (deleteError) {
        console.error("Oy silme hatası:", deleteError);
        return { success: false, error: deleteError };
      }
      
      // Talepteki oy sayısını azalt
      const { error: updateError } = await supabase.rpc('azalt_oy_sayisi', { 
        talep_id: talepId 
      });
      
      if (updateError) {
        console.error("Oy sayısı azaltma hatası:", updateError);
        return { success: false, error: updateError };
      }
      
      return { success: true, action: "removed" };
    } else {
      // Yeni oy ekle
      const { error: insertError } = await supabase
        .from('talep_oylar')
        .insert([{ 
          talep_id: talepId, 
          kullanici_id: userId,
          created_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        console.error("Oy ekleme hatası:", insertError);
        return { success: false, error: insertError };
      }
      
      // Talepteki oy sayısını artır
      const { error: updateError } = await supabase.rpc('artir_oy_sayisi', { 
        talep_id: talepId 
      });
      
      if (updateError) {
        console.error("Oy sayısı artırma hatası:", updateError);
        return { success: false, error: updateError };
      }
      
      return { success: true, action: "added" };
    }
  } catch (error) {
    console.error("Oy verme işlemi sırasında beklenmeyen hata:", error);
    return { success: false, error: error };
  }
}

/**
 * Kullanıcının bir talebe oy verip vermediğini kontrol eder
 * @param {string} talepId - Talep ID'si
 * @param {string} userId - Kullanıcı ID'si
 * @returns {Promise<boolean>} - Kullanıcı oy vermiş mi
 */
export const checkUserVote = async (talepId, userId) => {
  try {
    const { data, error } = await supabase
      .from('talep_oylar')
      .select('id')
      .eq('kullanici_id', userId)
      .eq('talep_id', talepId)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      // PGRST116: No rows found (kullanıcı oy vermemiş)
      console.error('Oy kontrolü hatası:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Oy kontrolü hatası:', error);
    return false;
  }
};

/**
 * Bir talebin toplam oy sayısını getirir
 * @param {string} talepId - Talep ID'si
 * @returns {Promise<number>} - Toplam oy sayısı
 */
export const getTotalVotes = async (talepId) => {
  try {
    const { data, error } = await supabase
      .from('talepler')
      .select('oy_sayisi')
      .eq('id', talepId)
      .single();
      
    if (error) {
      console.error('Oy sayısı getirme hatası:', error);
      return 0;
    }
    
    return data?.oy_sayisi || 0;
  } catch (error) {
    console.error('Oy sayısı getirme hatası:', error);
    return 0;
  }
};
