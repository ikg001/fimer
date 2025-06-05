import { supabase } from '../../lib/supabaseClient';

export async function submitRequest({ kategori, aciklama, kullanici_id, goruntu_dosyasi = null }) {
  try {
    // Önce talebi oluştur
    const { data, error } = await supabase
      .from('talepler')
      .insert([
        {
          kategori,
          aciklama,
          kullanici_id,
          durum: 'beklemede',
        },
      ])
      .select();

    if (error) throw error;
    
    // Eğer görüntü varsa yükle
    if (goruntu_dosyasi) {
      const talepId = data[0].id;
      const dosyaYolu = `${kullanici_id}/${talepId}/${goruntu_dosyasi.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('talep-goruntuleri')
        .upload(dosyaYolu, goruntu_dosyasi);
        
      if (uploadError) throw uploadError;
      
      // Görüntü URL'sini talep kaydına ekle
      const { error: updateError } = await supabase
        .from('talepler')
        .update({ goruntu_url: dosyaYolu })
        .eq('id', talepId);
        
      if (updateError) throw updateError;
    }

    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
} 