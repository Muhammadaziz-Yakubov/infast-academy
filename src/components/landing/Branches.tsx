'use client';

import React from 'react';
import { MapPin, Phone, Clock, Navigation, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function Branches() {
  const branches = [
    {
      name: 'InFast IT-Academy',
      city: 'Andijon viloyati',
      address: 'Buloqboshi tumani, yangi Hokimiyat binosi ichida',
      phone: '+998 90 271 00 27',
      hours: '09:00 — 20:00 (Dushanba — Shanba)',
      isMain: true,
    },
  ];

  return (
    <section id="biz-haqimizda" className="py-24 bg-[#050508] text-white relative overflow-hidden font-sans">
      {/* GTA VI Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-gradient-to-r from-[#FF2A85]/12 to-[#00F0FF]/12 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 via-[#FF7A00]/15 to-[#00F0FF]/15 border border-[#FF2A85]/30 px-4 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,133,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span className="uppercase tracking-widest text-[11px]">Rasmiy Manzilimiz</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
            Akademiya{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
              filiali va markazi.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-normal">
            Akademiyamizga tashrif buyurib, bepul sinov darsi va konsultatsiyada bevosita qatnashishingiz mumkin.
          </p>
        </div>

        {/* Branch Card */}
        <div className="max-w-xl mx-auto">
          {branches.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="p-8 sm:p-10 rounded-[36px] bg-neutral-900/60 border border-white/10 backdrop-blur-2xl transition-all space-y-6 shadow-2xl hover:border-[#FF2A85]/30"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300">
                    {b.city}
                  </span>
                  <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Faol Filial
                  </span>
                </div>
                <h3 className="text-2xl font-black text-white">{b.name}</h3>

                <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-[#FF7A00] shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-[#00F0FF] shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-[#FF2A85] shrink-0" />
                    <span>{b.hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={`tel:${b.phone.replace(/\s+/g, '')}`}
                  className="w-full inline-flex items-center justify-center py-4 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] text-white font-black text-xs hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-[#FF2A85]/20"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  <span>Qabulga Yozilish & Telefon Qilish</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
