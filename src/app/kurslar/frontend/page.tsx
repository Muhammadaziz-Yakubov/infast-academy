import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Code2, Layers, Zap } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Frontend Development Kursi — InFast IT-Academy',
  description: 'HTML, CSS, JavaScript, React.js va Next.js 14 yordamida zamonaviy interaktiv web ilovalar va CRM platformalar yaratishni o\'rganing.',
};

export default function FrontendCoursePage() {
  const modules = [
    { month: '1-OY', title: 'Web Asoslari & Layouting', topics: ['HTML5 Semantic tags', 'CSS3 Modern Layouts (Flexbox, Grid)', 'Responsive Mobile Design', 'Git & GitHub Workflow'] },
    { month: '2-OY', title: 'JavaScript ES6+ & DOM', topics: ['JavaScript Data Types & Functions', 'DOM Manipulation & Event Loop', 'Async JS (Promises, Async/Await)', 'Fetch API & JSON'] },
    { month: '3-OY', title: 'React.js Ecosystem', topics: ['React Components, Props & State', 'Hooks (useState, useEffect, useMemo)', 'TailwindCSS Styling System', 'React Router & Global State'] },
    { month: '4-OY', title: 'Next.js 14 App Router', topics: ['Server Components & Client Components', 'Server Actions & API Routes', 'Middleware & Authentication', 'SEO Optimization'] },
    { month: '5-OY', title: 'Database & Full-Stack Integration', topics: ['MongoDB & Mongoose ODM', 'Rest API Design & Integration', 'State Management (Zustand/Redux)', 'Full-Stack CRM Building'] },
    { month: '6-OY', title: 'Diploma Project & Career', topics: ['Real Production CRM Deployment', 'Portfolio Polish & Vercel Deploy', 'Technical Interview Prep', 'GitHub Portfolio Review'] },
  ];

  return (
    <div className="min-h-screen bg-[#050508] text-white font-sans relative overflow-hidden">
      {/* GTA VI / Apple ambient mesh */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#FF2A85]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-80 right-10 w-96 h-96 bg-[#00F0FF]/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      <main className="pt-32 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 to-[#00F0FF]/15 border border-white/10 px-4 py-2 rounded-full text-xs font-bold text-[#00F0FF] backdrop-blur-md">
              <Code2 className="w-4 h-4 text-[#FF2A85]" />
              <span className="tracking-wider uppercase">Frontend Development Kursi</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              React & Next.js 14 orqali <br />
              <span className="bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] bg-clip-text text-transparent">Frontend Dasturchi bo'ling.</span>
            </h1>
            <p className="text-base sm:text-lg text-neutral-400 leading-relaxed">
              6 oy davomida zamonaviy interaktiv veb-saytlar va murakkab CRM platformalarni yaratishni real amaliy loyihalar ustida o'rganing.
            </p>

            <div className="pt-2 flex flex-wrap gap-3 text-xs font-bold">
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-200">Davomiyligi: 6 Oy</span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-neutral-200">Haftada: 3 Kun + Amaliyot</span>
              <span className="px-3.5 py-1.5 rounded-full bg-[#00F0FF]/10 text-[#00F0FF] border border-[#00F0FF]/25">Daraja: Noldan Pro-gacha</span>
            </div>
          </div>

          {/* Monthly Syllabus Modules */}
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">6 Oylik O'quv Dasturi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((m, idx) => (
                <div key={idx} className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-4 shadow-xl hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-[#FF2A85]/10 text-[#FF2A85] border border-[#FF2A85]/20">
                      {m.month}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{m.title}</h3>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-neutral-300">
                    {m.topics.map((t, i) => (
                      <li key={i} className="flex items-center space-x-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Form */}
        <LeadForm />
      </main>

      <FloatingContact />
      <Footer />
    </div>
  );
}
