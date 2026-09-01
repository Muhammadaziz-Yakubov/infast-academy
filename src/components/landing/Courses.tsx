'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Server, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export function Courses() {
  const courses = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      badge: 'Bozor talabi yuqori',
      description: 'Zamonaviy interaktiv veb-saytlar va Next.js 14 platformalarini yaratuvchi mutaxassis bo‘ling.',
      duration: '6 oy',
      techs: ['HTML & CSS', 'JavaScript', 'React.js', 'Next.js', 'TailwindCSS', 'TypeScript'],
      icon: Code2,
      href: '/#ariza',
    },
    {
      id: 'backend',
      title: 'Backend Development',
      badge: 'Yuqori daromadli',
      description: 'Mukammal ma\'lumotlar bazasi, server arxitekturasi va REST API xizmatlarini noldan quring.',
      duration: '6 oy',
      techs: ['Node.js', 'Express.js', 'MongoDB', 'REST API', 'JWT Auth', 'TypeScript'],
      icon: Server,
      href: '/#ariza',
    },
    {
      id: 'cyber-security',
      title: 'Cyber Security',
      badge: 'Kritik yo‘nalish',
      description: 'Kiberxavfsizlik, pentesting va veb-tizimlar zaifliklarini aniqlash hamda tizimlarni himoyalash.',
      duration: '6 oy',
      techs: ['Linux Admin', 'Networking', 'Web Security', 'Pentesting', 'OWASP Top 10'],
      icon: ShieldCheck,
      href: '/#ariza',
    },
  ];

  return (
    <section id="kurslar" className="py-24 bg-black text-white relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300">
            <span>IT Yo'nalishlari</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            O‘zingizga mos <span className="text-neutral-400 font-normal">yo‘nalishni tanlang.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-normal">
            Har bir kurs real amaliy loyihalar va portfolio yaratishga qaratilgan.
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {courses.map((course, idx) => {
            const Icon = course.icon;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="group relative p-8 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between space-y-8 hover:border-white/20 hover:-translate-y-1 shadow-2xl"
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-white">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    {course.badge}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-3.5">
                  <h3 className="text-xl font-bold text-white tracking-tight">{course.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{course.description}</p>
                  
                  {/* Duration tag */}
                  <div className="text-xs font-medium text-neutral-300">
                    Davomiyligi: <span className="text-white font-semibold">{course.duration}</span>
                  </div>

                  {/* Tech Badges */}
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {course.techs.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-4 border-t border-white/10">
                  <Link
                    href={course.href}
                    className="w-full flex items-center justify-center py-3 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-all active:scale-95 shadow-sm"
                  >
                    <span>Yozilish & Ariza topshirish</span>
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
