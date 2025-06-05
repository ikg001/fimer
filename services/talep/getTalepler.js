import { supabase } from '../../lib/supabaseClient';

/**
 * Tüm talepleri kategori sırasına göre getirir
 */
export async function getTalepler() {
  try {
    const { data, error } = await supabase
      .from('talepler')
      .select('*')
      .order('kategori')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Talepler getirilemedi:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Belirli bir kategori için talepleri getirir
 */
export async function getTaleplerByKategori(kategori) {
  try {
    const { data, error } = await supabase
      .from('talepler')
      .select('*')
      .eq('kategori', kategori)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(`${kategori} kategorisindeki talepler getirilemedi:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Belirli bir kullanıcının taleplerini getirir
 */
export async function getUserTalepler(kullanici_id) {
  try {
    const { data, error } = await supabase
      .from('talepler')
      .select('*')
      .eq('kullanici_id', kullanici_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('Kullanıcı talepleri getirilemedi:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Belirli bir talep ID'sine göre detayları getirir
 */
export async function getTalepById(talepId) {
  try {
    const { data, error } = await supabase
      .from('talepler')
      .select('*')
      .eq('id', talepId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error(`Talep (ID: ${talepId}) detayları getirilemedi:`, err);
    return { success: false, error: err.message };
  }
} 