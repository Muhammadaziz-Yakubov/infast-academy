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
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <span>TRANSFORMASIYA</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            O‘quvchi emas. <span className="text-infast-500">Developer mindset.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
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
            className="p-8 rounded-3xl bg-slate-900/30 border border-slate-800/80 space-y-6"
          >
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-black">
                BEFORE
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-300">InFast'gacha bo'lgan holat</h3>
                <p className="text-xs text-slate-500">Nazariya va ikkilanishlar davri</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-400">
              {beforePoints.map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
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
            className="p-8 rounded-3xl bg-slate-900/80 border border-infast-500/40 shadow-2xl shadow-infast-500/10 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-infast-500/10 blur-[80px] pointer-events-none" />

            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-black">
                AFTER
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">InFast'dan keyingi natija</h3>
                <p className="text-xs text-infast-400 font-semibold">Junior / Middle Developer darajasi</p>
              </div>
            </div>

            <ul className="space-y-4 text-xs sm:text-sm text-slate-200">
              {afterPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
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
