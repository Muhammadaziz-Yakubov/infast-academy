'use client';

import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Kurslar necha oy davom etadi?',
      a: 'Asosiy va chuqurlashtirilgan IT kurslarimiz yo\'nalishga qarab 6 oydan 11 oygacha davom etadi. Har bir oy aniq amaliy loyihaga yo‘naltirilgan bo\'lib, o\'quvchi o\'z portfoliosini shakllantirib boradi.',
    },
    {
      q: 'Darslar qanday tartibda o‘tiladi?',
      a: 'Darslar haftada 3 kun 2 soatdan jonli interaktiv formatda o‘tiladi. Undan tashqari har kuni koworking, mentorlar yordami va shaxsiy mobil ilovadagi testlar bilan bilimlar mustahkamlanadi.',
    },
    {
      q: 'Kursga qatnashish uchun boshlang‘ich bilim kerakmi?',
      a: 'Yo‘q, kurslarimiz noldan boshlanadi. Kompyuterdan foydalana olish va qat\'iy intilish bo‘lsa yetarli, qolgan barcha ko‘nikmalarni noldan professional darajagacha o‘rgatamiz.',
    },
    {
      q: 'Necha yoshdan o‘quvchilarni qabul qilasiz?',
      a: 'Akademiyamizga 14 yoshdan yuqori bo‘lgan barcha qiziquvchilar va professional dasturchi bo‘lishni maqsad qilganlar qabul qilinadi.',
    },
    {
      q: 'Kursni tamomlagach sertifikat beriladimi?',
      a: 'Ha, kurs yakunida real loyihalarni muvaffaqiyatli topshirgan va imtihondan o‘tgan o‘quvchilarga INFAST IT-Academy rasmiy sertifikati hamda portfolio taqdim etiladi.',
    },
    {
      q: 'Darsni qoldirib yuborsam nima bo‘ladi?',
      a: 'Barcha darslar materiallari, nazariya va testlar shaxsiy InFast Student mobil ilovasida doimo saqlanib turadi. Istalgan vaqtda qayta ko‘rib chiqishingiz mumkin.',
    },
    {
      q: 'Bepul sinov darsi yoki konsultatsiya bormi?',
      a: 'Ha! Siz ariza qoldirib, akademiyamizga tashrif buyurishingiz va bepul konsultatsiya hamda birinchi sinov darsida to\'liq bepul qatnashishingiz mumkin.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#050508] text-white relative overflow-hidden font-sans">
      {/* GTA VI Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-to-r from-[#FF2A85]/10 via-[#FF7A00]/8 to-[#00F0FF]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 via-[#FF7A00]/15 to-[#00F0FF]/15 border border-[#FF2A85]/30 px-4 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,133,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span className="uppercase tracking-widest text-[11px]">Ko'p Beriladigan Savollar</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
            Savollaringizga{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
              aniq javoblar.
            </span>
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-[28px] bg-neutral-900/50 border border-white/10 backdrop-blur-2xl overflow-hidden transition-all shadow-xl hover:border-white/20"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-sm sm:text-base text-white hover:text-[#00F0FF] transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-[#FF2A85]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-white/10 pt-4"
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
