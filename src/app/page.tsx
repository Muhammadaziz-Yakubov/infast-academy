import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { TrustStats } from '@/components/landing/TrustStats';
import { WhyInFast } from '@/components/landing/WhyInFast';
import { SalaryCalculator } from '@/components/landing/SalaryCalculator';
import { Courses } from '@/components/landing/Courses';
import { ZeroToProject } from '@/components/landing/ZeroToProject';
import { ProjectShowcase } from '@/components/landing/ProjectShowcase';
import { BeforeAfter } from '@/components/landing/BeforeAfter';
import { LearningExperience } from '@/components/landing/LearningExperience';
import { Mentors } from '@/components/landing/Mentors';
import { InfastExperience } from '@/components/landing/InfastExperience';
import { Branches } from '@/components/landing/Branches';
import { FAQ } from '@/components/landing/FAQ';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'InFast IT-Academy — Toshkent va Urganchda Zamonaviy IT Kurslari',
  description: 'InFast IT-Academy — Toshkent hamda Urganchda Frontend, Backend va Cyber Security yo‘nalishlarida real amaliy loyihalar orqali IT mutaxassisi tayyorlovchi zamonaviy akademiya.',
  alternates: {
    canonical: 'https://infast.uz',
  },
  openGraph: {
    title: 'InFast IT-Academy — Zamonaviy IT Kurslari va Amaliy Ta’lim',
    description: 'Real loyihalar orqali dasturchi bo‘ling va kuchli portfolio yaratgan holda IT sohasiga kiring.',
    url: 'https://infast.uz',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'InFast IT-Academy Visual Banner',
      },
    ],
  },
};

export default function LandingHomePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Main Content Flow */}
      <main>
        <Hero />

        {/* Statistics Bar */}
        <TrustStats />

        {/* Why InFast Advantages */}
        <WhyInFast />

        {/* Interactive Salary & Career Calculator */}
        <SalaryCalculator />

        {/* Featured Courses Showcase */}
        <Courses />

        {/* Academy Branch Location */}
        <Branches />

        {/* FAQ Accordion */}
        <FAQ />

        {/* Main Lead Generation Section */}
        <LeadForm />
      </main>

      {/* Quick Contact Widget */}
      <FloatingContact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
