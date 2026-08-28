'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function ZeroToProject() {
  const steps = [
    {
      num: '01',
      title: 'Foundation',
      description: 'Dasturlash mantiqiy asoslari, Linux buyruqlari, Git va GitHub platformasida ishlash.',
    },
    {
      num: '02',
      title: 'Core Skills',
      description: 'Tanlangan yo‘nalish bo‘yicha chuqurlashtirilgan tillar (JS, Node.js, React, Security) va vositalar.',
    },
    {
      num: '03',
      title: 'Practice',
      description: 'Har kuni o‘tilgan mavzuga oid amaliy kod yozish va mentordan shaxsiy code review olish.',
    },
    {
      num: '04',
      title: 'Real Project',
      description: 'Guruh bilan haqiqiy CRM, E-commerce va Telegram bot loyihalarini noldan oxirigacha qurish.',
    },
    {
      num: '05',
      title: 'Portfolio',
      description: 'Tayyor bo‘lgan real loyihalarni vercel/deploy qilish va professional GitHub portfolio yaratish.',
    },
    {
      num: '06',
      title: 'Next Level',
      description: 'Rezyume tayyorlash, texnik intervyuga tayyorgarlik va Junior/Middle dasturchi sifatida ishga kirish.',
    },
  ];

  return (
    <section className="py-24 bg-slate-950 text-white border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <span>O‘QUV ROADMAP</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Noldan <span className="text-infast-500">real loyihagacha.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            O'quv jarayonimizning har bir bosqichi aniq maqsad va natijaga yo'naltirilgan.
          </p>
        </div>

        {/* Roadmap Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-md hover:border-infast-500/30 transition-all space-y-4 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-3xl font-black text-infast-500/40 group-hover:text-infast-500 transition-colors">
                  {step.num}
                </span>
                <div className="w-2 h-2 rounded-full bg-infast-500" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
