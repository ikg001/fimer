import { useState } from 'react';

/**
 * Açılıp kapanabilir kategori başlığı bileşeni
 */
export default function KategoriBasi({ kategori, talepSayisi, children }) {
  const [acik, setAcik] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setAcik(!acik)}
        className="w-full flex justify-between items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors focus:outline-none"
      >
        <div className="flex items-center">
          <h2 className="text-xl font-medium text-blue-800">{kategori}</h2>
          <span className="ml-3 px-2.5 py-0.5 bg-blue-200 text-blue-800 text-sm rounded-full">
            {talepSayisi}
          </span>
        </div>
        
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-blue-500 transform transition-transform ${acik ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`mt-2 transition-all duration-300 ${acik ? 'max-h-full opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        {/* İçerik slot */}
        {acik && (
          <div className="pl-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
} 