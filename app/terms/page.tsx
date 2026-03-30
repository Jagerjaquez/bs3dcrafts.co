export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Kullanım Şartları</h1>
      
      <div className="glass border border-primary/20 rounded-lg p-8 space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Genel Şartlar</h2>
          <p>
            BS3D Crafts web sitesini kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Ürünler</h2>
          <p>
            Tüm ürünler 3D baskı teknolojisi ile özel olarak üretilmektedir. 
            Ürün görselleri temsilidir ve gerçek ürünlerde küçük farklılıklar olabilir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Siparişler</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Siparişler onaylandıktan sonra üretim sürecine alınır</li>
            <li>Üretim süresi ürüne göre değişiklik gösterir</li>
            <li>Sipariş durumunuz e-posta ile bildirilir</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Ödeme</h2>
          <p>
            Ödemeler Stripe ve PayTR güvenli ödeme sistemleri üzerinden alınmaktadır.
            Kredi kartı bilgileriniz bizim sunucularımızda saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. İptal ve İade</h2>
          <p>
            Özel üretim ürünler olduğu için, üretim başladıktan sonra iptal kabul edilmemektedir.
            Hatalı veya hasarlı ürünler için 14 gün içinde iade hakkınız bulunmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. Teslimat</h2>
          <p>
            Ürünler kargo ile gönderilir. Teslimat süresi bölgeye göre değişiklik gösterir.
            Kargo ücreti sepet toplamına eklenir.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">7. Sorumluluk</h2>
          <p>
            BS3D Crafts, ürünlerin kullanımından kaynaklanan dolaylı zararlardan sorumlu değildir.
          </p>
        </section>
      </div>
    </div>
  )
}
