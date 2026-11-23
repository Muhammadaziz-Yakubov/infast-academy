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
  Unlock,
} from 'lucide-react';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
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

  const handleUnlockNextLesson = async () => {
    if (!group) return;
    if (!confirm(`"${group.name}" guruhi uchun navbatdagi dars barcha o'quvchilarga ochilsinmi?\n\nEslatma: Agar o'quvchi oldingi darsni tugatmagan bo'lsa, dars ochiladi, ammo avvalgi dars bajarilgandan so'ng faollashadi.`)) {
      return;
    }

    try {
      setUnlocking(true);
      const res = await fetch(`/api/groups/${groupId}/unlock-next-lesson`, {
        method: 'POST',
      });
      const resJson = await res.json();
      if (res.ok) {
        alert(resJson.message || "Keyingi dars ochildi!");
        fetchGroupDetail();
      } else {
        alert(resJson.error || "Darsni ochishda xatolik yuz berdi");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUnlocking(false);
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
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Guruhlar ro'yxatiga qaytish
        </button>

        {/* Group Banner Header */}
        <div className="apple-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-infast-600 dark:text-infast-400 bg-infast-500/10 border border-infast-500/20 px-3 py-1 rounded-xl">
              {group.courseId?.name || 'Kurs'}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-2.5">{group.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Ustoz: <strong className="text-slate-800 dark:text-slate-200">Muhammadaziz Yakubov</strong> • Xona: <strong className="text-slate-800 dark:text-slate-200">{group.room}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <button
              onClick={handleUnlockNextLesson}
              disabled={unlocking}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl flex items-center space-x-1.5 shadow-apple-sm transition-all"
            >
              <Unlock className="w-4 h-4" />
              <span>{unlocking ? 'Ochilmoqda...' : 'Keyingi darsni ochish'}</span>
            </button>

            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] text-center min-w-[70px]">
              <p className="text-slate-400 dark:text-slate-500 font-semibold text-[11px]">Talabalar</p>
              <p className="text-base font-bold text-slate-900 dark:text-white">{students.length} ta</p>
            </div>
            <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20 text-center">
              <p className="text-sky-600 dark:text-sky-400 font-semibold text-[11px]">Telegram Chat ID</p>
              <p className="text-xs font-mono font-bold text-sky-800 dark:text-sky-300">{group.telegramChatId || "Yo'q"}</p>
            </div>
          </div>
        </div>

        {/* Tabs - Apple Segmented Control */}
        <div className="flex p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] gap-1 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'students', label: `Talabalar (${students.length})` },
            { id: 'attendance', label: 'Davomat (Faqat Ko\'rish)' },
            { id: 'payments', label: 'To\'lovlar' },
            { id: 'info', label: 'Ma\'lumotlar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#1E1E24] text-slate-900 dark:text-white shadow-apple-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Students List */}
        {activeTab === 'students' && (
          <div className="apple-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] font-bold text-slate-400 uppercase text-[11px]">
                  <tr>
                    <th className="p-3.5">Talaba</th>
                    <th className="p-3.5">Telefon</th>
                    <th className="p-3.5">Ota-ona telefoni</th>
                    <th className="p-3.5">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                  {students.map((s: any) => (
                    <tr key={s._id} className="hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <Link href={`/students/${s._id}`} className="hover:text-infast-600 dark:hover:text-infast-400">
                          {s.firstName} {s.lastName}
                        </Link>
                      </td>
                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">{s.phone}</td>
                      <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400">{s.parentPhone || '-'}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Attendance READ-ONLY (CRITICAL BUSINESS RULE 5) */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            {/* READ ONLY BANNER */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Ushbu sahifadagi davomat FAQT KO'RISH uchun. Davomatni o'zgartirish uchun Asosiy Davomat sahifasiga o'ting.</span>
              </div>
              <Link
                href="/attendance"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs flex items-center shrink-0 shadow-apple-sm transition-all"
              >
                <span>Davomat Sahifasiga O'tish</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="apple-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] font-bold text-slate-400">
                    <tr>
                      <th className="p-3.5">Sana</th>
                      <th className="p-3.5">Talaba</th>
                      <th className="p-3.5">Holati (Read-Only)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                    {attendances.length === 0 ? (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-400">Davomat yozuvlari mavjud emas</td></tr>
                    ) : (
                      attendances.map((att: any) => (
                        <tr key={att._id}>
                          <td className="p-3.5 font-bold text-slate-900 dark:text-white">{att.date}</td>
                          <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">{att.studentId?.firstName} {att.studentId?.lastName}</td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              att.status === 'PRESENT' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' : 'bg-rose-500/15 text-rose-700 dark:text-rose-400'
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
          </div>
        )}

        {/* Tab 3: Payments */}
        {activeTab === 'payments' && (
          <div className="apple-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] font-bold text-slate-400">
                  <tr>
                    <th className="p-3.5">Sana</th>
                    <th className="p-3.5">Talaba</th>
                    <th className="p-3.5">Summa</th>
                    <th className="p-3.5">Usul</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                  {payments.map((p: any) => (
                    <tr key={p._id}>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300">{formatDateUz(p.paymentDate)}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.studentId?.firstName} {p.studentId?.lastName}</td>
                      <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{formatMoneyUz(p.amount)}</td>
                      <td className="p-3.5 text-slate-500 dark:text-slate-400">{p.paymentMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Information */}
        {activeTab === 'info' && (
          <div className="apple-card p-6 space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Dars Jadvali</h3>
            <div className="flex flex-wrap gap-2.5">
              {group.schedules?.map((s: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/[0.08]">
                  <p className="font-bold text-slate-900 dark:text-white">{s.dayOfWeek}</p>
                  <p className="text-[11px] text-infast-600 dark:text-infast-400 font-semibold mt-0.5">{s.startTime} - {s.endTime}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
