import React from 'react';
import { Metadata } from 'next';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { TrustStats } from '@/components/landing/TrustStats';
import { WhyInFast } from '@/components/landing/WhyInFast';
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
  title: 'InFast IT-Academy — Zamonaviy IT kurslari va Amaliy Ta’lim',
  description: 'InFast IT-Academy — Frontend, Backend va Cyber Security yo‘nalishlarida real amaliy loyihalar orqali IT mutaxassisi bo‘ling.',
  openGraph: {
    title: 'InFast IT-Academy — Zamonaviy IT kurslari',
    description: 'Real loyihalar orqali dasturchi bo‘ling va kuchli portfolio yaratgan holda IT sohasiga kiring.',
    type: 'website',
  },
};

export default function LandingHomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-infast-500 selection:text-white">
      {/* Sticky Header Navbar */}
      <Navbar />

      {/* Hero Banner Section */}
      <main>
        <Hero />

        {/* Statistics Bar */}
        <TrustStats />

        {/* Why InFast Advantages */}
        <WhyInFast />

        {/* Featured Courses Showcase */}
        <Courses />

        {/* Learning Roadmap: Zero to Real Project */}
        <ZeroToProject />

        {/* Student Real-world Project Bento Grid */}
        <ProjectShowcase />

        {/* Before vs After Mindset Transformation */}
        <BeforeAfter />

        {/* Academy Experience Environment */}
        <LearningExperience />

        {/* Mentors & Instructors */}
        <Mentors />

        {/* Cinematic Mindset Quote Section */}
        <InfastExperience />

        {/* Branches & Locations */}
        <Branches />

        {/* FAQ Accordion */}
        <FAQ />

        {/* Main Lead Generation Section */}
        <LeadForm />
      </main>

      {/* Floating Quick Action Contact Widget */}
      <FloatingContact />

      {/* Footer */}
      <Footer />
    </div>
  );
}
