'use client';

import React from 'react';
import { Terminal, Code, Sparkles, Zap, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function InfastExperience() {
  return (
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-infast-500/10 blur-[180px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-4 py-2 rounded-full text-xs font-bold text-infast-400">
          <Sparkles className="w-4 h-4" />
          <span>INFAST TA'LIM MENTALITETI</span>
        </div>

        <h2 className="text-3xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
          Kod yozing. Xato qiling. <br />
          <span className="bg-gradient-to-r from-infast-400 via-amber-400 to-white bg-clip-text text-transparent">
            O‘rganing. Yana yarating.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal">
          InFast'da o‘rganish — faqat dars tinglash emas. Bu har kuni amaliy kod yozish, xatolar bilan ishlash va haqiqiy muammolarni hal qilish tajribasidir.
        </p>

        <div className="pt-4 flex justify-center">
          <Link
            href="/ariza"
            className="inline-flex items-center px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-infast-600 to-amber-500 shadow-xl shadow-infast-500/30 hover:scale-105 transition-transform"
          >
            <span>Qabulga yozilish</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
