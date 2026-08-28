'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustStats() {
  const stats = [
    { number: '500+', label: "Bitiruvchi va O'quvchilar", sublabel: 'Amaliy bilimga ega dasturchilar' },
    { number: '20+', label: 'Real Loyihalar', sublabel: 'Portfolio uchun tayyor tizimlar' },
    { number: '3', label: 'IT Yo‘nalishlari', sublabel: 'Frontend, Backend, Cyber Security' },
    { number: '95%', label: 'Amaliyat Ulushi', sublabel: 'Nazaqiyadan ko‘ra amaliy loyiha' },
  ];

  return (
    <section className="py-12 bg-slate-950 border-y border-slate-900 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md hover:border-infast-500/30 transition-all text-center lg:text-left"
            >
              <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-infast-400">
                {stat.number}
              </div>
              <div className="mt-2 font-bold text-sm text-slate-200">{stat.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
