// Supabase sorguları ve yardımcı fonksiyonlar

import { supabase } from './supabaseClient';

// Oy sayısını artırmak için RPC fonksiyonu
export const incrementVote = async (talepId) => {
  try {
    const { data, error } = await supabase.rpc('increment', { x: 1 });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Oy artırma hatası:', error);
    return { success: false, error: error.message };
  }
};

// Oy sayısını azaltmak için RPC fonksiyonu
export const decrementVote = async (talepId) => {
  try {
    const { data, error } = await supabase.rpc('decrement', { x: 1 });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Oy azaltma hatası:', error);
    return { success: false, error: error.message };
  }
};

// Kullanıcının oy verip vermediğini kontrol etme
export const checkUserVote = async (userId, talepId) => {
  try {
    const { data, error } = await supabase
      .from('talep_oylar')
      .select('*')
      .eq('kullanici_id', userId)
      .eq('talep_id', talepId)
      .single();
      
    if (error && error.code !== 'PGRST116') { // PGRST116: No rows returned
      throw error;
    }
    
    return { success: true, hasVoted: !!data };
  } catch (error) {
    console.error('Oy kontrolü hatası:', error);
    return { success: false, error: error.message };
  }
};

// Oy ekleme
export const addVote = async (userId, talepId) => {
  try {
    // Önce kullanıcının oy verip vermediğini kontrol et
    const { hasVoted } = await checkUserVote(userId, talepId);
    
    if (hasVoted) {
      return { success: false, error: 'Zaten oy vermişsiniz' };
    }
    
    // Oy ekle
    const { error: voteError } = await supabase
      .from('talep_oylar')
      .insert({
        kullanici_id: userId,
        talep_id: talepId,
        created_at: new Date().toISOString()
      });
      
    if (voteError) {
      throw voteError;
    }
    
    // Talep oy sayısını artır
    const { error: updateError } = await supabase
      .from('talepler')
      .update({ oy_sayisi: supabase.rpc('increment', { x: 1 }) })
      .eq('id', talepId);
      
    if (updateError) {
      throw updateError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Oy ekleme hatası:', error);
    return { success: false, error: error.message };
  }
};

// Oy kaldırma
export const removeVote = async (userId, talepId) => {
  try {
    // Önce kullanıcının oy verip vermediğini kontrol et
    const { hasVoted } = await checkUserVote(userId, talepId);
    
    if (!hasVoted) {
      return { success: false, error: 'Henüz oy vermemişsiniz' };
    }
    
    // Oyu kaldır
    const { error: voteError } = await supabase
      .from('talep_oylar')
      .delete()
      .eq('kullanici_id', userId)
      .eq('talep_id', talepId);
      
    if (voteError) {
      throw voteError;
    }
    
    // Talep oy sayısını azalt
    const { error: updateError } = await supabase
      .from('talepler')
      .update({ oy_sayisi: supabase.rpc('decrement', { x: 1 }) })
      .eq('id', talepId);
      
    if (updateError) {
      throw updateError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Oy kaldırma hatası:', error);
    return { success: false, error: error.message };
  }
};
