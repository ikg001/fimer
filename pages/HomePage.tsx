import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { ComplaintCard } from '../components/ComplaintCard'
import { FileTextIcon, UsersIcon, BarChartIcon } from 'lucide-react'

export const HomePage = () => {
  // Örnek şikayet verileri
  const recentComplaints = [
    {
      id: '1',
      title: 'Ürün teslimatı gecikmesi',
      description:
        'Siparişim 5 gün önce verilmesine rağmen hala teslim edilmedi. Kargo takip numarası ile kontrol ettiğimde herhangi bir ilerleme göremiyorum.',
      category: 'Teslimat',
      status: 'pending' as const,
      date: '10.06.2023',
    },
    {
      id: '2',
      title: 'Bozuk ürün',
      description:
        'Satın aldığım ürün kutusundan hasarlı çıktı. İade etmek istiyorum ancak müşteri hizmetlerine ulaşamıyorum.',
      category: 'Ürün Kalitesi',
      status: 'in-progress' as const,
      date: '08.06.2023',
    },
    {
      id: '3',
      title: 'Yanlış ürün gönderimi',
      description:
        'Sipariş ettiğim üründen farklı bir ürün gönderildi. Doğru ürünün gönderilmesini talep ediyorum.',
      category: 'Sipariş Hatası',
      status: 'resolved' as const,
      date: '05.06.2023',
      rating: 4,
    },
  ]

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-blue-600 text-white py-16 px-4 rounded-lg mb-8">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-4">FİMER</h1>
          <p className="text-xl mb-8">Şikayet ve Talep Yönetim Sistemi</p>
          <p className="mb-8 text-blue-100">
            Şikayetlerinizi ve taleplerinizi hızlı ve kolay bir şekilde
            iletebilir, takip edebilir ve çözüme kavuşturabilirsiniz.
          </p>
          <Link to="/submit-complaint">
            <Button
              size="lg"
              variant="primary"
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Şikayet Oluştur
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Neden FİMER?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileTextIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Kolay Şikayet Oluşturma
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Basit ve kullanıcı dostu arayüz ile dakikalar içinde
                şikayetinizi oluşturun.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <BarChartIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Gerçek Zamanlı Takip
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Şikayetlerinizin durumunu anlık olarak takip edin ve
                güncellemelerden haberdar olun.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mx-auto bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <UsersIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Hızlı Çözüm</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Uzman ekibimiz şikayetlerinizi en kısa sürede değerlendirip
                çözüme kavuşturur.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Recent Complaints Section */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Son Şikayetler</h2>
          <Link to="/dashboard">
            <Button variant="outline" size="sm">
              Tümünü Gör
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentComplaints.map((complaint) => (
            <ComplaintCard
              key={complaint.id}
              {...complaint}
              onView={(id) => console.log(`View complaint ${id}`)}
            />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Şikayetiniz veya talebiniz mi var?
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Hemen şikayet veya talebinizi oluşturun, sürecinizi takip edin.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/register">
            <Button variant="primary">Kayıt Ol</Button>
          </Link>
          <Link to="/submit-complaint">
            <Button variant="outline">Şikayet Oluştur</Button>
          </Link>
        </div>
      </section>
    </div>
  )
} 