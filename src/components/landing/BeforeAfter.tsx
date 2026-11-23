'use client';

import React from 'react';
import { XCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function BeforeAfter() {
  const beforePoints = [
    'Dasturlashda hech qanday tajriba yoki yo‘nalish yo‘q edi',
    'Noldan nimadan boshlashni bilmay vaqt yo‘qotish',
    'GitHub va tayyor amaliy loyihalar portfoliosi yo‘qligi',
    'Faqat nazariy darslar ko‘rib, kod yozishga ikkilanib turish',
    'Jamoaviy ishlab chiqarish workflow tajribasi yo‘q edi',
  ];

  const afterPoints = [
    'Next.js, Node.js yoki Cyber Security sohasida chuqur amaliy bilim',
    'GitHub platformasida kamida 4-5 ta real loyihalar portfoliosi',
    'CRM, API va zamonaviy web xizmatlarni noldan mustaqil yaratish',
    'Senior dasturchilar bilan birga ishlangan jamoaviy tajriba',
    'Dasturchi mindsetiga ega bo‘lib, IT kompaniyalarda ishlashga tayyorlik',
  ];

  return (
    <section className="py-24 bg-[#050508] text-white relative overflow-hidden border-t border-white/[0.06]">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-[#FF2A85]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-[#00F0FF]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/10 to-[#00F0FF]/10 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-[#00F0FF] backdrop-blur-md">
            <span className="tracking-wider uppercase">Transformatsiya</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            O‘quvchi emas.{' '}
            <span className="bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] bg-clip-text text-transparent">
              Developer mindset.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-neutral-400">
            InFast IT-Academy'dagi ta'lim o'quvchini shunchaki tinglovchidan professional dasturchiga aylantiradi.
          </p>
        </div>

        {/* Before vs After Dual Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-neutral-900/30 border border-white/[0.06] backdrop-blur-2xl space-y-6 shadow-2xl"
          >
            <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.06]">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center font-black text-xs">
                OLDIN
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-200">InFast'gacha bo'lgan holat</h3>
                <p className="text-xs text-neutral-500">Nazariya va ikkilanishlar davri</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-neutral-400">
              {beforePoints.map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-rose-500/80 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* After Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-8 rounded-3xl bg-neutral-900/50 border border-[#00F0FF]/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,240,255,0.08)] space-y-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#FF2A85]/15 to-[#00F0FF]/15 blur-[60px] pointer-events-none" />

            <div className="flex items-center space-x-3 pb-4 border-b border-white/[0.08]">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF2A85] to-[#FF7A00] text-white flex items-center justify-center font-black text-xs shadow-md shadow-[#FF2A85]/20">
                KEYIN
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">InFast'dan keyingi natija</h3>
                <p className="text-xs bg-gradient-to-r from-[#FF2A85] to-[#00F0FF] bg-clip-text text-transparent font-bold">Junior / Middle Developer darajasi</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-neutral-200">
              {afterPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#00F0FF] shrink-0 mt-0.5" />
                  <span className="font-medium">{pt}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
