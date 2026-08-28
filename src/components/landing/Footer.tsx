'use client';

import React from 'react';
import Link from 'next/link';
import { Zap, Send, Instagram, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white border-t border-slate-900 pt-16 pb-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-infast-500 flex items-center justify-center text-white font-bold">
                <Zap className="w-5 h-5 fill-white" />
              </div>
              <span className="font-black text-xl tracking-tight">INFAST CRM</span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zamonaviy amaliy IT ta'lim akademiyasi. Real loyihalar, tajribali mentorlar va kuchli portfolio.
            </p>
          </div>

          {/* Nav Col 1 */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Yo'nalishlar</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/kurslar/frontend" className="hover:text-infast-400 transition-colors">
                  Frontend Development
                </Link>
              </li>
              <li>
                <Link href="/kurslar/backend" className="hover:text-infast-400 transition-colors">
                  Backend Development
                </Link>
              </li>
              <li>
                <Link href="/kurslar/cyber-security" className="hover:text-infast-400 transition-colors">
                  Cyber Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Nav Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Akademiya</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/kurslar" className="hover:text-infast-400 transition-colors">
                  Barcha Kurslar
                </Link>
              </li>
              <li>
                <Link href="/natijalar" className="hover:text-infast-400 transition-colors">
                  O'quvchilar Natijalari
                </Link>
              </li>
              <li>
                <Link href="/#biz-haqimizda" className="hover:text-infast-400 transition-colors">
                  Manzillarimiz
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-infast-400 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Col */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white uppercase tracking-wider">Bog'lanish</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p>Telefon: +998 90 123 45 67</p>
              <p>Telegram: @infast_academy</p>
              <p>Manzil: Toshkent sh., Chilonzor tumani</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 InFast IT-Academy. Barcha huquqlar himoyalangan.</p>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="hover:text-slate-300 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
