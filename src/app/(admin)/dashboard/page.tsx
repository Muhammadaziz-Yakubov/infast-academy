'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz } from '@/lib/utils';
import {
  Users,
  UserCheck,
  Folder,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  UserX,
  Clock,
  MapPin,
  GraduationCap,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const metrics = data?.metrics || {};
  const debtors = data?.debtors || [];
  const todayClasses = data?.todayClasses || [];
  const studentsByCourse = data?.charts?.studentsByCourse || [];
  const paymentStatusChart = data?.charts?.paymentStatusChart || [];

  return (
    <div className="flex-1 pb-12">
      <Header title="Bosh sahifa" />

      <main className="p-6 space-y-8 max-w-7xl mx-auto">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total & Active Students */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Talabalar soni</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? '...' : metrics.totalStudents}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1" />
                {loading ? '...' : metrics.activeStudents} ta faol talaba
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-infast-50 text-infast-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Today's & Monthly Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bugungi tushum</p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{loading ? '...' : formatMoneyUz(metrics.todayRevenue)}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Oylik: <span className="font-semibold text-slate-800">{loading ? '...' : formatMoneyUz(metrics.monthlyRevenue)}</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Total Debt */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Umumiy qarzdorlik</p>
              <p className="text-xl font-extrabold text-rose-600 mt-1">{loading ? '...' : formatMoneyUz(metrics.totalDebt)}</p>
              <p className="text-xs text-rose-500 font-semibold mt-1 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                {debtors.length} ta qarzdor talaba
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
          </motion.div>

          {/* Today's Attendance & Absents */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bugungi davomat</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {loading ? '...' : `${metrics.todayAttendance?.rate || 0}%`}
              </p>
              <p className="text-xs text-amber-600 font-semibold mt-1 flex items-center">
                <UserX className="w-3.5 h-3.5 mr-1" />
                {loading ? '...' : metrics.todayAbsent} ta kelmagan
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Distribution Bar Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
            <h3 className="text-base font-bold text-slate-900 mb-6">Kurslar bo'yicha talabalar taqsimoti</h3>
            {loading ? (
              <div className="h-64 flex items-center justify-center text-slate-400 text-xs">Yuklanmoqda...</div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studentsByCourse}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#f1f5f9', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[8, 8, 0, 0]} name="Talabalar soni" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Payment Status Pie Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col justify-between">
            <h3 className="text-base font-bold text-slate-900 mb-4">To'lov Holatlari</h3>
            {loading ? (
              <div className="h-48 flex items-center justify-center text-slate-400 text-xs">Yuklanmoqda...</div>
            ) : (
              <div className="h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentStatusChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                      {paymentStatusChart.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            <div className="flex justify-around pt-4 border-t border-slate-100 text-xs">
              {paymentStatusChart.map((item: any) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-600">{item.name}: <strong className="text-slate-900">{item.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Debtors & Today Classes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Debtors Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <AlertCircle className="w-5 h-5 text-rose-500 mr-2" />
                Qarzdor Talabalar
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-600">
                {debtors.length} ta
              </span>
            </div>

            {debtors.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Hozirda qarzdor talabalar yo'q 🎉</p>
            ) : (
              <div className="divide-y divide-slate-100 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-100 pb-2">
                      <th className="pb-2">Talaba</th>
                      <th className="pb-2">Guruh</th>
                      <th className="pb-2">Qarzi</th>
                      <th className="pb-2 text-right">To'lov kuni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {debtors.map((d: any) => (
                      <tr key={d.id} className="hover:bg-slate-50/50">
                        <td className="py-3 font-semibold text-slate-900">{d.studentName}</td>
                        <td className="py-3 text-slate-600">{d.groupName}</td>
                        <td className="py-3 font-bold text-rose-600">{formatMoneyUz(d.debtAmount)}</td>
                        <td className="py-3 text-right text-slate-500 font-medium">{d.dueDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Today's Scheduled Classes Widget */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center">
                <Clock className="w-5 h-5 text-infast-500 mr-2" />
                Bugungi Darslar
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-infast-50 text-infast-600">
                {todayClasses.length} ta dars
              </span>
            </div>

            {todayClasses.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Bugun guruhlarda dars rejalashtirilmagan.</p>
            ) : (
              <div className="space-y-3">
                {todayClasses.map((c: any) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{c.groupName}</p>
                      <p className="text-xs text-slate-500 font-medium">{c.courseName} • Ustoz: {c.teacherName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-infast-600 bg-infast-50 px-2.5 py-1 rounded-lg inline-block">
                        {c.time}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium mt-1 flex items-center justify-end">
                        <MapPin className="w-3 h-3 mr-0.5" />
                        {c.room}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
