import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Qabulga Yozilish & Konsultatsiya — InFast IT-Academy',
  description: 'InFast IT-Academy bepul sinov darsi hamda IT konsultatsiyasiga ariza topshirish.',
};

export default function ArizaPage() {
  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] font-sans">
      <Navbar />

      <main className="pt-24">
        <LeadForm />
      </main>

      <FloatingContact />
      <Footer />
    </div>
  );
}
