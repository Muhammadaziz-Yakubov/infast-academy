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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-4 py-2 rounded-full text-xs font-bold text-infast-400">
              <Code2 className="w-4 h-4" />
              <span>FRONTEND DEVELOPMENT KURSI</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              React & Next.js 14 orqali <br />
              <span className="text-infast-500">Frontend Dasturchi bo'ling.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              6 oy davomida zamonaviy interaktiv veb-saytlar va murakkab CRM platformalarni yaratishni real amaliy loyihalar ustida o'rganing.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">Davomiyligi: 6 Oy</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">Haftada: 3 Kun + Amaliyot</span>
              <span className="px-3 py-1.5 rounded-xl bg-infast-500/10 text-infast-400 border border-infast-500/20">Daraja: Noldan Pro-gacha</span>
            </div>
          </div>

          {/* Monthly Syllabus Modules */}
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">6 Oylik O'quv Dasturi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((m, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-infast-500/10 text-infast-400 border border-infast-500/20">
                      {m.month}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{m.title}</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {m.topics.map((t, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
