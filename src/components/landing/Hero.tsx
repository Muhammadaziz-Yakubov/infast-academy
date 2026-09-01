'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  const [activeTab, setActiveTab] = useState<'frontend' | 'backend' | 'cyber'>('frontend');

  const codeSnippets = {
    frontend: `import { React, Next } from '@infast/academy';

export default function StudentApp() {
  return (
    <AcademyProject
      course="Frontend React & Next.js"
      portfolio="Real Production CRM"
      status="DEPLOYED 🚀"
    />
  );
}`,
    backend: `import { Router, Database } from '@infast/backend';

const api = new Router();
api.post('/checkout', async (req, res) => {
  const transaction = await Database.processPayment(req.body);
  return res.json({ status: 200, success: true });
});`,
    cyber: `$ nmap -sV -sC target.infast.uz
[+] PORT 443/TCP OPEN SSL/HTTPS
[+] OWASP Top 10 Security Audit: PASSED
[+] Penetration Testing Status: PROTECTED`,
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-black text-white">
      {/* Subtle Ambient Apple Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[450px] bg-white/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
            {/* Live Status Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-xl"
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-medium tracking-wide text-neutral-300">
                InFast Academy — Amaliy IT Ta'limi
              </span>
            </motion.div>

            {/* Giant Apple Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08]"
            >
              IT kelajagingizni <br />
              <span className="text-neutral-400 font-normal">
                bugundan boshlang.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-neutral-400 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Zamonaviy IT kasblarini real amaliy loyihalar yozish orqali o‘rganing. Quruq nazariyadan xoli, 100% amaliyot va portfolio.
            </motion.p>

            {/* Apple Pill CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2"
            >
              <Link
                href="/#ariza"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full text-xs font-semibold text-black bg-white hover:bg-neutral-200 active:scale-95 transition-all shadow-xl shadow-white/10"
              >
                <span>Bepul konsultatsiya olish</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>

              <Link
                href="/#kurslar"
                className="w-full sm:w-auto inline-flex items-center justify-center px-7 py-3.5 rounded-full text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/15 active:scale-95 transition-all backdrop-blur-xl"
              >
                <span>Kurslarni ko‘rish</span>
              </Link>
            </motion.div>

            {/* Trust Points */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs font-normal text-neutral-400"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>95% Amaliyot</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Real CRM & Web Proyektlar</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Shaxsiy Portfolio</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: macOS Window Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl bg-neutral-900/40 border border-white/10 p-5 backdrop-blur-2xl shadow-2xl space-y-4">
              
              {/* macOS Window Controls Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-neutral-700" />
                  <div className="w-3 h-3 rounded-full bg-neutral-700" />
                  <div className="w-3 h-3 rounded-full bg-neutral-700" />
                </div>
                
                {/* Language Tabs */}
                <div className="flex items-center space-x-1 bg-black/50 p-1 rounded-full border border-white/10">
                  {(['frontend', 'backend', 'cyber'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase transition-all ${
                        activeTab === tab
                          ? 'bg-white text-black font-semibold'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <Terminal className="w-4 h-4 text-neutral-500" />
              </div>

              {/* Code Box */}
              <div className="font-mono text-xs text-neutral-200 bg-black/60 p-4 rounded-2xl border border-white/10 space-y-2 overflow-x-auto min-h-[160px]">
                <div className="text-neutral-500">// InFast Live Code Sandbox</div>
                <pre className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                  {codeSnippets[activeTab]}
                </pre>
              </div>

              {/* Live Workspace Badge */}
              <div className="flex items-center justify-between pt-1 text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  Live Developer Workspace
                </span>
                <span className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-neutral-300">
                  Production Ready
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
