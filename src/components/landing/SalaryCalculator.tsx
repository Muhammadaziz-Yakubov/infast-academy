'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Globe,
  Sparkles,
  Award,
  Layers,
  Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type CourseKey = 'frontend' | 'backend' | 'cyber' | 'python';
type LevelKey = 'junior' | 'middle' | 'senior' | 'remote';

interface LevelDetail {
  salaryUsd: string;
  salaryUzs: string;
  annualUsd: string;
  experience: string;
  demandIndex: string;
  officialRequirements: string[];
  sampleRoles: string[];
}

export function SalaryCalculator() {
  const [course, setCourse] = useState<CourseKey>('frontend');
  const [level, setLevel] = useState<LevelKey>('junior');

  const salaryData: Record<CourseKey, Record<LevelKey, LevelDetail>> = {
    frontend: {
      junior: {
        salaryUsd: '$400 — $800',
        salaryUzs: '5,200,000 — 10,400,000 so‘m',
        annualUsd: '$6,000 — $9,600 / yil',
        experience: '0 — 1 yil',
        demandIndex: '96% (Juda yuqori)',
        officialRequirements: ['HTML5 & Modern CSS3', 'JavaScript (ES6+)', 'React.js Asoslari', 'Tailwind CSS', 'Git & GitHub'],
        sampleRoles: ['Junior Frontend Developer', 'React Web Dasturchi', 'UI Integrator'],
      },
      middle: {
        salaryUsd: '$1,200 — $2,500',
        salaryUzs: '15,600,000 — 32,500,000 so‘m',
        annualUsd: '$15,000 — $30,000 / yil',
        experience: '1 — 3 yil',
        demandIndex: '99% (Maksimal talab)',
        officialRequirements: ['Next.js (App Router)', 'TypeScript', 'State Management (Zustand/Redux)', 'REST & GraphQL API', 'Web Performance'],
        sampleRoles: ['Middle Next.js Engineer', 'Full-Stack Developer', 'Frontend Team Lead'],
      },
      senior: {
        salaryUsd: '$3,000 — $5,500+',
        salaryUzs: '39,000,000 — 71,500,000+ so‘m',
        annualUsd: '$36,000 — $66,000+ / yil',
        experience: '3+ yil',
        demandIndex: 'Top 1% Bozor',
        officialRequirements: ['System Architecture', 'CI/CD Pipelines', 'Micro-frontends', 'Unit & E2E Testing', 'Texnik liderlik'],
        sampleRoles: ['Senior Frontend Architect', 'Staff Software Engineer', 'Head of Frontend'],
      },
      remote: {
        salaryUsd: '$4,500 — $8,500+',
        salaryUzs: '58,500,000 — 110,000,000+ so‘m',
        annualUsd: '$54,000 — $102,000+ / yil',
        experience: 'Xalqaro Tajriba',
        demandIndex: 'Global (AQSh / Yevropa)',
        officialRequirements: ['Fluent English (B2+)', 'International Remote Workflow', 'Distributed Teams', 'Agile / Scrum', 'Async Communication'],
        sampleRoles: ['Remote Software Engineer', 'Global Contractor', 'US/EU Startup Lead'],
      },
    },
    backend: {
      junior: {
        salaryUsd: '$450 — $900',
        salaryUzs: '5,800,000 — 11,700,000 so‘m',
        annualUsd: '$6,500 — $10,800 / yil',
        experience: '0 — 1 yil',
        demandIndex: '95% (Yuqori)',
        officialRequirements: ['Node.js & Express / NestJS', 'PostgreSQL & MongoDB', 'REST API arxitekturasi', 'JWT & Auth xavfsizligi', 'Git'],
        sampleRoles: ['Junior Node.js Developer', 'Backend API Integrator', 'Database Operator'],
      },
      middle: {
        salaryUsd: '$1,400 — $2,800',
        salaryUzs: '18,200,000 — 36,400,000 so‘m',
        annualUsd: '$17,000 — $33,600 / yil',
        experience: '1 — 3 yil',
        demandIndex: '98% (Maksimal)',
        officialRequirements: ['Microservices', 'Docker & Containerization', 'Redis Caching', 'Message Queues (RabbitMQ/Kafka)', 'ORM / Prisma'],
        sampleRoles: ['Middle Backend Engineer', 'Fintech System Developer', 'Backend Architect'],
      },
      senior: {
        salaryUsd: '$3,500 — $6,500+',
        salaryUzs: '45,500,000 — 84,500,000+ so‘m',
        annualUsd: '$42,000 — $78,000+ / yil',
        experience: '3+ yil',
        demandIndex: 'Enterprise / Yuqori',
        officialRequirements: ['High-load Systems', 'Kubernetes Orchestration', 'AWS / Cloud Architecture', 'Database Sharding', 'System Design'],
        sampleRoles: ['Principal Backend Engineer', 'Solutions Architect', 'CTO / Texnik Direktor'],
      },
      remote: {
        salaryUsd: '$5,000 — $10,000+',
        salaryUzs: '65,000,000 — 130,000,000+ so‘m',
        annualUsd: '$60,000 — $120,000+ / yil',
        experience: 'Global Masofaviy',
        demandIndex: 'AQSh / Buyuk Britaniya',
        officialRequirements: ['English C1', 'Distributed Cloud Systems', 'Serverless', 'Security Compliance', 'Independent Delivery'],
        sampleRoles: ['Global Backend Engineer', 'Cloud Infrastructure Consultant', 'Remote Lead Dev'],
      },
    },
    cyber: {
      junior: {
        salaryUsd: '$500 — $1,000',
        salaryUzs: '6,500,000 — 13,000,000 so‘m',
        annualUsd: '$7,000 — $12,000 / yil',
        experience: '0 — 1 yil',
        demandIndex: 'Kritik Yuqori',
        officialRequirements: ['Linux OS & Bash', 'Networking (TCP/IP, DNS, OSI)', 'OWASP Top 10 zaifliklar', 'Nmap & Wireshark', 'Kali Linux vositalari'],
        sampleRoles: ['Junior SOC Analyst', 'Junior Security Analyst', 'Pentest Assistent'],
      },
      middle: {
        salaryUsd: '$1,600 — $3,200',
        salaryUzs: '20,800,000 — 41,600,000 so‘m',
        annualUsd: '$19,000 — $38,400 / yil',
        experience: '1 — 3 yil',
        demandIndex: 'Strategik Defitsit',
        officialRequirements: ['Penetration Testing (Web/Net)', 'Burp Suite Professional', 'SIEM & SOC monitoring', 'Vulnerability Assessment', 'Active Directory auditi'],
        sampleRoles: ['Penetration Tester', 'Web Security Engineer', 'SOC L2 Analyst'],
      },
      senior: {
        salaryUsd: '$3,800 — $7,500+',
        salaryUzs: '49,400,000 — 97,500,000+ so‘m',
        annualUsd: '$45,000 — $90,000+ / yil',
        experience: '3+ yil',
        demandIndex: 'Global Bank & Fintech',
        officialRequirements: ['Red Teaming & Exploitation', 'DevSecOps & Cloud Security', 'Incident Response & Forensics', 'ISO 27001 / NIST standartlar', 'OSCP / CEH'],
        sampleRoles: ['Lead Security Architect', 'Chief Information Security Officer (CISO)', 'Red Team Leader'],
      },
      remote: {
        salaryUsd: '$6,000 — $12,000+',
        salaryUzs: '78,000,000 — 156,000,000+ so‘m',
        annualUsd: '$72,000 — $144,000+ / yil',
        experience: 'Global Enterprise',
        demandIndex: 'Xalqaro Auditor',
        officialRequirements: ['Offensive Security Certifications', 'Bug Bounty track-record', 'Enterprise Cloud Defense', 'English Fluency'],
        sampleRoles: ['Senior Security Consultant', 'Remote AppSec Specialist', 'Global Threat Hunter'],
      },
    },
    python: {
      junior: {
        salaryUsd: '$450 — $850',
        salaryUzs: '5,800,000 — 11,000,000 so‘m',
        annualUsd: '$6,000 — $10,200 / yil',
        experience: '0 — 1 yil',
        demandIndex: "94% (O'suvchi)",
        officialRequirements: ['Python Core & OOP', 'SQL & Relational DBs', 'Pandas & NumPy', 'FastAPI / Django asoslari', 'Avtomatlashtirish skriptlari'],
        sampleRoles: ['Junior Python Developer', 'Data Analyst Assistent', 'Automation Engineer'],
      },
      middle: {
        salaryUsd: '$1,300 — $2,600',
        salaryUzs: '16,900,000 — 33,800,000 so‘m',
        annualUsd: '$15,600 — $31,200 / yil',
        experience: '1 — 3 yil',
        demandIndex: '98% (Juda talabgor)',
        officialRequirements: ['Machine Learning (Scikit-Learn)', 'FastAPI & Async IO', 'PostgreSQL & ClickHouse', 'Data Pipelines (ETL)', 'Docker & Git'],
        sampleRoles: ['Middle Python / AI Engineer', 'Data Engineer', 'Backend AI Integrator'],
      },
      senior: {
        salaryUsd: '$3,200 — $6,000+',
        salaryUzs: '41,600,000 — 78,000,000+ so‘m',
        annualUsd: '$38,400 — $72,000+ / yil',
        experience: '3+ yil',
        demandIndex: 'AI & Data Boom',
        officialRequirements: ['LLM & RAG arxitekturasi', 'PyTorch / Deep Learning', 'MLOps & Model Deployment', 'Vector Databases (Pinecone/Milvus)', 'Distributed Data'],
        sampleRoles: ['Senior AI / ML Engineer', 'Lead Data Scientist', 'AI Solutions Architect'],
      },
      remote: {
        salaryUsd: '$5,500 — $11,000+',
        salaryUzs: '71,500,000 — 143,000,000+ so‘m',
        annualUsd: '$66,000 — $132,000+ / yil',
        experience: 'Global AI Market',
        demandIndex: 'Kremniy Vodiysi / EU',
        officialRequirements: ['State-of-the-art AI Modeling', 'High-throughput Inference', 'Cloud AI (AWS Bedrock / GCP Vertex)', 'English Fluent'],
        sampleRoles: ['Remote GenAI Engineer', 'Global ML Researcher', 'Silicon Valley Contractor'],
      },
    },
  };

  const current = salaryData[course][level];

  return (
    <section id="kalkulyator" className="py-24 bg-[#050508] text-white relative overflow-hidden font-sans">
      {/* GTA VI Sunset & Neon Ambient Mesh Lights */}
      <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-[#FF2A85]/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-[600px] h-[600px] bg-[#00F0FF]/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[350px] bg-[#FF7A00]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Header with GTA VI Sunset Gradient Accent */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 via-[#FF7A00]/15 to-[#00F0FF]/15 border border-[#FF2A85]/30 px-4 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-xl shadow-[0_0_20px_rgba(255,42,133,0.25)]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF2A85]" />
            <span className="uppercase tracking-widest text-[11px]">Rasmiy Bozor Me'yorlari</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
            IT Sohasidagi Real{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF]">
              Daromadingizni Hisoblang.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-400 font-normal max-w-2xl mx-auto leading-relaxed">
            O'zbekiston IT Park, xalqaro LinkedIn va Upwork talablari asosida shakllantirilgan rasmiy oylik va yillik maosh tahlili.
          </p>
        </div>

        {/* Interactive Apple-Glassmorphic Calculator Card */}
        <div className="p-6 sm:p-10 lg:p-12 rounded-[36px] sm:rounded-[44px] bg-neutral-900/60 border border-white/10 backdrop-blur-2xl shadow-2xl shadow-black/80 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Controls Column (Left) */}
          <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* 1. Yo'nalish Tanlash */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                  <span>1. IT Yo'nalishini Tanlang:</span>
                  <span className="text-amber-400 font-mono text-[10px]">4 ta yo'nalish</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'frontend', label: 'Frontend Dasturlash', desc: 'React • Next.js • TS' },
                    { id: 'backend', label: 'Backend Dasturlash', desc: 'Node.js • Nest • SQL' },
                    { id: 'cyber', label: 'Kiberxavfsizlik', desc: 'Pentest • SOC • Linux' },
                    { id: 'python', label: 'Python & AI / Data', desc: 'Python • ML • FastAPI' },
                  ].map((c) => {
                    const isSelected = course === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCourse(c.id as CourseKey)}
                        className={`p-3.5 rounded-2xl text-left transition-all relative overflow-hidden border ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#FF2A85]/20 via-neutral-900 to-[#00F0FF]/15 border-[#FF2A85]/60 text-white shadow-[0_0_25px_rgba(255,42,133,0.3)] ring-1 ring-[#FF2A85]'
                            : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="text-xs font-bold text-white">{c.label}</div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-0.5">{c.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Tajriba va Daraja Tanlash */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3 flex items-center justify-between">
                  <span>2. Tajriba va Daraja:</span>
                  <span className="text-cyan-400 font-mono text-[10px]">Real talab</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'junior', label: 'Junior', tag: '0-1 yil' },
                    { id: 'middle', label: 'Middle', tag: '1-3 yil' },
                    { id: 'senior', label: 'Senior', tag: '3+ yil' },
                    { id: 'remote', label: 'Remote', tag: 'Global' },
                  ].map((l) => {
                    const isSelected = level === l.id;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLevel(l.id as LevelKey)}
                        className={`py-3 px-2 rounded-2xl text-center transition-all border ${
                          isSelected
                            ? 'bg-gradient-to-r from-[#FF7A00] to-[#FF2A85] text-white font-extrabold shadow-lg shadow-[#FF7A00]/25 border-transparent'
                            : 'bg-white/[0.03] border-white/10 text-neutral-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="text-xs font-bold">{l.label}</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{l.tag}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Official Requirements Checklist */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-300 flex items-center justify-between">
                  <span>Rasmiy Talablar (Sizdan so'raladigan bilimlar):</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {current.officialRequirements.map((req, i) => (
                    <div key={i} className="flex items-center space-x-2 text-xs text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] shrink-0" />
                      <span className="truncate">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Official Tax Benefits Footer Notice */}
            <div className="pt-2 flex items-center space-x-3 text-xs text-neutral-400 border-t border-white/[0.08]">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <Building className="w-4 h-4" />
              </div>
              <p className="text-[11px] leading-relaxed">
                <strong>IT Park Imtiyozi:</strong> O'zbekiston IT-mutaxassislari uchun 0% korporativ foyda solig'i hamda 7.5% pasaytirilgan daromad solig'i stavkasi kafolatlangan.
              </p>
            </div>
          </div>

          {/* Results Column (Right - GTA VI Sunset Aesthetic Card) */}
          <div className="lg:col-span-6 flex flex-col justify-between rounded-[32px] p-6 sm:p-8 bg-gradient-to-b from-[#0F0C1E] via-[#0A0914] to-black border border-[#FF2A85]/30 shadow-2xl relative overflow-hidden space-y-6">
            
            {/* Ambient Corner Reflection */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-bl from-[#FF2A85]/30 to-transparent blur-3xl pointer-events-none" />

            <div className="space-y-6 relative z-10">
              {/* Header Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF2A85]">
                    Kutilayotgan Rasmiy Daromad
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">
                    {course.toUpperCase()} • {level.toUpperCase()}
                  </h3>
                </div>

                <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-black text-emerald-400">
                  {current.demandIndex}
                </div>
              </div>

              {/* Main Monthly Salary (Big Numbers) */}
              <div className="space-y-1">
                <div className="text-[11px] font-semibold text-neutral-400">Oylik sof maosh (Net):</div>
                <div className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-neutral-100 to-[#00F0FF] tracking-tight">
                  {current.salaryUsd}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-[#FF7A00]">
                  ≈ {current.salaryUzs}
                </div>
              </div>

              {/* Annual Estimate and Experience */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Yillik Daromad:</span>
                  <div className="text-sm sm:text-base font-black text-white">{current.annualUsd}</div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-1">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase">Tajriba talabi:</span>
                  <div className="text-sm sm:text-base font-black text-cyan-400">{current.experience}</div>
                </div>
              </div>

              {/* Real Career Roles in Market */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Siz egallashingiz mumkin bo'lgan lavozimlar:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {current.sampleRoles.map((role, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-xl bg-white/[0.06] border border-white/10 text-[11px] font-medium text-neutral-200"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Registration CTA */}
            <div className="pt-4 border-t border-white/10 relative z-10 space-y-2">
              <Link
                href="/#ariza"
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF2A85] via-[#FF7A00] to-[#00F0FF] text-white font-black text-xs sm:text-sm shadow-xl shadow-[#FF2A85]/25 hover:shadow-[#FF2A85]/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                <span>Ushbu Yo'nalishga Ariza Qoldirish</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-[10px] text-neutral-500 text-center">
                Bepul sinov darsi • Shaxsiy portfolio • Ishga joylashish kafolati
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
