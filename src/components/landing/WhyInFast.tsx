'use client';

import React from 'react';
import { Layers, Cpu, Bot, Rocket, FolderGit2, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export function WhyInFast() {
  const features = [
    {
      icon: Layers,
      title: 'Real Projects',
      description: 'Har bir bosqichda real amaliy loyihalar va CRM / E-commerce platformalarini barpo etish.',
    },
    {
      icon: Cpu,
      title: 'Modern Stack',
      description: 'Bugungi IT bozorida eng talabgir texnologiyalar: React, Next.js 14, Node.js, MongoDB va Linux.',
    },
    {
      icon: Bot,
      title: 'AI Integration',
      description: 'Zamonaviy AI vositalari (GitHub Copilot, LLM, prompt engineering) bilan samarali ishlash.',
    },
    {
      icon: Rocket,
      title: '95% Amaliyot',
      description: 'Quruq nazariyadan holi, har bir darsda jonli kod yozish va real muammolarni hal qilish.',
    },
    {
      icon: FolderGit2,
      title: 'Kuchli Portfolio',
      description: 'Kurs davomida kamida 4-5 ta tayyor real loyihadan iborat shaxsiy GitHub portfolio yaratish.',
    },
    {
      icon: Compass,
      title: 'Senior Mindset',
      description: 'Faqat sintaksis emas, balki senior dasturchilar kabi tizim arxitekturasini loyihalash madaniyati.',
    },
  ];

  return (
    <section id="nega-infast" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300">
            <span>Afzalliklarimiz</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Nega aynan <span className="text-neutral-400 font-normal">InFast?</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-normal">
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
                className="group p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-2xl hover:border-white/20 transition-all duration-300 space-y-4 shadow-2xl"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
