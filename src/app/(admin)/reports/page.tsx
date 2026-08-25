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
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
          <div>
            <h2 className="font-bold text-base text-slate-900">Akademiya Umumiy Analitikasi</h2>
            <p className="text-xs text-slate-500">Real bazaga asoslangan barcha ko'rsatkichlar va hisobotlar</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Report */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <Users className="w-5 h-5 text-infast-500" />
              <h3 className="font-bold text-sm text-slate-900">Talabalar Statistikasi</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-slate-500 font-semibold">Jami talabalar</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{loading ? '...' : students.total}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl">
                <p className="text-emerald-600 font-semibold">Faol talabalar</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">{loading ? '...' : students.active}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-2xl">
                <p className="text-amber-600 font-semibold">Muzlatilgan</p>
                <p className="text-xl font-bold text-amber-700 mt-1">{loading ? '...' : students.paused}</p>
              </div>
              <div className="p-3 bg-sky-50 rounded-2xl">
                <p className="text-sky-600 font-semibold">Bitirganlar</p>
                <p className="text-xl font-bold text-sky-700 mt-1">{loading ? '...' : students.completed}</p>
              </div>
            </div>
          </div>

          {/* Payments Report */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-slate-900">Moliya va To'lovlar</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-emerald-50 rounded-2xl col-span-2">
                <p className="text-emerald-700 font-semibold">Jami Yig'ilgan Tushum</p>
                <p className="text-2xl font-extrabold text-emerald-800 mt-1">
                  {loading ? '...' : formatMoneyUz(payments.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl col-span-2">
                <p className="text-rose-600 font-semibold">Mavjud Umumiy Qarzdorlik</p>
                <p className="text-xl font-bold text-rose-700 mt-1">
                  {loading ? '...' : formatMoneyUz(payments.totalDebt)}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance Report */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <CalendarCheck className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-sm text-slate-900">Davomat Hisoboti</h3>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-sky-50 rounded-2xl">
                <p className="text-sky-700 font-semibold">Umumiy Davomat %</p>
                <p className="text-2xl font-extrabold text-sky-800 mt-1">{loading ? '...' : `${attendance.overallPercentage}%`}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <p className="text-slate-500 font-semibold">Jami Darslar Yozuvi</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{loading ? '...' : attendance.totalRecords}</p>
              </div>
            </div>
          </div>

          {/* Exams Report */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <GraduationCap className="w-5 h-5 text-purple-500" />
              <h3 className="font-bold text-sm text-slate-900">Imtihonlar Statistikasi</h3>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="p-2.5 bg-emerald-50 rounded-xl">
                <p className="text-emerald-600 font-semibold">O'tdi</p>
                <p className="text-lg font-bold text-emerald-800">{loading ? '...' : exams.passed}</p>
              </div>
              <div className="p-2.5 bg-rose-50 rounded-xl">
                <p className="text-rose-600 font-semibold">O'tmadi</p>
                <p className="text-lg font-bold text-rose-800">{loading ? '...' : exams.failed}</p>
              </div>
              <div className="p-2.5 bg-sky-50 rounded-xl">
                <p className="text-sky-600 font-semibold">O'rtacha Ball</p>
                <p className="text-lg font-bold text-sky-800">{loading ? '...' : exams.averageScore}</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
