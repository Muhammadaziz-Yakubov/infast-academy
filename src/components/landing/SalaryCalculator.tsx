'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, Briefcase, Award, ArrowRight, Sparkles } from 'lucide-react';
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
    <section className="py-24 bg-slate-950 text-white relative overflow-hidden border-t border-slate-900">
      {/* Background Neon Lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-infast-500/10 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <Sparkles className="w-4 h-4 text-infast-500 animate-pulse" />
            <span>INTERAKTIV KALKULYATOR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            IT sohasida <span className="bg-gradient-to-r from-infast-400 via-amber-400 to-white bg-clip-text text-transparent">daromadingizni hisoblang.</span>
          </h2>
          <p className="text-base text-slate-400">
            Yo'nalish va tajriba darajangizni tanlang hamda kutilayotgan oylik daromad va imkoniyatlarni ko'ring.
          </p>
        </div>

        {/* Interactive Calculator Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-2xl shadow-2xl shadow-infast-500/10 max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
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
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      course === c.id
                        ? 'bg-infast-500 text-white border-infast-400 shadow-lg shadow-infast-500/30'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                2. Tajriba Darajasi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'junior', label: 'Junior (0-1 y)' },
                  { id: 'middle', label: 'Middle (1-3 y)' },
                  { id: 'senior', label: 'Senior (3+ y)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                      level === l.id
                        ? 'bg-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/30'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Bozor Talabi:</span>
                <span className="font-bold text-emerald-400">{current.demand}</span>
              </div>
              <div className="flex justify-between">
                <span>Tajriba Muddati:</span>
                <span className="font-bold text-white">{current.period}</span>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-infast-500/40 text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Taxminiy Oylik Maosh</span>
              <div className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-infast-400 via-amber-300 to-white">
                {current.salary}
              </div>
              <span className="text-[11px] text-slate-500">/oyiga (AQSH Dollarida)</span>
            </div>

            <div className="space-y-2 text-left pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Mumkin bo'lgan lavozimlar:</span>
              <div className="flex flex-wrap gap-1.5">
                {current.roles.map((role, i) => (
                  <span key={i} className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-infast-500/10 border border-infast-500/20 text-infast-300">
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/ariza"
              className="w-full inline-flex items-center justify-center py-3.5 rounded-xl bg-gradient-to-r from-infast-600 to-amber-500 text-white font-bold text-xs shadow-lg shadow-infast-500/30 hover:scale-[1.02] transition-transform"
            >
              <span>Ushbu darajaga erishishni boshlash</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
