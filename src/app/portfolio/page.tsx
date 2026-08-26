'use client';

import React, { useEffect, useState } from 'react';
import { Search, Code2, Sparkles, ExternalLink, Github, Linkedin, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function PublicTalentShowcaseDirectory() {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchTalents();
  }, [search]);

  const fetchTalents = async () => {
    try {
      const res = await fetch(`/api/public/portfolio?q=${encodeURIComponent(search)}`);
      if (res.ok) {
        const data = await res.json();
        setTalents(data.talents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Glow Effects */}
      <div className="fixed top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center shadow-lg shadow-emerald-500/20">
              IF
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight uppercase">INFAST ACADEMY</span>
              <span className="block text-[9px] text-emerald-400 font-mono">TALANTLAR PORTALI</span>
            </div>
          </Link>

          <Link
            href="/login"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
          >
            Tizimga Kirish
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8 relative z-10">
        {/* Title & Search Section */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INFAST IT-ACADEMY BITIRUVCHILARI VA TALABALARI</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Iqtidorli IT Mutaxassislar Portfoliosi
          </h1>

          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Frontend, Backend va Full-Stack yo'nalishi bo'yicha amaliy loyihalar bajargan iqtidorli talabalarimizni ko'ring va ularni jamoangizga taklif qiling.
          </p>

          {/* Search Input */}
          <div className="relative pt-2">
            <Search className="w-5 h-5 absolute left-4 top-5 text-slate-500" />
            <input
              type="text"
              placeholder="Texnologiya yoki talaba ismi bo'yicha qidiruv (masalan: React, Node.js, Farrux)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs font-medium text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none shadow-xl"
            />
          </div>
        </div>

        {/* Talent Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-mono text-xs">
            Talantlar yuklanmoqda...
          </div>
        ) : talents.length === 0 ? (
          <div className="py-20 text-center text-slate-500 font-mono text-xs bg-slate-900/40 rounded-3xl border border-slate-800">
            Talabalar topilmadi.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talents.map((t) => (
              <div
                key={t.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 space-y-4 shadow-xl transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    {t.avatarUrl ? (
                      <img
                        src={t.avatarUrl}
                        alt={t.name}
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-500/40 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-lg flex items-center justify-center shrink-0">
                        {t.name[0]}
                      </div>
                    )}

                    <div className="space-y-0.5">
                      <h3 className="font-extrabold text-base text-white group-hover:text-emerald-400 transition-colors">
                        {t.name}
                      </h3>
                      <p className="text-[11px] font-bold text-emerald-400 font-mono">
                        {t.courseName}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {t.bio}
                  </p>

                  {/* Skills tags */}
                  {t.skills && t.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {t.skills.slice(0, 4).map((skill: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold font-mono border border-slate-700"
                        >
                          {skill}
                        </span>
                      ))}
                      {t.skills.length > 4 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-500 text-[10px] font-bold font-mono">
                          +{t.skills.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    {t.projectsCount} ta loyiha
                  </span>

                  <Link
                    href={`/portfolio/${t.slug}`}
                    className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/30 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-1"
                  >
                    <span>Portfolioni Ko'rish</span>
                    <span>↗</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
