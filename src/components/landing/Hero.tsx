'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Code2, Terminal, Shield, Sparkles, CheckCircle, Play, Cpu, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden bg-slate-950 text-white">
      {/* Background Lighting System */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-infast-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[130px] pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline & Action */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            {/* Top Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center space-x-2 bg-slate-900/80 border border-infast-500/30 px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-infast-500/10"
            >
              <Sparkles className="w-4 h-4 text-infast-500" />
              <span className="text-xs font-bold text-slate-200">
                2026-yilgi amaliy loyihaviy IT ta'lim standarti
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
            >
              IT kelajagingizni <br />
              <span className="bg-gradient-to-r from-white via-slate-100 to-infast-400 bg-clip-text text-transparent">
                bugundan boshlang.
              </span>
            </motion.h1>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed"
            >
              Zamonaviy IT kasblarini amaliy loyihalar orqali o‘rganing va real loyihalar yaratish darajasiga chiqing. Nazariyadan ko'ra ko'proq amaliyot.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
            >
              <Link
                href="/ariza"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-infast-600 via-infast-500 to-amber-500 shadow-xl shadow-infast-500/30 hover:shadow-infast-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Bepul konsultatsiya</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>

              <Link
                href="/kurslar"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-2xl text-base font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <span>Kurslarni ko‘rish</span>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs font-semibold text-slate-400"
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-infast-500" />
                <span>Amaliy ta'lim</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-infast-500" />
                <span>Real loyihalar</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-infast-500" />
                <span>Zamonaviy texnologiyalar</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Sophisticated Tech Interface Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 relative"
          >
            {/* Terminal Mockup Window */}
            <div className="relative rounded-3xl bg-slate-900/90 border border-slate-800 p-5 shadow-2xl shadow-infast-500/10 backdrop-blur-xl overflow-hidden space-y-4">
              {/* Window Header Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-slate-500">infast-academy-workspace.ts</span>
                <Terminal className="w-4 h-4 text-slate-500" />
              </div>

              {/* Code Editor Body */}
              <div className="font-mono text-xs space-y-2 text-slate-300">
                <div className="text-slate-500">// Welcome to InFast Development Environment</div>
                <div>
                  <span className="text-infast-400 font-bold">import</span> &#123; DeveloperMindset, RealProject &#125; <span className="text-infast-400">from</span> <span className="text-emerald-400">'@infast/academy'</span>;
                </div>
                <div className="pt-2">
                  <span className="text-purple-400 font-bold">const</span> <span className="text-blue-300">studentJourney</span> = <span className="text-infast-400 font-bold">async</span> () =&#gt; &#123;
                </div>
                <div className="pl-4">
                  <span className="text-purple-400 font-bold">await</span> student.<span className="text-yellow-300">buildProject</span>(&#123;
                </div>
                <div className="pl-8 text-slate-400">
                  stack: [<span className="text-emerald-400">'React'</span>, <span className="text-emerald-400">'Next.js'</span>, <span className="text-emerald-400">'Node.js'</span>, <span className="text-emerald-400">'CyberSecurity'</span>],
                </div>
                <div className="pl-8 text-slate-400">
                  mode: <span className="text-emerald-400">'Practical_Coding_100%'</span>
                </div>
                <div className="pl-4">&#125;);</div>
                <div>&#125;;</div>
              </div>

              {/* Dynamic Status Card Badge */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Project Deployment</span>
                </div>
                <span className="text-[10px] font-mono text-infast-400 bg-infast-500/10 px-2 py-0.5 rounded border border-infast-500/20">
                  Status: 200 OK
                </span>
              </div>
            </div>

            {/* Floating Glass Badges */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 hidden sm:flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-xl bg-infast-500/20 text-infast-400 flex items-center justify-center font-bold">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Full-Stack Development</p>
                <p className="text-[10px] text-slate-400">React + Node + Mongo</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 hidden sm:flex items-center space-x-3 p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-2xl backdrop-blur-xl"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Cyber Security</p>
                <p className="text-[10px] text-slate-400">Pentest & Web Security</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
