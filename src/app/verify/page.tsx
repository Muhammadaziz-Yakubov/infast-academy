'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Award } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 bg-orange-100 dark:bg-orange-950/50 text-infast-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-orange-200 dark:border-orange-900">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          INFAST IT-ACADEMY
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
          Sertifikat haqiqiyligini tekshirish tizimi
        </p>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Masalan: IF-GRAD-2026-001"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-infast-500 font-mono uppercase text-center font-bold tracking-wider"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-infast-500/25 transition-all flex items-center justify-center space-x-2"
          >
            <Search className="w-4 h-4" />
            <span>Tekshirish</span>
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <Link href="/" className="hover:text-infast-500 transition-colors">
            ← Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </div>
  );
}
