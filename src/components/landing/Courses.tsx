'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Server, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function Courses() {
  const courses = [
    {
      id: 'frontend',
      title: 'FRONTEND DEVELOPMENT',
      badge: 'Eng Ommabop',
      description: 'Zamonaviy interaktiv veb-saytlar va Next.js CRM platformalarini yaratuvchi mutaxassis bo‘ling.',
      duration: '6 oy',
      techs: ['HTML5 & CSS3', 'JavaScript ES6+', 'React.js', 'Next.js 14', 'TailwindCSS', 'TypeScript'],
      icon: Code2,
      href: '/kurslar/frontend',
      accentColor: 'from-amber-500/20 to-infast-500/30',
      borderColor: 'hover:border-infast-500/50',
    },
    {
      id: 'backend',
      title: 'BACKEND DEVELOPMENT',
      badge: 'Yuqori Daromadli',
      description: 'Mukammal ma\'lumotlar bazasi, server arxitekturasi va REST API xizmatlarini noldan quring.',
      duration: '6 oy',
      techs: ['Node.js', 'Express.js', 'MongoDB', 'REST & GraphQL', 'JWT Auth', 'TypeScript'],
      icon: Server,
      href: '/kurslar/backend',
      accentColor: 'from-emerald-500/20 to-teal-500/30',
      borderColor: 'hover:border-emerald-500/50',
    },
    {
      id: 'cyber-security',
      title: 'CYBER SECURITY',
      badge: 'Kritik Talabgir',
      description: 'Kiberxavfsizlik, pentesting va veb-tizimlar zaifliklarini aniqlash hamda ularni himoyalash.',
      duration: '6 oy',
      techs: ['Linux Admin', 'Networking', 'Web Security', 'Penetration Testing', 'OWASP Top 10', 'Labs'],
      icon: ShieldCheck,
      href: '/kurslar/cyber-security',
      accentColor: 'from-blue-500/20 to-indigo-500/30',
      borderColor: 'hover:border-blue-500/50',
    },
  ];

  return (
    <section id="kurslar" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-slate-900 border border-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-300">
            <Zap className="w-3.5 h-3.5 text-infast-500" />
            <span>IT YO'NALISHLARI</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            O‘zingizga mos <span className="text-infast-500">yo‘nalishni tanlang.</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400">
            Har bir kurs real bozor talablaridan kelib chiqqan holda amaliy va loyihaviy asosda tuzilgan.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {courses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className={`group relative p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl transition-all duration-300 flex flex-col justify-between space-y-8 ${course.borderColor} hover:-translate-y-2 hover:shadow-2xl hover:shadow-infast-500/10`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${course.accentColor} border border-slate-700/50 flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-infast-500/10 border border-infast-500/20 text-infast-400">
                    {course.badge}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white tracking-tight">{course.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{course.description}</p>
                  
                  {/* Duration tag */}
                  <div className="text-xs font-semibold text-slate-300">
                    Davomiyligi: <span className="text-infast-400 font-bold">{course.duration}</span>
                  </div>

                  {/* Tech Badges */}
                  <div className="pt-2 flex flex-wrap gap-2">
                    {course.techs.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-4 border-t border-slate-800/80">
                  <Link
                    href={course.href}
                    className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 group-hover:bg-infast-500 text-white font-bold text-xs transition-colors"
                  >
                    <span>Batafsil kurs dasturi</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
