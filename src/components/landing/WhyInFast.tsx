'use client';

import React from 'react';
import { Layers, Cpu, Bot, Rocket, FolderGit2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyInFast() {
  const features = [
    {
      icon: Layers,
      title: 'Real Projects',
      description: 'Har bir bosqichda real amaliy loyihalar va CRM / E-commerce tizimlarini barpo etish.',
      color: 'from-amber-500/20 to-infast-500/20',
      iconColor: 'text-infast-500',
    },
    {
      icon: Cpu,
      title: 'Modern Technologies',
      description: 'Bugungi IT bozorida eng talabgir texnologiyalar: React, Next.js 14, Node.js, MongoDB va Linux.',
      color: 'from-blue-500/20 to-indigo-500/20',
      iconColor: 'text-blue-400',
    },
    {
      icon: Bot,
      title: 'AI-Powered Learning',
      description: 'Zamonaviy AI vositalari (GitHub Copilot, LLM, prompt engineering) bilan ishlashni mukammal egallash.',
      color: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'text-purple-400',
    },
    {
      icon: Rocket,
      title: 'Practical Approach',
      description: 'Quruq nazariyadan ko‘ra 95% amaliyot, har bir darsda jonli kod yozish va muammolarni hal qilish.',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400',
    },
    {
      icon: FolderGit2,
      title: 'Portfolio Building',
      description: 'Kurs davomida kamida 4-5 ta tayyor real loyihadan iborat kuchli GitHub portfolio yaratish.',
      color: 'from-orange-500/20 to-amber-500/20',
      iconColor: 'text-orange-400',
    },
    {
      icon: Compass,
      title: 'Career Mindset',
      description: 'Faqat kod yozish emas, balki senior dasturchilar kabi fikrlash va jamoada ishlash madaniyati.',
      color: 'from-cyan-500/20 to-blue-500/20',
      iconColor: 'text-cyan-400',
    },
  ];

  return (
    <section id="nega-infast" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-infast-500/10 blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <span>AFZALLIKLARIMIZ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Nega aynan <span className="text-infast-500">InFast?</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Biz faqat kod yozishni emas, real IT muhitida senior darajada ishlash va muammolarni hal qilishni o‘rgatamiz.
          </p>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-infast-500/40 hover:bg-slate-900/80 transition-all duration-300 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} border border-slate-700/50 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
