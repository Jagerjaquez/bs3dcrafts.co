'use client'

import { MessageCircle } from 'lucide-react'

export function WhatsAppButton() {
  // WhatsApp numaranızı buraya ekleyin (ülke kodu ile, + işareti olmadan)
  // Örnek: 905551234567
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '905XXXXXXXXX'
  const message = 'Merhaba! BS3DCrafts ürünleri hakkında bilgi almak istiyorum.'

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 bg-[#25D366] hover:bg-[#20BA5A] text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-bounce-slow group"
      aria-label="WhatsApp ile iletişime geç"
    >
      <MessageCircle className="h-8 w-8 group-hover:rotate-12 transition-transform" />
      
      {/* Pulse effect */}
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-75" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        WhatsApp ile yazın
      </span>
    </button>
  )
}
