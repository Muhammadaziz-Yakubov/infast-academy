'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10 pt-16 pb-12 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-white text-black font-extrabold text-xs flex items-center justify-center">
                ⚡
              </div>
              <span className="font-bold text-sm tracking-tight text-white">InFast Academy</span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed font-normal">
              Zamonaviy amaliy IT ta'lim akademiyasi. Real loyihalar va kuchli portfolio.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-white">Yo'nalishlar</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400 font-normal">
              <li>
                <Link href="/#kurslar" className="hover:text-white transition-colors">
                  Frontend Development
                </Link>
              </li>
              <li>
                <Link href="/#kurslar" className="hover:text-white transition-colors">
                  Backend Development
                </Link>
              </li>
              <li>
                <Link href="/#kurslar" className="hover:text-white transition-colors">
                  Cyber Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-white">Akademiya</h4>
            <ul className="space-y-1.5 text-xs text-neutral-400 font-normal">
              <li>
                <Link href="/#kurslar" className="hover:text-white transition-colors">
                  Barcha Kurslar
                </Link>
              </li>
              <li>
                <Link href="/#kalkulyator" className="hover:text-white transition-colors">
                  Kalkulyator
                </Link>
              </li>
              <li>
                <Link href="/#nega-infast" className="hover:text-white transition-colors">
                  Afzalliklar
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-2.5">
            <h4 className="font-semibold text-xs text-white">Bog'lanish</h4>
            <div className="space-y-1.5 text-xs text-neutral-400 font-normal">
              <p>Telefon: +998 90 271 00 27</p>
              <p>Telegram: @infast_academy</p>
              <p>Manzil: Andijon v., Buloqboshi t., yangi Hokimiyat binosi</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4">
          <p>© 2026 InFast IT-Academy. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-neutral-300 transition-colors">
              Admin CRM Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
