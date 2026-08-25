'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import {
  Folder,
  Users,
  MapPin,
  Send,
  CalendarCheck,
  CreditCard,
  Info,
  ArrowLeft,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'students' | 'attendance' | 'payments' | 'info'>('students');

  useEffect(() => {
    fetchGroupDetail();
  }, [groupId]);

  const fetchGroupDetail = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
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

  const group = data?.group;
  const students = data?.students || [];
  const attendances = data?.attendances || [];
  const payments = data?.payments || [];

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <Header title="Guruh Tafsilotlari" />
        <div className="py-20 text-center text-slate-400">Guruh yuklanmoqda...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex-1 p-6">
        <Header title="Guruh Tafsilotlari" />
        <div className="py-20 text-center text-rose-500">Guruh topilmadi</div>
      </div>
    );
  }

  return (
    <div className="flex-1 pb-12">
      <Header title={`Guruh: ${group.name}`} />

      <main className="p-6 space-y-6 max-w-6xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Guruhlar ro'yxatiga qaytish
        </button>

        {/* Group Banner Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold text-infast-600 bg-infast-50 px-3 py-1 rounded-xl">
              {group.courseId?.name || 'Kurs'}
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900 mt-2">{group.name}</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Ustoz: <strong className="text-slate-800">{group.teacherId ? `${group.teacherId.firstName} ${group.teacherId.lastName}` : '-'}</strong> • Xona: <strong className="text-slate-800">{group.room}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
              <p className="text-slate-400 font-semibold">Talabalar</p>
              <p className="text-lg font-bold text-slate-900">{students.length} ta</p>
            </div>
            <div className="p-3 bg-sky-50 rounded-2xl border border-sky-100 text-center">
              <p className="text-sky-600 font-semibold">Telegram Chat ID</p>
              <p className="text-xs font-mono font-bold text-sky-800">{group.telegramChatId || "Yo'q"}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
          {[
            { id: 'students', label: `Talabalar (${students.length})` },
            { id: 'attendance', label: 'Davomat (Faqat Ko\'rish)' },
            { id: 'payments', label: 'To\'lovlar' },
            { id: 'info', label: 'Ma\'lumotlar' },
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
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-infast-500 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Tab 1: Students List */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase">
                <tr>
                  <th className="p-3.5">Talaba</th>
                  <th className="p-3.5">Telefon</th>
                  <th className="p-3.5">Ota-ona telefoni</th>
                  <th className="p-3.5">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {students.map((s: any) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">
                      <Link href={`/students/${s._id}`} className="hover:text-infast-600">
                        {s.firstName} {s.lastName}
                      </Link>
                    </td>
                    <td className="p-3.5 font-mono">{s.phone}</td>
                    <td className="p-3.5 font-mono">{s.parentPhone || '-'}</td>
                    <td className="p-3.5 font-semibold text-emerald-600">{s.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Attendance READ-ONLY (CRITICAL BUSINESS RULE 5) */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {/* READ ONLY BANNER */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Ushbu sahifadagi davomat FAQT KO'RISH uchun. Davomatni o'zgartirish uchun Asosiy Davomat sahifasiga o'ting.</span>
              </div>
              <Link
                href="/attendance"
                className="px-3 py-1.5 bg-amber-600 text-white hover:bg-amber-700 font-bold rounded-xl text-xs flex items-center shrink-0"
              >
                <span>Davomat Sahifasiga O'tish</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                  <tr>
                    <th className="p-3.5">Sana</th>
                    <th className="p-3.5">Talaba</th>
                    <th className="p-3.5">Holati (Read-Only)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {attendances.length === 0 ? (
                    <tr><td colSpan={3} className="p-6 text-center text-slate-400">Davomat yozuvlari mavjud emas</td></tr>
                  ) : (
                    attendances.map((att: any) => (
                      <tr key={att._id}>
                        <td className="p-3.5 font-bold text-slate-900">{att.date}</td>
                        <td className="p-3.5 font-medium">{att.studentId?.firstName} {att.studentId?.lastName}</td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold opacity-80 ${
                            att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {att.status === 'PRESENT' ? '✓ Kelgan' : '✕ Kelmagan'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'payments' && (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400">
                <tr>
                  <th className="p-3.5">Sana</th>
                  <th className="p-3.5">Talaba</th>
                  <th className="p-3.5">Summa</th>
                  <th className="p-3.5">Usul</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.map((p: any) => (
                  <tr key={p._id}>
                    <td className="p-3.5">{formatDateUz(p.paymentDate)}</td>
                    <td className="p-3.5 font-bold">{p.studentId?.firstName} {p.studentId?.lastName}</td>
                    <td className="p-3.5 font-bold text-emerald-600">{formatMoneyUz(p.amount)}</td>
                    <td className="p-3.5">{p.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Information */}
        {activeTab === 'info' && (
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Dars Jadvali</h3>
            <div className="flex flex-wrap gap-2">
              {group.schedules?.map((s: any, idx: number) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="font-bold text-slate-900">{s.dayOfWeek}</p>
                  <p className="text-[11px] text-infast-600 font-semibold">{s.startTime} - {s.endTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
