'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import {
  User,
  Phone,
  Calendar,
  BookOpen,
  Folder,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ArrowLeft,
  GraduationCap,
  Percent,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'attendance' | 'exams'>('overview');

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      const res = await fetch(`/api/students/${studentId}`);
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

  const student = data?.student;
  const payments = data?.payments || [];
  const attendances = data?.attendances || [];
  const attendanceStats = data?.attendanceStats || {};
  const exams = data?.exams || [];
  const periods = student?.periods || [];

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Header title="Talaba Profili" />
        <div className="py-20 text-center text-slate-400">Profil yuklanmoqda...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex-1 p-6">
        <Header title="Talaba Profili" />
        <div className="py-20 text-center text-rose-500">Talaba topilmadi</div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-12">
      <Header title="Talaba Profili" />

      <main className="p-6 space-y-6 max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Talabalar ro'yxatiga qaytish
        </button>

        {/* Student Profile Banner Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-infast-600 to-infast-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-infast-500/20">
              {student.firstName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {student.courseId?.name || 'Kurs'} • {student.groupId?.name || 'Guruh'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Dynamic Course Month Badge */}
            <div className="px-3.5 py-1.5 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs">
              Joriy bosqich: {student.currentCourseMonth}
            </div>

            <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
              student.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
            }`}>
              {student.status}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
          {[
            { id: 'overview', label: 'Umumiy Ma\'lumot' },
            { id: 'payments', label: 'To\'lovlar Tarixi' },
            { id: 'attendance', label: 'Davomat Tarixi' },
            { id: 'exams', label: 'Imtihonlar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 relative transition-colors ${
                activeTab === tab.id ? 'text-infast-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-infast-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Shaxsiy Ma'lumotlar</h3>
              
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Telefon:</span>
                <span className="font-bold text-slate-900 font-mono">{student.phone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Ota-ona telefoni:</span>
                <span className="font-bold text-slate-900 font-mono">{student.parentPhone || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Tug'ilgan sana:</span>
                <span className="font-semibold text-slate-900">{formatDateUz(student.birthDate)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">O'qish va To'lov Shartlari</h3>

              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Kurs:</span>
                <span className="font-bold text-slate-900">{student.courseId?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Guruh:</span>
                <span className="font-bold text-slate-900">{student.groupId?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Oylik To'lov Narxi:</span>
                <span className="font-bold text-slate-900">{formatMoneyUz(student.effectiveFee)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-slate-500">Har oylik to'lov kuni:</span>
                <span className="font-bold text-infast-600">{student.paymentDueDay}-sana</span>
              </div>
              {student.nextPaymentDueDate && (
                <div className={`flex justify-between p-2.5 rounded-xl text-xs font-bold ${
                  student.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-900 border border-emerald-100' : 'bg-rose-50 text-rose-900 border border-rose-100'
                }`}>
                  <span className="font-semibold">Keyingi to'lov sanasi:</span>
                  <span className="font-extrabold font-mono">{formatDateUz(student.nextPaymentDueDate)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Payments History & Periods */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Status Banner */}
            {student.nextPaymentDueDate && (
              <div className={`p-4 rounded-3xl border flex items-center justify-between shadow-card ${
                student.paymentStatus === 'PAID' ? 'bg-emerald-50/70 border-emerald-100 text-emerald-900' : 'bg-rose-50/70 border-rose-100 text-rose-900'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg text-white ${
                    student.paymentStatus === 'PAID' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}>
                    {student.paymentStatus === 'PAID' ? '✓' : '!'}
                  </div>
                  <div>
                    <p className="font-extrabold text-sm">
                      {student.paymentStatus === 'PAID' ? "Ushbu oy uchun to'lov qilingan" : "Muddati o'tgan qarzdorlik mavjud"}
                    </p>
                    <p className="text-xs font-medium opacity-90 mt-0.5">
                      Keyingi to'lov sanasi: <strong className="font-extrabold font-mono underline">{formatDateUz(student.nextPaymentDueDate)}</strong>
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  student.paymentStatus === 'PAID' ? 'bg-emerald-200/60 text-emerald-900' : 'bg-rose-200/60 text-rose-900'
                }`}>
                  {student.paymentStatus === 'PAID' ? "To'langan" : "Qarzdor"}
                </span>
              </div>
            )}

            {/* Independent Payment Periods Breakdown */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Oylik To'lov Bosqichlari (Mustaqil Davrlar)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {periods.map((p: any) => (
                  <div key={p.periodIndex} className={`p-3.5 rounded-2xl border ${
                    p.status === 'PAID' ? 'bg-emerald-50/50 border-emerald-100' :
                    p.status === 'OVERDUE' ? 'bg-rose-50/50 border-rose-100' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>{p.periodIndex}-Oy Davri</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        p.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.statusText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Muddati: {p.dueDate}</p>
                    <p className="text-xs font-extrabold text-slate-900 mt-2">{formatMoneyUz(p.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
              <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">Qabul Qilingan To'lovlar</div>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                  <tr>
                    <th className="p-3">Sana</th>
                    <th className="p-3">Summa</th>
                    <th className="p-3">To'lov Usuli</th>
                    <th className="p-3">Izoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payments.length === 0 ? (
                    <tr><td colSpan={4} className="p-6 text-center text-slate-400">To'lovlar topilmadi</td></tr>
                  ) : (
                    payments.map((pay: any) => (
                      <tr key={pay._id}>
                        <td className="p-3 font-semibold">{formatDateUz(pay.paymentDate)}</td>
                        <td className="p-3 font-bold text-emerald-600">{formatMoneyUz(pay.amount)}</td>
                        <td className="p-3 font-semibold">{pay.paymentMethod}</td>
                        <td className="p-3 text-slate-500">{pay.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-semibold">Umumiy Davomat Ko'rsatkichi</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{attendanceStats.percentage || 100}%</p>
              </div>
              <div className="flex space-x-4 text-xs font-semibold">
                <div className="text-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl">
                  <p className="text-lg font-bold">{attendanceStats.present || 0}</p>
                  <p className="text-[10px]">Kelgan</p>
                </div>
                <div className="text-center px-4 py-2 bg-rose-50 text-rose-700 rounded-2xl">
                  <p className="text-lg font-bold">{attendanceStats.absent || 0}</p>
                  <p className="text-[10px]">Kelmagan</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                  <tr>
                    <th className="p-3">Sana</th>
                    <th className="p-3">Holati</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attendances.length === 0 ? (
                    <tr><td colSpan={2} className="p-6 text-center text-slate-400">Davomat yozuvlari yo'q</td></tr>
                  ) : (
                    attendances.map((att: any) => (
                      <tr key={att._id}>
                        <td className="p-3 font-semibold">{att.date}</td>
                        <td className="p-3">
                          {att.status === 'PRESENT' ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ Kelgan</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">✕ Kelmagan</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Exams */}
        {activeTab === 'exams' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {exams.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center text-slate-400 text-xs">
                Hali imtihonlar yo'q
              </div>
            ) : (
              exams.map((ex: any) => (
                <div key={ex._id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{ex.examId?.name || 'Imtihon'}</h4>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Sana: {formatDateUz(ex.examId?.examDate)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900">
                        {ex.score !== null ? `${ex.score} / ${ex.examId?.maxScore || 100}` : '-'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      ex.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' :
                      ex.status === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {ex.status === 'PASSED' ? '🟢 O\'tdi' : ex.status === 'FAILED' ? '🔴 O\'tmadi' : '⚪ Qatnashmadi'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
