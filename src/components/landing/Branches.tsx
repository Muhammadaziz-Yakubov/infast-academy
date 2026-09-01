'use client';

import React from 'react';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
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
    <section id="biz-haqimizda" className="py-24 bg-black text-white relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300">
            <span>Manzilimiz</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Akademiya <span className="text-neutral-400 font-normal">filiali.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-normal">
            Akademiyamizga tashrif buyurib, bepul sinov darsi va konsultatsiyada qatnashishingiz mumkin.
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
              className="p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-2xl transition-all space-y-6 shadow-2xl"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    {b.city}
                  </span>
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Rasmiy Filial
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">{b.name}</h3>

                <div className="space-y-3 text-xs sm:text-sm text-neutral-300">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-white shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-white shrink-0" />
                    <span>{b.hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <a
                  href={`tel:${b.phone.replace(/\s+/g, '')}`}
                  className="w-full inline-flex items-center justify-center py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-xl shadow-white/10"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  <span>Bog'lanish va qabulga yozilish</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
