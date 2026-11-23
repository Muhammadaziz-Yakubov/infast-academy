'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Server, ShieldCheck, Sparkles, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

export function Courses() {
  const courses = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      badge: 'Bozor talabi 99%',
      badgeColor: 'border-[#00F0FF]/40 text-[#00F0FF] bg-[#00F0FF]/10',
      description: 'Zamonaviy interaktiv veb-saytlar, Next.js 14 va murakkab SaaS platformalarini noldan yarating.',
      duration: '9 oy',
      techs: ['HTML5 & CSS3', 'JavaScript', 'React.js', 'Next.js 14', 'TailwindCSS', 'TypeScript'],
      icon: Code2,
      href: '/#ariza',
    },
    {
      id: 'backend',
      title: 'Backend Development',
      badge: 'Yuqori daromadli',
      badgeColor: 'border-[#FF7A00]/40 text-[#FF7A00] bg-[#FF7A00]/10',
      description: 'Mukammal ma\'lumotlar bazasi, mikroservislar arxitekturasi va yuqori yuklamali REST API xizmatlari.',
      duration: '6 oy',
      techs: ['Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'REST API', 'Docker'],
      icon: Server,
      href: '/#ariza',
    },
    {
      id: 'cyber-security',
      title: 'Cyber Security (Pentest)',
      badge: 'Kritik yo‘nalish',
      badgeColor: 'border-[#FF2A85]/40 text-[#FF2A85] bg-[#FF2A85]/10',
      description: 'Tizimlar zaifliklarini aniqlash, etik xakerlik, tarmoq xavfsizligi va korporativ himoya tizimlari.',
      duration: '11 oy',
      techs: ['Linux Admin', 'Networking', 'Web Security', 'Burp Suite', 'OWASP Top 10'],
      icon: ShieldCheck,
      href: '/#ariza',
    },
    {
      id: 'python-ai',
      title: 'Python & AI Engineering',
      badge: 'Kelajak kasbi',
      badgeColor: 'border-purple-400/40 text-purple-400 bg-purple-500/10',
      description: 'Sun\'iy intellekt (AI), Machine Learning algoritmlari, ma\'lumotlar tahlili va avtomatlashtirish botlari.',
      duration: '7 oy',
      techs: ['Python Core', 'FastAPI', 'Pandas & NumPy', 'Machine Learning', 'AI Models'],
      icon: Terminal,
      href: '/#ariza',
    },
  ];

  return (
    <section id="kurslar" className="py-24 bg-[#050508] text-white relative overflow-hidden font-sans">
      {/* GTA VI Neon Ambient Backlight */}
      <div className="absolute top-1/2 left-10 w-96 h-96 bg-[#FF2A85]/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 via-[#FF7A00]/15 to-[#00F0FF]/15 border border-[#FF2A85]/30 px-4 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,133,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span className="uppercase tracking-widest text-[11px]">Amaliy IT Yo'nalishlari</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            O‘zingizga mos{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
              yo‘nalishni tanlang.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-normal max-w-2xl mx-auto leading-relaxed">
            Har bir kurs real amaliy loyihalar, o'quv xaritasi, 9-talik testlar va kafolatlangan portfolio yaratishga qaratilgan.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative p-7 rounded-[32px] bg-neutral-900/60 border border-white/10 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between space-y-6 hover:border-white/25 hover:-translate-y-1.5 shadow-2xl hover:shadow-[0_0_30px_rgba(255,42,133,0.15)]"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-white group-hover:scale-105 transition-transform">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${course.badgeColor}`}>
                    {course.badge}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <h3 className="text-lg font-black text-white tracking-tight">{course.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{course.description}</p>
                  
                  {/* Duration tag */}
                  <div className="text-xs font-semibold text-neutral-300">
                    Davomiyligi: <span className="text-white font-bold">{course.duration}</span>
                  </div>

                  {/* Tech Badges */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {course.techs.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-3 border-t border-white/10">
                  <Link
                    href={course.href}
                    className="w-full flex items-center justify-center py-3 rounded-2xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-md group-hover:bg-gradient-to-r group-hover:from-[#FF2A85] group-hover:to-[#FF7A00] group-hover:text-white"
                  >
                    <span>Ariza topshirish</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
