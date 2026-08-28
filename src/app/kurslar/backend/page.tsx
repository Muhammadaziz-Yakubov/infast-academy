import React from 'react';
import { Metadata } from 'next';
import { Server, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Backend Development Kursi — InFast IT-Academy',
  description: 'Node.js, Express, MongoDB, REST API va JWT autentifikatsiyasi orqali baquvvat server arxitekturasini noldan quring.',
};

export default function BackendCoursePage() {
  const modules = [
    { month: '1-OY', title: 'Node.js Core & Asynchronous JS', topics: ['Node.js Runtime & Event Loop', 'File System (fs) & Path Modules', 'Asynchronous Programming', 'npm & Package Management'] },
    { month: '2-OY', title: 'Express.js & REST API Design', topics: ['Express Routing & Middleware', 'RESTful API Standards & Status Codes', 'Request Validation & Sanitization', 'Error Handling Architecture'] },
    { month: '3-OY', title: 'MongoDB & Mongoose Database', topics: ['NoSQL Data Modeling', 'Mongoose Schemas & Validations', 'Indexes, Population & Queries', 'Aggregation Pipeline'] },
    { month: '4-OY', title: 'Security & Authentication', topics: ['JWT Session Management', 'Bcrypt Hashing & Passwords', 'CORS, Rate Limiting & Helmet', 'Role-Based Access Control (RBAC)'] },
    { month: '5-OY', title: 'TypeScript & Architecture', topics: ['TypeScript in Node.js', 'Clean Architecture & Controllers', 'Payment Integrations (Payme/Click)', 'Caching with Redis'] },
    { month: '6-OY', title: 'Deployment & Microservices', topics: ['Docker Basics & Containers', 'Server Deployment (Nginx/PM2)', 'CI/CD Pipeline Workflow', 'Real Production Backend API'] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full text-xs font-bold text-emerald-400">
              <Server className="w-4 h-4" />
              <span>BACKEND DEVELOPMENT KURSI</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              Node.js & MongoDB yordamida <br />
              <span className="text-emerald-400">Backend Dasturchi bo'ling.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Yuqori yuklamalarga chidamli serverlar, ma'lumotlar bazasi va to'lov tizimlarini noldan ishlab chiqishni o'rganing.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">Davomiyligi: 6 Oy</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">Haftada: 3 Kun + Amaliyot</span>
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Daraja: Noldan Pro-gacha</span>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">6 Oylik O'quv Dasturi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((m, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
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

        <LeadForm />
      </main>

      <FloatingContact />
      <Footer />
    </div>
  );
}
