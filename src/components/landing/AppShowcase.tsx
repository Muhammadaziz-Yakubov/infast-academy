'use client';

import React from 'react';
import Link from 'next/link';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Zap,
  Award,
  Coins,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function AppShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-[36px] sm:rounded-[44px] p-8 sm:p-12 lg:p-16 bg-gradient-to-br from-neutral-900/90 via-black to-[#090714] border border-white/10 shadow-2xl overflow-hidden">
          {/* GTA VI Ambient Lighting */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#FF2A85]/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#00F0FF]/15 rounded-full blur-[140px] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF2A85]/15 via-[#FF7A00]/15 to-[#00F0FF]/15 border border-[#FF2A85]/30 text-white text-xs font-bold shadow-[0_0_20px_rgba(255,42,133,0.2)]">
                <Smartphone className="w-3.5 h-3.5 text-[#FF2A85]" />
                <span className="uppercase tracking-widest text-[11px]">InFast Student App • v1.0.0</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15]">
                Darslar, testlar va XP ballar endi{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
                  cho'ntagingizda.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-neutral-400 max-w-xl leading-relaxed">
                Talabalarimiz uchun maxsus ishlab chiqilgan mobil ilova orqali darslar nazariyasini o'qing, 9 savolli testlarni topshiring, XP va XCoin yig'ib sovrinlar yuting!
              </p>

              {/* Bullet Features */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-neutral-300 font-medium">
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span>3x3 = 9 talik qat'iy test sinovi</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF7A00] shrink-0" />
                  <span>XP va XCoin gamifikatsiyasi</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#FF2A85] shrink-0" />
                  <span>Shaxsiy o'quv xaritasi & progress</span>
                </div>
                <div className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Akademiya o'quvchilar reytingi</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Link
                  href="/student-app"
                  className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#FF2A85]/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Android (.APK) Yuklab Olish</span>
                </Link>

                <Link
                  href="/student-app"
                  className="px-5 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-white font-semibold text-xs sm:text-sm transition-all flex items-center space-x-1.5"
                >
                  <span>Batafsil ma'lumot</span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                </Link>
              </div>

              <div className="flex items-center space-x-4 text-[11px] text-neutral-500 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Rasmiy
                </span>
                <span>•</span>
                <span>Hajmi: ~32 MB</span>
                <span>•</span>
                <span>Android 7.0+</span>
              </div>
            </div>

            {/* Right Phone Visual Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[280px] rounded-[38px] p-3 bg-gradient-to-b from-neutral-800 to-black border-2 border-[#FF2A85]/30 shadow-2xl shadow-[#FF2A85]/20">
                <div className="w-20 h-3 bg-neutral-900 rounded-full mx-auto mb-2" />

                <div className="rounded-[28px] bg-[#0c0c12] border border-white/10 p-3.5 text-white space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center">
                        <img
                          src="/logo-icon.png"
                          alt="Logo"
                          className="w-8 h-8 object-contain drop-shadow-[0_0_6px_rgba(255,42,133,0.5)]"
                        />
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-white">Ali Valiyev</div>
                        <div className="text-[9px] text-neutral-400">Frontend Dasturlash</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[9px] font-black">
                      Lv. 3
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-center">
                    <div className="p-2 rounded-lg bg-white/[0.04]">
                      <div className="text-[9px] text-neutral-400">XP Ballar</div>
                      <div className="text-xs font-black text-amber-400">1,450 XP</div>
                    </div>
                    <div className="p-2 rounded-lg bg-white/[0.04]">
                      <div className="text-[9px] text-neutral-400">XCoin</div>
                      <div className="text-xs font-black text-orange-400">380 🪙</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-white">2-dars: CSS Flexbox</span>
                      <span className="text-amber-400 font-bold">Faol</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-black/40 overflow-hidden">
                      <div className="w-2/3 h-full bg-amber-500 rounded-full" />
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-emerald-950/30 border border-emerald-500/25 flex items-center justify-between text-[10px]">
                    <span className="text-emerald-300 font-medium">9/9 Test topshirildi</span>
                    <span className="text-emerald-400 font-black">+50 XP</span>
                  </div>
                </div>

                {/* Floating Badge */}
                <div className="absolute -bottom-4 -left-4 p-2.5 rounded-2xl bg-black/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black text-xs">
                    ⚡
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-bold text-white">student-1.0.apk</div>
                    <div className="text-[9px] text-neutral-400">O'rnatishga tayyor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
