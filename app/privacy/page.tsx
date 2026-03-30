export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Gizlilik Politikası</h1>
      
      <div className="glass border border-primary/20 rounded-lg p-8 space-y-6 text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">1. Toplanan Bilgiler</h2>
          <p>
            BS3D Crafts olarak, sipariş işlemleriniz sırasında aşağıdaki bilgileri topluyoruz:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Ad Soyad</li>
            <li>E-posta adresi</li>
            <li>Telefon numarası</li>
            <li>Teslimat adresi</li>
            <li>Ödeme bilgileri (güvenli ödeme sağlayıcıları aracılığıyla)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">2. Bilgilerin Kullanımı</h2>
          <p>Topladığımız bilgiler şu amaçlarla kullanılır:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Siparişlerinizi işlemek ve göndermek</li>
            <li>Sizinle iletişim kurmak</li>
            <li>Ödeme işlemlerini gerçekleştirmek</li>
            <li>Müşteri hizmetleri sağlamak</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">3. Veri Güvenliği</h2>
          <p>
            Verileriniz SSL/TLS şifreleme ile korunmaktadır. Ödeme bilgileriniz güvenli ödeme 
            sağlayıcıları (Stripe, PayTR) tarafından işlenir ve bizim sunucularımızda saklanmaz.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">4. Çerezler</h2>
          <p>
            Sitemiz, kullanıcı deneyimini iyileştirmek için çerezler kullanmaktadır. 
            Sepet bilgileriniz tarayıcınızda yerel olarak saklanır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">5. KVKK Uyumu</h2>
          <p>
            6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında, kişisel verileriniz 
            güvenli bir şekilde işlenmekte ve saklanmaktadır.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-white mb-4">6. İletişim</h2>
          <p>
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.
          </p>
        </section>
      </div>
    </div>
  )
}
