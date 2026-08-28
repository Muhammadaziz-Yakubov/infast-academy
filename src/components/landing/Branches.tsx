'use client';

import React from 'react';
import { MapPin, Phone, Mail, Clock, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

export function Branches() {
  const branches = [
    {
      name: 'INFAST IT-ACADEMY Bosh Filiali',
      city: 'Toshkent shahri',
      address: 'Chilonzor tumani, Bunyodkor shoh ko‘chasi 15-uy (Metro yaqinida)',
      phone: '+998 90 123 45 67',
      hours: '09:00 — 20:00 (Dushanba — Shanba)',
      isMain: true,
    },
    {
      name: 'INFAST IT-ACADEMY 2-Filial',
      city: 'Toshkent shahri',
      address: 'Yakkasaroy tumani, Shota Rustaveli ko‘chasi 42-uy',
      phone: '+998 90 987 65 43',
      hours: '09:00 — 20:00 (Dushanba — Shanba)',
      isMain: false,
    },
  ];

  return (
    <section id="biz-haqimizda" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>AKADEMIYA MANZILLARI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Bizni <span className="text-infast-500">toping.</span>
          </h2>
          <p className="text-base text-slate-400">
            Akademiyamizga tashrif buyurib, bepul sinov darsi va konsultatsiyada qatnashishingiz mumkin.
          </p>
        </div>

        {/* Branches Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((b, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-infast-500/40 transition-all space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-infast-500/10 border border-infast-500/20 text-infast-400">
                    {b.city}
                  </span>
                  {b.isMain && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Bosh filial
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white">{b.name}</h3>

                <div className="space-y-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-infast-500 shrink-0 mt-1" />
                    <span>{b.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-infast-500 shrink-0" />
                    <span>{b.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-4 h-4 text-infast-500 shrink-0" />
                    <span>{b.hours}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <a
                  href={`tel:${b.phone.replace(/\s+/g, '')}`}
                  className="w-full inline-flex items-center justify-center p-3 rounded-2xl bg-slate-800 hover:bg-infast-500 text-white font-bold text-xs transition-colors"
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
