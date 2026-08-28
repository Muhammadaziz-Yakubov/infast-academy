'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Terminal, Shield, Sparkles, CheckCircle2, Play, Cpu, Layers, Flame, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'cyber'>('frontend');

  const codeSnippets = {
    frontend: `import { NextAcademy, ReactState } from '@infast/core';

export default function StudentApp() {
  const [skills, setSkills] = ReactState(['React', 'Next.js 14']);
  return <FullStackAcademy project="Production CRM" status="DEPLOYED" />;
}`,
    backend: `import { Express, MongoSchema } from 'express-next';

const StudentBackend = new Express.Router();
StudentBackend.post('/checkout', async (req, res) => {
  const payment = await MongoSchema.createPayment(req.body);
  return res.json({ status: 200, success: true, paymentId: payment._id });
});`,
    cyber: `$ nmap -sV -sC target.infast.uz
[+] PORT 443/TCP OPEN SSL/HTTPS
[+] OWASP Top 10 Security Audit: PASSED
[+] Penetration Testing Status: SYSTEM HARDENED & PROTECTED`,
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-36 overflow-hidden bg-[#050508] text-white">
      {/* Laser Light Leaks & Radial Ambient Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-infast-500/20 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-orange-600/15 rounded-full blur-[160px] pointer-events-none" />

      {/* Cyber Grid Pattern Backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Live Status Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-3 bg-slate-900/90 border border-infast-500/40 px-4 py-2 rounded-full backdrop-blur-2xl shadow-[0_0_25px_rgba(249,115,22,0.2)]"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-infast-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-infast-500"></span>
              </span>
              <span className="text-xs font-bold tracking-wide text-slate-200 uppercase">
                INFAST ACADEMY 2026 — REAL PROYEKT TA'LIMI
              </span>
            </motion.div>

            {/* Giant Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05]"
            >
              IT kelajagingizni <br />
              <span className="bg-gradient-to-r from-white via-slate-100 via-amber-200 to-infast-400 bg-clip-text text-transparent drop-shadow-sm">
                bugundan boshlang.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Zamonaviy IT kasblarini real loyihalar va amaliy kod yozish orqali o‘rganing. Quruq nazariyadan holi, 100% ishlab chiqarish darajasi.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
            >
              <Link
                href="/ariza"
                className="w-full sm:w-auto inline-flex items-center justify-center px-9 py-4.5 rounded-2xl text-base font-extrabold text-white bg-gradient-to-r from-infast-600 via-infast-500 to-amber-500 shadow-[0_0_35px_rgba(249,115,22,0.4)] hover:shadow-[0_0_50px_rgba(249,115,22,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Bepul konsultatsiya olish</span>
                <ArrowRight className="w-5 h-5 ml-2.5" />
              </Link>

              <Link
                href="/kurslar"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4.5 rounded-2xl text-base font-bold text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-all backdrop-blur-xl"
              >
                <span>Kurslarni ko‘rish</span>
              </Link>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-bold text-slate-300"
            >
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-infast-400" />
                <span>95% Amaliy ta'lim</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-infast-400" />
                <span>Real CRM & Web Loyihalar</span>
              </div>
              <div className="flex items-center space-x-2 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-infast-400" />
                <span>Portfolio & Sertifikat</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Dynamic Interactive Code Sandbox IDE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl bg-slate-950/95 border border-slate-800/90 p-5 shadow-[0_0_50px_rgba(249,115,22,0.15)] backdrop-blur-2xl overflow-hidden space-y-4">
              
              {/* macOS Window Title Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                
                {/* Interactive Language Tabs */}
                <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  {(['frontend', 'backend', 'cyber'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        activeTab === tab
                          ? 'bg-infast-500 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <Terminal className="w-4 h-4 text-slate-400" />
              </div>

              {/* Live Code Box */}
              <div className="font-mono text-xs text-slate-200 bg-slate-900/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 overflow-x-auto min-h-[160px]">
                <div className="text-slate-500">// InFast Live Code Sandbox</div>
                <pre className="text-infast-300 font-semibold leading-relaxed whitespace-pre-wrap">
                  {codeSnippets[activeTab]}
                </pre>
              </div>

              {/* Generated Real Dashboard Preview Image Integration */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 group">
                <img
                  src="/hero-dashboard.jpg"
                  alt="InFast IDE Dashboard Workspace"
                  className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-3">
                  <div className="flex items-center justify-between w-full text-xs font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-infast-400" />
                      Live Workspace Preview
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Production Ready
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
