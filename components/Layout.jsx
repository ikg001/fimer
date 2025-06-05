import Head from 'next/head';
import { Navbar } from './Navbar';

/**
 * Tüm sayfalarda kullanılacak ortak layout bileşeni
 */
export default function Layout({ children, title = 'Merkezi Kimlik Doğrulama Servisi', description = 'Fırat Üniversitesi Merkezi Kimlik Doğrulama Servisi' }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Head>
        <title>{title} | Fırat Üniversitesi</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navbar Component */}
      <Navbar />

      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600"> Fırat Üniversitesi | Merkezi Kimlik Doğrulama Servisi</p>
          <div className="mt-2 text-center">
            <div className="inline-flex">
              <a href="#" className="text-blue-600 hover:underline mr-2 border-r pr-2">English</a>
              <a href="#" className="text-blue-600 hover:underline">Türkçe</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}