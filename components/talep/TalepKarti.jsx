import { useState } from 'react';
import Link from 'next/link';
import { formatTarih } from '../../utils/formatTarih';
import { ChevronDown, ChevronUp, Image, Clock, Tag } from 'lucide-react';

/**
 * Tek bir talebin özetini gösteren kart bileşeni
 */
export default function TalepKarti({ talep }) {
  const [aciklamaAcik, setAciklamaAcik] = useState(false);

  // Duruma göre renkler
  const durumRenkleri = {
    'beklemede': 'bg-yellow-100 text-yellow-800',
    'işlemde': 'bg-blue-100 text-blue-800',
    'cevaplandı': 'bg-green-100 text-green-800',
    'çözüldü': 'bg-purple-100 text-purple-800',
    'reddedildi': 'bg-red-100 text-red-800'
  };

  const durumRengi = durumRenkleri[talep.durum] || 'bg-gray-100 text-gray-800';

  // Açıklama metnini kısaltma (eğer açık değilse)
  const kisaAciklama = talep.aciklama.length > 120 
    ? talep.aciklama.substring(0, 120) + '...' 
    : talep.aciklama;

  return (
    <div className="p-5">
      <div className="flex justify-between items-start mb-3">
        <Link href={`/talep/${talep.id}`} className="group">
          <h3 className="font-semibold text-lg text-gray-800 group-hover:text-[#8B0000] transition-colors">
            {talep.baslik || `Talep #${talep.id.substring(0, 8)}`}
          </h3>
        </Link>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${durumRengi}`}>
          {talep.durum.charAt(0).toUpperCase() + talep.durum.slice(1)}
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-500">
        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          {formatTarih(talep.created_at || talep.olusturulma_zamani)}
        </div>
        
        {talep.kategori && (
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-1 text-gray-400" />
            <span className="bg-red-50 text-[#8B0000] text-xs font-medium px-2 py-0.5 rounded">
              {talep.kategori}
            </span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <button 
          onClick={() => setAciklamaAcik(!aciklamaAcik)}
          className="text-sm text-gray-600 hover:text-[#8B0000] focus:outline-none flex items-center"
        >
          <span>{aciklamaAcik ? 'Açıklamayı Kapat' : 'Açıklamayı Genişlet'}</span>
          {aciklamaAcik ? 
            <ChevronUp className="h-4 w-4 ml-1" /> : 
            <ChevronDown className="h-4 w-4 ml-1" />
          }
        </button>
      </div>
      
      <div className={`text-gray-600 ${aciklamaAcik ? '' : 'line-clamp-2'}`}>
        {talep.aciklama}
      </div>

      {talep.goruntu_url && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Link href={`/talep/${talep.id}`}>
            <span className="text-sm text-[#8B0000] hover:text-[#6B0000] flex items-center">
              <Image className="h-4 w-4 mr-1" />
              Görüntüyü görüntüle
            </span>
          </Link>
        </div>
      )}
      
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
        <Link 
          href={`/talep/${talep.id}`}
          className="text-sm text-[#8B0000] hover:text-[#6B0000] font-medium"
        >
          Detayları Görüntüle
        </Link>
      </div>
    </div>
  );
}