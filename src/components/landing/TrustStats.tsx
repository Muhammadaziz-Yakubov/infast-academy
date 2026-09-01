'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function TrustStats() {
  const stats = [
    { number: '500+', label: "Bitiruvchilar", sublabel: 'Amaliy bilimga ega dasturchilar' },
    { number: '20+', label: 'Real Loyihalar', sublabel: 'Portfolio uchun tayyor tizimlar' },
    { number: '3', label: 'Yo‘nalishlar', sublabel: 'Frontend, Backend, Cyber Security' },
    { number: '95%', label: 'Amaliyot', sublabel: 'Real ishlab chiqarish muhiti' },
  ];

  return (
    <section className="py-12 bg-black border-y border-white/10 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-6 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-2xl text-center lg:text-left shadow-xl"
            >
              <div className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                {stat.number}
              </div>
              <div className="mt-2 font-semibold text-xs text-white">{stat.label}</div>
              <div className="text-[11px] text-neutral-400 mt-0.5">{stat.sublabel}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
