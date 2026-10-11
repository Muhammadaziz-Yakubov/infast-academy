'use client';

import React, { useState, useEffect } from 'react';
import { formatDateUz } from '@/lib/utils';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Award,
  Coins,
  CreditCard,
  Building2,
  Calendar,
  Unlock,
  FileCheck,
  Code,
  Filter,
} from 'lucide-react';

interface ActivityItem {
  _id: string;
  type: string;
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface ActivityHistoryTabProps {
  studentId: string;
}

export default function ActivityHistoryTab({ studentId }: ActivityHistoryTabProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [studentId, page, filterType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const url = `/api/students/${studentId}/activities?page=${page}&limit=15${
        filterType !== 'ALL' ? `&type=${filterType}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setActivities(json.activities || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'LESSON_COMPLETED':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          label: 'Dars Yakunlandi',
        };
      case 'TEST_PASSED':
        return {
          icon: <FileCheck className="w-4 h-4 text-indigo-600" />,
          bgColor: 'bg-indigo-50 border-indigo-200 text-indigo-800',
          label: "Test O'tildi",
        };
      case 'TEST_ATTEMPT':
        return {
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
          label: 'Test Urinishi',
        };
      case 'LESSON_UNLOCKED':
        return {
          icon: <Unlock className="w-4 h-4 text-blue-600" />,
          bgColor: 'bg-blue-50 border-blue-200 text-blue-800',
          label: 'Dars Ochildi',
        };
      case 'PRACTICE_SUBMITTED':
        return {
          icon: <Code className="w-4 h-4 text-teal-600" />,
          bgColor: 'bg-teal-50 border-teal-200 text-teal-800',
          label: 'Amaliyot',
        };
      case 'XP_EARNED':
        return {
          icon: <Award className="w-4 h-4 text-amber-600" />,
          bgColor: 'bg-amber-50 border-amber-200 text-amber-800',
          label: 'XP Berildi',
        };
      case 'COIN_EARNED':
        return {
          icon: <Coins className="w-4 h-4 text-orange-600" />,
          bgColor: 'bg-orange-50 border-orange-200 text-orange-800',
          label: 'XCoin Berildi',
        };
      case 'PAYMENT_MADE':
        return {
          icon: <CreditCard className="w-4 h-4 text-emerald-600" />,
          bgColor: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          label: "To'lov",
        };
      case 'BRANCH_TRANSFERRED':
        return {
          icon: <Building2 className="w-4 h-4 text-purple-600" />,
          bgColor: 'bg-purple-50 border-purple-200 text-purple-800',
          label: "Ko'chirish",
        };
      case 'ATTENDANCE_MARKED':
        return {
          icon: <Calendar className="w-4 h-4 text-sky-600" />,
          bgColor: 'bg-sky-50 border-sky-200 text-sky-800',
          label: 'Davomat',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-600" />,
          bgColor: 'bg-slate-50 border-slate-200 text-slate-800',
          label: 'Faoliyat',
        };
    }
  };

  const filterTabs = [
    { id: 'ALL', label: 'Barchasi' },
    { id: 'TEST_PASSED', label: 'Testlar' },
    { id: 'LESSON_COMPLETED', label: 'Tugatilgan Darslar' },
    { id: 'LESSON_UNLOCKED', label: 'Ochilgan Darslar' },
    { id: 'XP_EARNED', label: 'XP & Mukofotlar' },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                setFilterType(f.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === f.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Jami faoliyatlar: <strong className="text-slate-900">{total} ta</strong>
        </span>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Faoliyat tarixi yuklanmoqda...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-2">
            <Clock className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">Ushbu parametr bo'yicha hech qanday faoliyat topilmadi</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {activities.map((act) => {
              const badge = getEventBadge(act.type);
              const dateStr = formatDateUz(act.createdAt);
              const timeStr = new Date(act.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={act._id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-slate-400 group-hover:bg-infast-500 shadow-sm transition-colors" />

                  <div className="bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-100 transition-all space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase flex items-center gap-1 ${badge.bgColor}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900">{act.title}</h4>
                      </div>

                      <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {dateStr} {timeStr}
                      </span>
                    </div>

                    {act.description && <p className="text-xs text-slate-600">{act.description}</p>}

                    {act.metadata && Object.keys(act.metadata).length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-2 text-[10px] font-mono text-slate-500">
                        {act.metadata.score !== undefined && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Natija: {act.metadata.score}/{act.metadata.maxScore}
                          </span>
                        )}
                        {act.metadata.xpEarned && (
                          <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200 font-bold">
                            +{act.metadata.xpEarned} XP
                          </span>
                        )}
                        {act.metadata.unlockedBy && (
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                            Ochdi: {act.metadata.unlockedBy}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 text-xs">
            <span className="text-slate-500">
              Sahifa {page} / {totalPages}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40"
              >
                Oldingi
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold disabled:opacity-40"
              >
                Keyingi
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
