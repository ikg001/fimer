import { useState, useEffect } from 'react';
import { isOnline, setupNetworkListeners } from '../lib/networkUtils';

interface NetworkStatusAlertProps {
  className?: string;
}

export default function NetworkStatusAlert({ className = '' }: NetworkStatusAlertProps) {
  const [isOffline, setIsOffline] = useState(false);
  
  useEffect(() => {
    // İlk yükleme kontrolü
    setIsOffline(!isOnline());
    
    // Network değişikliklerini dinle
    const handleOffline = () => {
      setIsOffline(true);
    };
    
    const handleOnline = () => {
      setIsOffline(false);
    };
    
    // Dinleyicileri ayarla
    const cleanup = setupNetworkListeners(handleOffline, handleOnline);
    
    // Temizleme fonksiyonu
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);
  
  // Offline değilse hiçbir şey gösterme
  if (!isOffline) return null;
  
  return (
    <div className={`bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 ${className}`} role="alert">
      <div className="flex items-center">
        <svg className="h-6 w-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
        <div>
          <p className="font-medium">İnternet bağlantınız yok!</p>
          <p className="text-sm">Verileriniz yerel olarak saklanacak ve bağlantı kurulduğunda senkronize edilecektir.</p>
        </div>
      </div>
    </div>
  );
}
