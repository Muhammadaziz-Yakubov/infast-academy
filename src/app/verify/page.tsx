'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function VerifySearchPage() {
  const [certId, setCertId] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;
    router.push(`/verify/${certId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] flex flex-col justify-center items-center p-4 font-sans antialiased">
      <div className="max-w-[420px] w-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-[32px] p-8 shadow-2xl shadow-black/5 text-center">
        <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-sm shadow-md">
          IF
        </div>

        <h1 className="text-xs font-semibold tracking-[0.25em] text-slate-400 dark:text-zinc-500 uppercase">
          INFAST IT-ACADEMY
        </h1>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white tracking-tight mt-1 mb-6">
          Sertifikatni Tekshirish
        </h2>

        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Masalan: IF-GRAD-2026-001"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full px-4 py-3 bg-[#F5F5F7] dark:bg-zinc-800 border border-transparent focus:border-black/20 dark:focus:border-white/20 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none font-mono uppercase text-center font-bold tracking-wider transition-all placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-xs rounded-full shadow-lg shadow-black/5 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tekshirish</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-black/[0.04] dark:border-white/[0.06] text-xs text-slate-400 dark:text-zinc-500">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
