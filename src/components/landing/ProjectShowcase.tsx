'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Terminal, Layers, ShieldCheck, Cpu, Layout, Globe, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export function ProjectShowcase() {
  const projects = [
    {
      title: 'Academy Management CRM Platform',
      category: 'Full-Stack Next.js 14',
      description: 'Talabalar, to‘lovlar, davomat va marketing tahlilini yurituvchi to‘liq CRM tizimi.',
      tags: ['Next.js 14', 'MongoDB', 'JWT Auth', 'Recharts'],
      grid: 'lg:col-span-8',
      image: '/project-showcase.jpg',
      visual: (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>GET /api/marketing/dashboard</span>
            <span className="text-emerald-400 font-bold">200 OK</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 grid grid-cols-3 gap-2 text-[10px]">
            <div>
              <span className="text-slate-400 block">ROI</span>
              <span className="text-amber-400 font-bold">340%</span>
            </div>
            <div>
              <span className="text-slate-400 block">Students</span>
              <span className="text-emerald-400 font-bold">500+</span>
            </div>
            <div>
              <span className="text-slate-400 block">Revenue</span>
              <span className="text-white font-bold">Live Paid</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'E-Commerce Store & Payment API',
      category: 'Backend Node.js API',
      description: 'Payme va Click to‘lov tizimlari bilan integratsiyalashgan internet magazin backend servisi.',
      tags: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      grid: 'lg:col-span-4',
      visual: (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="text-blue-400">POST /api/v1/checkout</div>
          <div className="text-slate-400">&#123; status: "success", paymentId: "pay_9821" &#125;</div>
        </div>
      ),
    },
    {
      title: 'Veb-saytlar Xavfsizligi Auditi Lab',
      category: 'Cyber Security Lab',
      description: 'Veb tizimlardagi SQLi, XSS va CSRF zaifliklarini izlash va ulardan himoyalanish labi.',
      tags: ['Linux', 'OWASP', 'Burp Suite', 'Web Security'],
      grid: 'lg:col-span-4',
      visual: (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 font-mono text-xs text-emerald-400">
          <div>$ nmap -sV -sC target.academy.uz</div>
          <div className="text-slate-400">PORT 443/TCP OPEN SSL/HTTPS</div>
        </div>
      ),
    },
    {
      title: 'AI Smart Assistant Telegram Bot',
      category: 'AI & Automation',
      description: 'OpenAI API va Node.js yordamida yaratilgan intellektual yordamchi telegram boti.',
      tags: ['Node.js', 'OpenAI', 'Telegraf', 'Redis'],
      grid: 'lg:col-span-8',
      visual: (
        <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs">
          <div className="font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-infast-400" />
            AI Bot Process: Generated Response in 420ms
          </div>
          <div className="text-slate-400 text-[11px]">"Assalomu alaykum! InFast IT-Academy kurslari haqida ma'lumot beraman..."</div>
        </div>
      ),
    },
  ];

  return (
    <section className="py-24 bg-[#050508] text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
              <Globe className="w-3.5 h-3.5" />
              <span>LOYIHALAR SHOUKEYSI</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              Darsda emas — <span className="text-infast-500">loyihada o‘rganamiz.</span>
            </h2>
            <p className="text-base text-slate-400">
              O'quvchilarimiz shunchaki misollar yozmaydi, balki portfolio uchun haqiqiy ishlab chiqarish loyihalarini yaratadi.
            </p>
          </div>

          <Link
            href="/natijalar"
            className="inline-flex items-center px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-slate-200 transition-colors shrink-0"
          >
            <span>Barcha loyihalar</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {projects.map((proj, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`${proj.grid} p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl hover:border-infast-500/40 transition-all space-y-6 flex flex-col justify-between group overflow-hidden`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-infast-400 px-3 py-1 rounded-full bg-infast-500/10 border border-infast-500/20">
                    {proj.category}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">{proj.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{proj.description}</p>
                
                {proj.image ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800">
                    <img src={proj.image} alt={proj.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                ) : (
                  proj.visual
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2">
                {proj.tags.map((tag, i) => (
                  <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                    #{tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
