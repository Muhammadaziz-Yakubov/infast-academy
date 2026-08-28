'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Kurslar necha oy davom etadi?',
      a: 'Asosiy va chuqurlashtirilgan IT kurslarimiz (Frontend, Backend, Cyber Security) 6 oy davom etadi. Har bir oy aniq loyihaga yo‘naltirilgan.',
    },
    {
      q: 'Darslar qanday tartibda o‘tiladi?',
      a: 'Darslar haftada 3 kun 2 soatdan jonli interaktiv formatda o‘tiladi. Undan tashqari har kuni koworking va mentorlar bilan amaliy ish olib boriladi.',
    },
    {
      q: 'Kursga qatnashish uchun boshlang‘ich bilim kerakmi?',
      a: 'Yo‘q, kurslarimiz noldan boshlanadi. Kompyuterdan foydalana olish va xohish bo‘lsa yetarli, qolgan barcha ko‘nikmalarni noldan o‘rgatamiz.',
    },
    {
      q: 'Necha yoshdan o‘quvchilarni qabul qilasiz?',
      a: 'Akademiyamizga 14 yoshdan yuqori bo‘lgan barcha qiziquvchilar va dasturchi bo‘lishni maqsad qilganlar qabul qilinadi.',
    },
    {
      q: 'Kursni tamomlagach sertifikat beriladimi?',
      a: 'Ha, kurs yakunida real loyihalarni muvaffaqiyatli topshirgan va imtihondan o‘tgan o‘quvchilarga INFAST IT-Academy sertifikati taqdim etiladi.',
    },
    {
      q: 'Darsni qoldirib yuborsam nima bo‘ladi?',
      a: 'Barcha darslar tizimga yozib olinadi hamda o‘quvchining shaxsiy kabinetida saqlanadi. Istalgan vaqtda qayta ko‘rib chiqishingiz mumkin.',
    },
    {
      q: 'Bepul sinov darsi yoki konsultatsiya bormi?',
      a: 'Ha! Siz ariza qoldirib, akademiyamizga tashrif buyurishingiz va bepul konsultatsiya hamda 1-sinov darsida qatnashishingiz mumkin.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-slate-950 text-white relative border-t border-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KO‘P BERILADIGAN SAVOLLAR</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Tez-tez beriladigan <span className="text-infast-500">savollar.</span>
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between font-bold text-base sm:text-lg text-slate-100 hover:text-infast-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180 text-infast-500' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="px-6 pb-6 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 pt-4"
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
