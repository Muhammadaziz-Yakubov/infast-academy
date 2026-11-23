'use client';

import React from 'react';
import { Send, Phone } from 'lucide-react';

export function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3 font-sans">
      {/* Telegram Widget */}
      <a
        href="https://t.me/infast_academy"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00F0FF] to-blue-600 text-white shadow-xl shadow-cyan-500/25 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Telegram orqali bog'lanish"
      >
        <Send className="w-5 h-5 -translate-x-0.5 translate-y-0.5" />
      </a>

      {/* Phone Call Widget with GTA VI Sunset Glow */}
      <a
        href="tel:+998902710027"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#FF2A85] to-[#FF7A00] text-white shadow-xl shadow-pink-500/30 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        title="Qo'ng'iroq qilish"
      >
        <Phone className="w-5 h-5 fill-white" />
      </a>
    </div>
  );
}
