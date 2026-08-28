import React from 'react';
import { Metadata } from 'next';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { LeadForm } from '@/components/landing/LeadForm';
import { FloatingContact } from '@/components/landing/FloatingContact';
import { Footer } from '@/components/landing/Footer';

export const metadata: Metadata = {
  title: 'Cyber Security Kursi — InFast IT-Academy',
  description: 'Linux ma\'murligi, tarmoqlar xavfsizligi, veb-zaifliklarni izlash hamda pentesting asoslarini o\'rganing.',
};

export default function CyberSecurityCoursePage() {
  const modules = [
    { month: '1-OY', title: 'Linux Administration & Shell Scripting', topics: ['Linux CLI Essentials', 'Permissions, Users & Systemd', 'Bash Scripting Basics', 'Network Utilities (netstat, ss, nmap)'] },
    { month: '2-OY', title: 'Computer Networks & Protocols', topics: ['OSI & TCP/IP Stack Models', 'DNS, HTTP/HTTPS Protocol Analysis', 'Wireshark Packet Analysis', 'Firewalls & Routing Rules'] },
    { month: '3-OY', title: 'Web Application Security', topics: ['OWASP Top 10 Vulnerabilities', 'SQL Injection (SQLi) & Defense', 'Cross-Site Scripting (XSS)', 'Authentication Flaws & Bypass'] },
    { month: '4-OY', title: 'Penetration Testing & Tools', topics: ['Burp Suite Professional Labs', 'Metasploit Framework Basics', 'Directory Bruteforce & Recon', 'Vulnerability Assessment Reports'] },
    { month: '5-OY', title: 'System Hardening & Security Ops', topics: ['SSH Hardening & Key Auth', 'SSL/TLS Certificate Setup', 'Log Auditing & Incident Analysis', 'Web Application Firewalls (WAF)'] },
    { month: '6-OY', title: 'Practical Cyber Labs & Career', topics: ['Capture The Flag (CTF) Challenges', 'Practical Lab Reports', 'Security Analyst Resume Prep', 'Industry Certification Guidance'] },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Navbar />

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-full text-xs font-bold text-blue-400">
              <ShieldCheck className="w-4 h-4" />
              <span>CYBER SECURITY KURSI</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">
              Kiberxavfsizlik va <br />
              <span className="text-blue-400">Pentesting Mutaxassisi bo'ling.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
              Tizimlar xavfsizligini ta'minlash, zaifliklarni aniqlash hamda veb-hujumlardan samarali himoyalanish ko'nikmalarini egallang.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">Davomiyligi: 6 Oy</span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">Haftada: 3 Kun + Lablar</span>
              <span className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">Daraja: Noldan Pro-gacha</span>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-black text-white">6 Oylik O'quv Dasturi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((m, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {m.month}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">{m.title}</h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {m.topics.map((t, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        <LeadForm />
      </main>

      <FloatingContact />
      <Footer />
    </div>
  );
}
