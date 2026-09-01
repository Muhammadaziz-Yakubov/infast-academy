'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function SalaryCalculator() {
  const [course, setCourse] = useState('frontend');
  const [level, setLevel] = useState('junior');

  const salaryData: Record<string, Record<string, { salary: string; period: string; demand: string; roles: string[] }>> = {
    frontend: {
      junior: { salary: '$500 — $900', period: '0 - 1 yil', demand: 'Juda Yuqori', roles: ['Junior Frontend Dev', 'React Developer', 'UI Web Developer'] },
      middle: { salary: '$1,200 — $2,500', period: '1 - 3 yil', demand: 'Maksimal', roles: ['Middle Next.js Developer', 'Full-Stack Developer', 'Frontend Team Lead'] },
      senior: { salary: '$3,000 — $6,000+', period: '3+ yil', demand: 'Global / Remote', roles: ['Senior Full-Stack Architect', 'Staff Engineer', 'Tech Lead'] },
    },
    backend: {
      junior: { salary: '$600 — $1,000', period: '0 - 1 yil', demand: 'Yuqori', roles: ['Junior Node.js Dev', 'API Engineer', 'Database Admin'] },
      middle: { salary: '$1,500 — $3,000', period: '1 - 3 yil', demand: 'Maksimal', roles: ['Middle Node.js Engineer', 'Backend System Architect', 'DevOps Specialist'] },
      senior: { salary: '$3,500 — $7,000+', period: '3+ yil', demand: 'Global / Remote', roles: ['Lead Solutions Architect', 'Principal Engineer', 'CTO'] },
    },
    cybersec: {
      junior: { salary: '$700 — $1,200', period: '0 - 1 yil', demand: 'Kritik Yuqori', roles: ['Junior Security Analyst', 'SOC Analyst', 'Junior Pentester'] },
      middle: { salary: '$1,800 — $3,500', period: '1 - 3 yil', demand: 'Strategik', roles: ['Penetration Tester', 'Web Security Engineer', 'Security Consultant'] },
      senior: { salary: '$4,000 — $8,500+', period: '3+ yil', demand: 'Global / Enterprise', roles: ['Chief Information Security Officer (CISO)', 'Lead Security Architect'] },
    },
  };

  const current = salaryData[course]?.[level] || salaryData.frontend.junior;

  return (
    <section id="kalkulyator" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300">
            <span>Kalkulyator</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            IT sohasida <span className="text-neutral-400 font-normal">daromadingizni hisoblang.</span>
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 font-normal">
            Yo'nalish va tajriba darajangizni tanlang hamda kutilayotgan oylik daromadni ko'ring.
          </p>
        </div>

        {/* Interactive Calculator Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-neutral-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">
                1. IT Yo'nalishini Tanlang:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'frontend', label: 'Frontend' },
                  { id: 'backend', label: 'Backend' },
                  { id: 'cybersec', label: 'CyberSec' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCourse(c.id)}
                    className={`py-2.5 rounded-full text-xs font-medium transition-all ${
                      course === c.id
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-2">
                2. Tajriba Darajasi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'junior', label: 'Junior' },
                  { id: 'middle', label: 'Middle' },
                  { id: 'senior', label: 'Senior' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`py-2.5 rounded-full text-xs font-medium transition-all ${
                      level === l.id
                        ? 'bg-white text-black font-semibold shadow-md'
                        : 'bg-white/5 text-neutral-400 border border-white/10 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-neutral-400 space-y-2">
              <div className="flex justify-between">
                <span>Bozor Talabi:</span>
                <span className="font-semibold text-emerald-400">{current.demand}</span>
              </div>
              <div className="flex justify-between">
                <span>Tajriba Muddati:</span>
                <span className="font-semibold text-white">{current.period}</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 p-8 rounded-3xl bg-black/60 border border-white/10 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-medium text-neutral-400">Taxminiy Oylik Daromad</span>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                {current.salary}
              </div>
              <span className="text-[11px] text-neutral-500">/oyiga (AQSH Dollarida)</span>
            </div>

            <div className="space-y-2 text-left pt-2 border-t border-white/10">
              <span className="text-[11px] font-medium text-neutral-400">Lavozimlar:</span>
              <div className="flex flex-wrap gap-1.5">
                {current.roles.map((role, i) => (
                  <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-300">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/#ariza"
              className="w-full inline-flex items-center justify-center py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              <span>O'qishni boshlash</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
