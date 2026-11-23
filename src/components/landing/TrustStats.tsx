'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustStats() {
  const stats = [
    { number: '1,200+', label: 'Bitiruvchilar', sublabel: 'Amaliy bilimga ega dasturchilar' },
    { number: '40+', label: 'Real Loyihalar', sublabel: 'Portfolio uchun tayyor tizimlar' },
    { number: '4', label: 'Asosiy Yo‘nalish', sublabel: 'Frontend, Backend, CyberSec, AI' },
    { number: '96%', label: 'Ishga Joylashish', sublabel: 'O\'zbekiston va remote bozor' },
  ];

  return (
    <section className="py-12 bg-[#050508] border-y border-white/10 relative z-10 overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-[28px] bg-neutral-900/50 border border-white/10 backdrop-blur-2xl text-center lg:text-left shadow-2xl hover:border-[#FF2A85]/30 transition-all group"
            >
              <div className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#FF7A00] group-hover:from-[#FF2A85] group-hover:to-[#00F0FF] transition-all">
                {stat.number}
              </div>
              <div className="mt-2 font-bold text-xs text-white">{stat.label}</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
