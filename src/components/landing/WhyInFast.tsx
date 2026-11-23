'use client';

import React from 'react';
import { Layers, Cpu, Bot, Rocket, FolderGit2, Compass, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyInFast() {
  const features = [
    {
      icon: Layers,
      title: 'Real Production Loyihalar',
      accent: 'from-[#FF2A85] to-[#FF7A00]',
      description: 'Har bir bosqichda real amaliy loyihalar, CRM, E-commerce va SaaS platformalarini to\'liq ishlab chiqish.',
    },
    {
      icon: Cpu,
      title: 'Eng Zamonaviy Stack',
      accent: 'from-[#FF7A00] to-amber-400',
      description: 'Bugungi global IT bozorida eng talabgir texnologiyalar: Next.js 14, TypeScript, Node.js, Docker va Linux.',
    },
    {
      icon: Bot,
      title: 'AI va Copilot Integratsiyasi',
      accent: 'from-purple-500 to-[#FF2A85]',
      description: 'Zamonaviy Sun\'iy Intellekt vositalari (GitHub Copilot, LLM, Claude) bilan 3x tezroq kod yozish madaniyati.',
    },
    {
      icon: Rocket,
      title: '96% Amaliyot va Interaktivlik',
      accent: 'from-[#00F0FF] to-blue-500',
      description: 'Quruq nazariyadan xoli: har bir darsda jonli kod yozish, 9-talik testlar va real muammolarni hal qilish.',
    },
    {
      icon: FolderGit2,
      title: 'Kuchli Shaxsiy Portfolio',
      accent: 'from-emerald-400 to-[#00F0FF]',
      description: 'Kurs davomida kamida 4-5 ta ishlab chiqarish darajasidagi loyihalardan iborat professional GitHub portfolio.',
    },
    {
      icon: Compass,
      title: 'Senior Mindset va Arxitektura',
      accent: 'from-amber-400 to-[#FF2A85]',
      description: 'Faqat sintaksis emas, balki senior dasturchilar kabi tizim arxitekturasini to\'g\'ri loyihalash madaniyati.',
    },
  ];

  return (
    <section id="nega-infast" className="py-24 bg-[#050508] text-white relative overflow-hidden font-sans">
      {/* GTA VI Ambient Mesh */}
      <div className="absolute top-1/2 left-1/4 w-[600px] h-[600px] bg-[#FF2A85]/10 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-[#00F0FF]/10 rounded-full blur-[170px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 via-[#FF7A00]/15 to-[#00F0FF]/15 border border-[#FF2A85]/30 px-4 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,133,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span className="uppercase tracking-widest text-[11px]">Nega Aynan InFast?</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            Kelajak texnologiyalarini{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
              haqiqiy amaliyot bilan o‘rganing.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-normal max-w-2xl mx-auto leading-relaxed">
            Biz faqat sintaksisni emas, real ishlab chiqarish va senior darajada ishlashni o‘rgatamiz.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-[32px] bg-neutral-900/50 border border-white/10 backdrop-blur-2xl hover:border-white/25 hover:-translate-y-1.5 transition-all duration-300 space-y-4 shadow-2xl hover:shadow-[0_0_35px_rgba(255,42,133,0.15)]"
              >
                <div className="space-y-3">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${item.accent} p-0.5 shadow-lg`}>
                    <div className="w-full h-full bg-neutral-950 rounded-[14px] flex items-center justify-center text-white">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed font-normal">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
