import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { ProjectShowcase } from '@/components/landing/ProjectShowcase';
import { BeforeAfter } from '@/components/landing/BeforeAfter';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'O\'quvchilar Natijalari — InFast IT-Academy',
  description: 'InFast IT-Academy o\'quvchilarining real loyihalari va erishgan natijalari.',
};

export default function NatijalarPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white">
            Natija — <span className="text-infast-500">eng yaxshi isbot.</span>
          </h1>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            O'quvchilarimiz tomonidan tayyorlangan real biznes loyihalari va amaliy ishlar.
          </p>
        </div>

        <ProjectShowcase />

        <BeforeAfter />

        <LeadForm />
      </main>

      <FloatingContact />
      <Footer />
    </div>
  );
}
