'use client';

import React from 'react';
import { Video, Code, CheckSquare, MessageSquareCode, Bot, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export function LearningExperience() {
  const experiences = [
    {
      icon: Video,
      title: 'Interaktiv Jonli Darslar',
      desc: 'Har bir dars amaliyot va muloqot tarzida o‘tiladi, barcha savollaringizga joyida javob olasiz.',
    },
    {
      icon: Code,
      title: '95% Kod Yozish',
      desc: 'Nazaqiyadan ko‘ra ko‘proq real topshiriqlar va loyihalar ustida ishlash.',
    },
    {
      icon: CheckSquare,
      title: 'Shaxsiy Code Review',
      desc: 'Tajribali mentorlar tomonidan yozgan kodingiz sinchiklab tekshiriladi va to‘g‘ri maslahatlar beriladi.',
    },
    {
      icon: Bot,
      title: 'AI Dev Workflow',
      desc: 'Dasturchining samaradorligini 10 barobarga oshiruvchi sun‘iy intellekt vositalaridan foydalanish.',
    },
    {
      icon: MessageSquareCode,
      title: 'Real Proyektlar',
      desc: "Buyurtma berilgan yoki haqiqiy muammoni hal etuvchi dasturiy ta'limotlarni ishlab chiqish.",
    },
    {
      icon: Users,
      title: 'Dasturchilar Hamjamiyati',
      desc: 'Safdoshlaringiz bilan birga o‘rganish, tajriba almashish va jamoaviy loyihalar barpo etish.',
    },
  ];

  return (
    <section className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <span>TA'LIM EKOTIZIMI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            InFast ta'lim <span className="text-infast-500">tajribasi.</span>
          </h2>
          <p className="text-base text-slate-400">
            Dars jarayonida maksimal natijaga erishish uchun barcha imkoniyatlar muhiti.
          </p>
        </div>

        {/* Experience Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, idx) => {
            const Icon = exp.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-infast-500/30 transition-all space-y-3"
              >
                <div className="w-10 h-10 rounded-xl bg-infast-500/10 text-infast-500 flex items-center justify-center font-bold">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-white">{exp.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{exp.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
