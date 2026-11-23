'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz } from '@/lib/utils';
import { BarChart3, Users, DollarSign, CalendarCheck, GraduationCap, TrendingUp, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const students = reports?.students || {};
  const payments = reports?.payments || {};
  const attendance = reports?.attendance || {};
  const exams = reports?.exams || {};

  return (
    <div className="flex-1 pb-12">
      <Header title="Hisobotlar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="apple-card p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Akademiya Umumiy Analitikasi</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Real bazaga asoslangan barcha ko'rsatkichlar va hisobotlar</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Report */}
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <Users className="w-5 h-5 text-infast-500" />
              <h3 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Talabalar Statistikasi</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl">
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Jami talabalar</p>
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">{loading ? '...' : students.total}</p>
              </div>
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">Faol talabalar</p>
                <p className="text-xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400 mt-1">{loading ? '...' : students.active}</p>
              </div>
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <p className="text-amber-600 dark:text-amber-400 font-semibold text-[11px] uppercase tracking-wider">Muzlatilgan</p>
                <p className="text-xl font-bold tracking-tight text-amber-700 dark:text-amber-400 mt-1">{loading ? '...' : students.paused}</p>
              </div>
              <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
                <p className="text-sky-600 dark:text-sky-400 font-semibold text-[11px] uppercase tracking-wider">Bitirganlar</p>
                <p className="text-xl font-bold tracking-tight text-sky-700 dark:text-sky-400 mt-1">{loading ? '...' : students.completed}</p>
              </div>
            </div>
          </div>

          {/* Payments Report */}
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Moliya va To'lovlar</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl col-span-2">
                <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">Oylik Tushum</p>
                <p className="text-2xl font-bold tracking-tight text-emerald-800 dark:text-emerald-300 mt-1">
                  {loading ? '...' : formatMoneyUz(payments.totalRevenue)}
                </p>
              </div>
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl col-span-2">
                <p className="text-rose-600 dark:text-rose-400 font-semibold text-[11px] uppercase tracking-wider">Mavjud Umumiy Qarzdorlik</p>
                <p className="text-xl font-bold tracking-tight text-rose-700 dark:text-rose-400 mt-1">
                  {loading ? '...' : formatMoneyUz(payments.totalDebt)}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Report */}
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <CalendarCheck className="w-5 h-5 text-sky-500" />
              <h3 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Davomat Hisoboti</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-sky-500/10 border border-sky-500/20 rounded-2xl">
                <p className="text-sky-700 dark:text-sky-400 font-semibold text-[11px] uppercase tracking-wider">Umumiy Davomat %</p>
                <p className="text-2xl font-bold tracking-tight text-sky-800 dark:text-sky-300 mt-1">{loading ? '...' : `${attendance.overallPercentage}%`}</p>
              </div>
              <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.04] border border-black/[0.04] dark:border-white/[0.06] rounded-2xl">
                <p className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">Jami Darslar Yozuvi</p>
                <p className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">{loading ? '...' : attendance.totalRecords}</p>
              </div>
            </div>
          </div>

          {/* Exams Report */}
          <div className="apple-card p-6 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              <h3 className="font-semibold text-sm tracking-tight text-slate-900 dark:text-white">Imtihonlar Statistikasi</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px] uppercase">O'tdi</p>
                <p className="text-lg font-bold text-emerald-800 dark:text-emerald-300">{loading ? '...' : exams.passed}</p>
              </div>
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                <p className="text-rose-600 dark:text-rose-400 font-semibold text-[10px] uppercase">O'tmadi</p>
                <p className="text-lg font-bold text-rose-800 dark:text-rose-300">{loading ? '...' : exams.failed}</p>
              </div>
              <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 rounded-xl">
                <p className="text-sky-600 dark:text-sky-400 font-semibold text-[10px] uppercase">O'rtacha Ball</p>
                <p className="text-lg font-bold text-sky-800 dark:text-sky-300">{loading ? '...' : exams.averageScore}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
