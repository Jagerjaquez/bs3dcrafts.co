export default function FAQPage() {
  const faqs = [
    {
      question: '3D baskı nedir?',
      answer: '3D baskı, dijital tasarımlardan katman katman fiziksel nesneler oluşturma teknolojisidir. PLA, PETG gibi malzemeler kullanılır.'
    },
    {
      question: 'Sipariş ne kadar sürede hazırlanır?',
      answer: 'Üretim süresi ürüne göre değişir. Genellikle 2-5 iş günü içinde üretim tamamlanır ve kargoya verilir.'
    },
    {
      question: 'Hangi ödeme yöntemlerini kabul ediyorsunuz?',
      answer: 'Kredi kartı (Stripe) ve tüm Türk bankaları (PayTR) ile ödeme yapabilirsiniz.'
    },
    {
      question: 'Kargo ücreti ne kadar?',
      answer: 'Kargo ücreti sepet toplamına göre hesaplanır ve ödeme sayfasında gösterilir.'
    },
    {
      question: 'İade yapabilir miyim?',
      answer: 'Hatalı veya hasarlı ürünler için 14 gün içinde iade hakkınız vardır. Özel üretim olduğu için, üretim başladıktan sonra iptal kabul edilmez.'
    },
    {
      question: 'Özel tasarım yaptırabilir miyim?',
      answer: 'Evet! İletişim sayfasından bizimle iletişime geçerek özel tasarım talebinde bulunabilirsiniz.'
    },
    {
      question: 'Hangi malzemeleri kullanıyorsunuz?',
      answer: 'PLA, PETG, ABS ve TPU gibi çeşitli 3D baskı malzemeleri kullanıyoruz. Her ürünün malzemesi ürün sayfasında belirtilmiştir.'
    },
    {
      question: 'Ürünler dayanıklı mı?',
      answer: 'Evet, kullanılan malzemeler dayanıklıdır. Ancak aşırı ısı ve darbelere karşı dikkatli olunmalıdır.'
    },
  ]

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold text-white mb-8">Sık Sorulan Sorular</h1>
      
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div key={index} className="glass border border-primary/20 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-3">{faq.question}</h3>
            <p className="text-gray-300">{faq.answer}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 glass border border-primary/20 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Başka Sorunuz mu Var?</h2>
        <p className="text-gray-300 mb-4">
          Yukarıda bulamadığınız sorular için bizimle iletişime geçebilirsiniz.
        </p>
        <a 
          href="/contact" 
          className="inline-block px-6 py-3 bg-gradient-to-r from-primary to-secondary rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
        >
          İletişime Geç
        </a>
      </div>
    </div>
  )
}
