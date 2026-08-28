'use client';

import React from 'react';
import { UserCheck, ShieldCheck, Code, Server, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function Mentors() {
  const mentors = [
    {
      name: 'Muhammadaziz Yakubov',
      role: 'Founder & Senior Architect',
      specialty: 'Full-Stack Ecosystems & Next.js Architecture',
      exp: '6+ yil tajriba',
      icon: Award,
      badge: 'Founder',
    },
    {
      name: 'InFast Frontend Team',
      role: 'Lead Frontend Mentors',
      specialty: 'React.js, Next.js 14, UI/UX & Web Performance',
      exp: '4+ yil tajriba',
      icon: Code,
      badge: 'Frontend',
    },
    {
      name: 'InFast Backend Team',
      role: 'Senior Backend Mentors',
      specialty: 'Node.js, Microservices, MongoDB & System Security',
      exp: '5+ yil tajriba',
      icon: Server,
      badge: 'Backend',
    },
    {
      name: 'InFast Security Team',
      role: 'Cyber Security Specialists',
      specialty: 'Linux Kernel, Web Pentesting & Network Defence',
      exp: '4+ yil tajriba',
      icon: ShieldCheck,
      badge: 'CyberSec',
    },
  ];

  return (
    <section className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <span>MENTORLARIMIZ</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Sizga yo‘l <span className="text-infast-500">ko‘rsatadigan jamoa.</span>
          </h2>
          <p className="text-base text-slate-400">
            Real loyihalar ustida ishlayotgan mutaxassislardan to'g'ridan-to'g me'morchilik va kod yozish sirlarini o'rganing.
          </p>
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mentors.map((m, idx) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-infast-500/40 transition-all space-y-4 text-center flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-infast-600 to-amber-500 mx-auto flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-infast-500/20">
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{m.name}</h3>
                    <p className="text-xs font-semibold text-infast-400 mt-0.5">{m.role}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{m.specialty}</p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{m.exp}</span>
                  <span className="font-bold text-slate-200 bg-slate-800 px-2 py-0.5 rounded-md">
                    {m.badge}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
