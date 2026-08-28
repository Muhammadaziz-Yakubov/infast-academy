import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Courses } from '@/components/landing/Courses';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'IT Kurslari — InFast IT-Academy',
  description: 'Frontend, Backend va Cyber Security yo‘nalishlarida amaliy va intensiv IT kurslari.',
};

export default function KurslarPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white">
            Barcha <span className="text-infast-500">IT Kurslarimiz</span>
          </h1>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Noldan professional darajagacha olib chiquvchi amaliy o'quv dasturlari.
          </p>
        </div>

        <Courses />

        <LeadForm />
      </main>

      <FloatingContact />
      <Footer />
    </div>
  );
}
