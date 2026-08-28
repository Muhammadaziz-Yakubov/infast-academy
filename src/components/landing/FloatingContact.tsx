'use client';

import React from 'react';
import { Send, Phone } from 'lucide-react';

export function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
      {/* Telegram Widget */}
      <a
        href="https://t.me/infast_academy"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-xl shadow-blue-500/30 flex items-center justify-center transition-all hover:scale-110"
        title="Telegram orqali bog'lanish"
      >
        <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
      </a>

      {/* Phone Call Widget */}
      <a
        href="tel:+998901234567"
        className="w-12 h-12 rounded-full bg-gradient-to-r from-infast-600 to-amber-500 text-white shadow-xl shadow-infast-500/30 flex items-center justify-center transition-all hover:scale-110"
        title="Qo'ng'iroq qilish"
      >
        <Phone className="w-5 h-5" />
      </a>
    </div>
  );
}
