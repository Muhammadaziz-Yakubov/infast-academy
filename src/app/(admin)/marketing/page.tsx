'use client';

import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  TrendingUp,
  Users,
  DollarSign,
  UserCheck,
  Target,
  Percent,
  RefreshCw,
  Calendar,
  Filter,
  ArrowUpRight,
  PieChart as PieIcon,
  Layers,
} from 'lucide-react';
import { formatMoneyUz } from '@/lib/utils';

export default function MarketingDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30days');
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/marketing/dashboard?timeRange=${timeRange}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const kpis = data?.kpis || {};
  const funnel = data?.funnel || [];
  const topCampaigns = data?.topCampaigns || [];
  const topChannels = data?.topChannels || [];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">📊</span>
            Bugungi ishlar
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Marketing, yangi leadlar va asosiy ko'rsatkichlar tahlili
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] rounded-xl p-1">
            {[
              { id: '7days', label: '7 kun' },
              { id: '30days', label: '30 kun' },
              { id: 'thisMonth', label: 'Shu oy' },
              { id: 'all', label: 'Barcha davr' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === tab.id
                    ? 'bg-white dark:bg-[#181820] text-infast-600 dark:text-infast-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-black/[0.02] dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all shadow-sm active:scale-95"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Jami Kampaniyalar</span>
            <Megaphone className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{kpis.totalCampaigns || 0}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              {kpis.activeCampaigns || 0} Faol
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Jami Leadlar</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{kpis.totalLeads || 0}</span>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">
              {kpis.newLeads || 0} Yangi
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Yangi O'quvchilar</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{kpis.newStudentsCount || 0}</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Student bo'ldi</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Reklama Xarajati</span>
            <DollarSign className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
            {formatMoneyUz(kpis.totalSpend || 0)}
          </div>
        </div>

        {/* KPI 5 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Tushgan Daromad</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatMoneyUz(kpis.totalRevenue || 0)}
          </div>
        </div>

        {/* KPI 6 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CPL (Lead Narxi)</span>
            <Target className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatMoneyUz(kpis.cpl || 0)}
          </div>
        </div>

        {/* KPI 7 */}
        <div className="p-5 apple-card space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">CAC (Student Narxi)</span>
            <Target className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {formatMoneyUz(kpis.cac || 0)}
          </div>
        </div>

        {/* KPI 8 */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl shadow-lg shadow-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-amber-100">
            <span className="text-xs font-bold uppercase tracking-wider">ROI (Rentabellik)</span>
            <Percent className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black">{kpis.roi || 0}%</span>
            <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-md">
              Conv: {kpis.conversion || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Marketing Funnel */}
      <div className="p-6 apple-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              Marketing & Sotuv Voronkasi (Funnel)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tashrifchidan to'lov qilgan talabagacha bo'lgan har bir bosqich konversiyasi
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {funnel.map((item: any, idx: number) => (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                <span>{item.step}</span>
                <span className="font-bold">
                  {item.count} ta <span className="text-slate-400">({item.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-black/[0.04] dark:bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Campaigns & Channels Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <div className="p-6 apple-card space-y-4">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
            <span>📢 Top Kampaniyalar</span>
            <span className="text-xs font-normal text-slate-500">ROI bo'yicha</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-black/[0.06] dark:border-white/[0.08]">
                  <th className="pb-3">Kampaniya</th>
                  <th className="pb-3 text-center">Lead</th>
                  <th className="pb-3 text-center">Student</th>
                  <th className="pb-3 text-right">Xarajat</th>
                  <th className="pb-3 text-right">ROI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {topCampaigns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Kampaniyalar ma'lumoti yo'q
                    </td>
                  </tr>
                ) : (
                  topCampaigns.map((c: any) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white truncate max-w-[140px]">
                        {c.name}
                      </td>
                      <td className="py-3 text-center font-bold">{c.leads}</td>
                      <td className="py-3 text-center font-bold text-emerald-600">{c.students}</td>
                      <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                        {formatMoneyUz(c.spend)}
                      </td>
                      <td className="py-3 text-right font-black text-amber-600 dark:text-amber-400">
                        {c.roi}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Channels */}
        <div className="p-6 apple-card space-y-4">
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white flex items-center justify-between">
            <span>📱 Top Kanallar</span>
            <span className="text-xs font-normal text-slate-500">Manba bo'yicha</span>
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-3">Kanal</th>
                  <th className="pb-3 text-center">Lead</th>
                  <th className="pb-3 text-center">Student</th>
                  <th className="pb-3 text-right">Xarajat</th>
                  <th className="pb-3 text-right">Daromad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {topChannels.map((ch: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {ch.name}
                    </td>
                    <td className="py-3 text-center font-bold">{ch.leads}</td>
                    <td className="py-3 text-center font-bold text-emerald-600">{ch.students}</td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                      {formatMoneyUz(ch.spend)}
                    </td>
                    <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                      {formatMoneyUz(ch.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
