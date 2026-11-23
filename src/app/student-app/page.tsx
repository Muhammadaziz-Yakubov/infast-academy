'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  Coins,
  BookOpen,
  ArrowRight,
  QrCode,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Layers,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentAppDownloadPage() {
  const [downloadStarted, setDownloadStarted] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const handleDownloadClick = () => {
    setDownloadStarted(true);
    // Trigger download
    const link = document.createElement('a');
    link.href = '/api/download/student-app';
    link.setAttribute('download', 'student-1.0.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const faqs = [
    {
      q: "Ilova bepulmi?",
      a: "Ha, InFast Student mobil ilovasi barcha InFast IT-Academy o'quvchilari uchun mutlaqo bepul taqdim etiladi.",
    },
    {
      q: "Ilovaga kirish uchun login va parol qayerdan olinadi?",
      a: "Akademiyada ro'yxatdan o'tganingizda sizga shaxsiy Talaba ID kodi va paroli beriladi. Agar parolingizni unutgan bo'lsangiz, ma'muringizga murojaat qiling.",
    },
    {
      q: "iPhone (iOS) uchun ham chiqadimi?",
      a: "Hozirda ilovaning rasmiy Android (.APK) versiyasi ishga tushirildi. iOS (App Store) versiyasi tez kunda taqdim etiladi.",
    },
    {
      q: "O'rnatishda xavfsizlik ogohlantirishi chiqsa nima qilish kerak?",
      a: "Ilova Google Play'dan tashqari to'g'ridan-to'g'ri rasmiy serverimizdan yuklanayotgani sababli Android 'Noma'lum manbalar' ogohlantirishini ko'rsatishi mumkin. 'Sozlamalar'ga kirib, ushbu manbaga bir martalik ruxsat bering.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-amber-500/15 via-infast-600/10 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[180px] pointer-events-none" />

      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-black/70 border-b border-white/[0.08]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <img
                src="/logo-icon.png"
                alt="InFast Logo"
                className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(255,42,133,0.4)]"
              />
            </div>
            <span className="font-extrabold text-sm tracking-tight text-white">
              InFast <span className="text-neutral-400 font-medium text-xs ml-1">IT Academy</span>
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors hidden sm:inline-block px-3 py-1.5"
            >
              Bosh sahifa
            </Link>
            <Link
              href="/#kurslar"
              className="text-xs font-semibold text-neutral-400 hover:text-white transition-colors hidden sm:inline-block px-3 py-1.5"
            >
              Kurslar
            </Link>

            <button
              onClick={handleDownloadClick}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-md flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>APK Yuklab Olish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-12 sm:pt-20 pb-16 px-4 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Release Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.1] text-xs font-medium backdrop-blur-md"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-neutral-300">Rasmiy Reliz: InFast Student v1.0.0</span>
            <span className="text-neutral-500">•</span>
            <span className="text-amber-400 font-semibold">Android uchun</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] max-w-4xl mx-auto"
          >
            O'qishni yangi darajaga olib chiqing.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
              Shaxsiy Mobil Ilovangiz.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed"
          >
            Darslar nazariyasi, 9-talik interaktiv testlar, XP & XCoin gamifikatsiyasi hamda shaxsiy o'quv xaritangiz — barchasi bitta qulay ilovada.
          </motion.p>

          {/* Download CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto"
          >
            <button
              onClick={handleDownloadClick}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] text-white font-black text-sm shadow-xl shadow-[#FF2A85]/25 hover:shadow-[#FF2A85]/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center space-x-2.5 group"
            >
              <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
              <span>Android (.APK) Yuklab Olish</span>
            </button>

            <a
              href="#qollanma"
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white font-semibold text-xs transition-all flex items-center justify-center space-x-2"
            >
              <span>O'rnatish qo'llanmasi</span>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </a>
          </motion.div>

          {/* Download Started Feedback Notice */}
          <AnimatePresence>
            {downloadStarted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold max-w-md mx-auto flex items-center space-x-2.5 text-left"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                <div>
                  <div className="font-bold">Yuklab olish boshlandi!</div>
                  <div className="text-[11px] text-emerald-300/80 mt-0.5">
                    Fayl yuklangach, uni ochib o'rnatishni boshlashingiz mumkin.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tech Specs Micro-Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-neutral-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Rasmiy & Xavfsiz
            </span>
            <span>•</span>
            <span>Fayl: student-1.0.apk</span>
            <span>•</span>
            <span>Hajmi: ~32 MB</span>
            <span>•</span>
            <span>Talab: Android 7.0+</span>
          </div>
        </div>
      </section>

      {/* Visual Phone Mockup Showcase */}
      <section className="py-12 px-4 sm:px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="relative mx-auto max-w-xs sm:max-w-sm rounded-[44px] p-3 sm:p-4 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-4 border-neutral-700 shadow-2xl shadow-amber-500/10">
            {/* Phone Speaker & Notch */}
            <div className="w-24 h-4 bg-neutral-900 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-neutral-800" />
            </div>

            {/* Screen Content Preview */}
            <div className="rounded-[32px] bg-[#0c0c10] border border-white/10 p-4 sm:p-5 text-white space-y-4 overflow-hidden relative">
              {/* Top Profile Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-infast-600 to-amber-500 text-white font-black text-xs flex items-center justify-center shadow-md">
                    IA
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Ali Valiyev</div>
                    <div className="text-[10px] text-neutral-400">Frontend #14 Guruhi</div>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-[10px] font-extrabold text-amber-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Daraja 3</span>
                </div>
              </div>

              {/* Balance Cards */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="text-[10px] font-bold text-neutral-400 flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-amber-400" /> XP Ballari
                  </div>
                  <div className="text-sm font-black text-amber-400 mt-0.5">1,450 XP</div>
                </div>

                <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <div className="text-[10px] font-bold text-neutral-400 flex items-center justify-center gap-1">
                    <Coins className="w-3 h-3 text-orange-400" /> XCoin
                  </div>
                  <div className="text-sm font-black text-orange-400 mt-0.5">380 🪙</div>
                </div>
              </div>

              {/* Lesson Map Preview */}
              <div className="space-y-2">
                <div className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Darslar Xaritasi</span>
                  <span className="text-emerald-400 font-bold">Faol</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white text-[11px]">1-dars: HTML Asoslari</div>
                        <div className="text-[9px] text-neutral-400">9/9 test topshirildi</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Tugatildi</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-bold text-white text-[11px]">2-dars: CSS Flexbox & Grid</div>
                        <div className="text-[9px] text-amber-300">Joriy darsingiz</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-extrabold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">Davom etish</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between opacity-60">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full bg-neutral-800 text-neutral-400 flex items-center justify-center text-[10px] font-bold">
                        3
                      </div>
                      <div className="font-semibold text-neutral-400 text-[11px]">3-dars: JavaScript Asoslari</div>
                    </div>
                    <span className="text-[9px] text-neutral-500">Qulflangan</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Bar Mockup */}
              <div className="pt-2 flex items-center justify-around border-t border-white/[0.08] text-[9px] font-bold text-neutral-400">
                <span className="text-amber-400">📚 Darslar</span>
                <span>🏆 Reyting</span>
                <span>🎁 Do'kon</span>
                <span>👤 Profil</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Apple Bento Grid Feature Highlights */}
      <section className="py-16 px-4 sm:px-6 relative z-10 border-t border-white/[0.08]">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ilovada nimalar mavjud?
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto">
              InFast Student ilovasi shunchaki darslik emas — bu sizning kundalik IT rivojlanish markazingiz.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">Nazariya & Darslar</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Har bir mavzuni o'zbek tilida aniq, ravon va amaliy misollar bilan o'rganing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">9-talik Qat'iy Test</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Har bir darsda 9 ta savol (&ge;8/9 me'yor). Keyingi dars faqat chuqur bilim bilan ochiladi.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">XP & XCoin Mukofotlar</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Muvaffaqiyatli topshirilgan har bir vazifa uchun ballar to'plang va sovg'alar do'konida almashtiring.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-white">Reyting & Leaderboard</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Akademiya talabalari o'rtasida o'z natijalaringizni solishtiring va eng yuqori pog'onaga ko'tariling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Steps Installation Guide */}
      <section id="qollanma" className="py-16 px-4 sm:px-6 relative z-10 border-t border-white/[0.08]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
              Oddiy va tezkor
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              3 Qadamda O'rnatish Qo'llanmasi
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto">
              Ilovani telefoningizga o'rnatish uchun quyidagi oddiy ketma-ketlikni bajaring:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">01</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-white">APK Faylini Yuklang</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                "Android (.APK) Yuklab Olish" tugmasini bosing va fayl yuklanishini kuting (~32 MB).
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">02</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-white">O'rnatishga Ruxsat Bering</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Faylni oching. Agar telefon ruxsat so'rasa, "Sozlamalar" &rarr; "Ushbu manbaga ruxsat berish"ni yoqing.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-900/60 border border-white/[0.08] space-y-3 relative overflow-hidden">
              <span className="text-4xl font-black text-amber-500/20 absolute top-4 right-4">03</span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black font-extrabold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-white">Tizimga Kiring</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Ilovani oching, o'zingizning Talaba ID kodingiz hamda parolingizni kiritib darslarni boshlang!
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={handleDownloadClick}
              className="px-8 py-3.5 rounded-2xl bg-white text-black font-extrabold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-lg inline-flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Hozir yuklab olish</span>
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-16 px-4 sm:px-6 relative z-10 border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Ko'p beriladigan savollar
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = activeFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl bg-neutral-900/60 border border-white/[0.08] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ml-2 ${
                        isOpen ? 'transform rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-white/[0.04] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 border-t border-white/[0.08] text-center text-xs text-neutral-500 space-y-2">
        <p>&copy; {new Date().getFullYear()} InFast IT-Academy. Barcha huquqlar himoyalangan.</p>
        <p className="text-[11px] text-neutral-600">
          Android, Google Play va boshqa savdo belgilari tegishli egalarining mulkidir.
        </p>
      </footer>
    </div>
  );
}
