'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import {
  CalendarCheck,
  Calendar as CalendarIcon,
  CheckCircle2,
  Lock,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [groups, setGroups] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [inFuture, setInFuture] = useState(false);
  const [isScheduledDay, setIsScheduledDay] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup && selectedDate) {
      fetchAttendance();
    }
  }, [selectedGroup, selectedDate]);

  const fetchGroups = async () => {
    try {
      const res = await fetch('/api/groups');
      if (res.ok) {
        const data = await res.json();
        setGroups(data.groups || []);
        if (data.groups?.length > 0) {
          setSelectedGroup(data.groups[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/attendance?groupId=${selectedGroup}&date=${selectedDate}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
        setInFuture(data.inFuture || false);
        setIsScheduledDay(data.isScheduledDay !== false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAttendance = async (studentId: string, currentStatus: string | null) => {
    if (inFuture) return;

    let nextStatus: 'PRESENT' | 'ABSENT';
    if (!currentStatus || currentStatus === 'ABSENT') {
      nextStatus = 'PRESENT';
    } else {
      nextStatus = 'ABSENT';
    }

    setStudents((prev) =>
      prev.map((s) => (s._id === studentId ? { ...s, status: nextStatus } : s))
    );

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroup,
          date: selectedDate,
          studentId,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        showToast("✓ Saqlandi");
      } else {
        const err = await res.json();
        alert(err.error || "Saqlashda xatolik");
        fetchAttendance();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  return (
    <div className="flex-1 pb-12 relative">
      <Header title="Davomat" />

      {/* Auto-Save Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-slate-900 text-white font-bold text-xs rounded-2xl shadow-2xl flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="p-6 space-y-6 max-w-4xl mx-auto">
        {/* Date & Group Selector Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <CalendarIcon className="w-5 h-5 text-infast-500 shrink-0" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">Guruh:</span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name} ({g.courseId?.name})</option>
              ))}
            </select>
          </div>
        </div>

        {/* FUTURE ATTENDANCE LOCK BANNER */}
        {inFuture && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center space-x-3 shadow-sm"
          >
            <Lock className="w-5 h-5 text-amber-600 shrink-0" />
            <span>🔒 Davomat hali ochilmadi. Kelgusi sanalar uchun davomat belgilab bo'lmaydi.</span>
          </motion.div>
        )}

        {/* NON-SCHEDULED DAY BANNER */}
        {!inFuture && !isScheduledDay && (
          <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-slate-400 shrink-0" />
            <span>Ushbu sanada dars rejalashtirilmagan. Davomat faqat dars kunlarida olinadi.</span>
          </div>
        )}

        {/* Touch-Friendly Circular Attendance Control Grid */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900">Talabalar Davomati</h3>
            <span className="text-xs text-slate-400 font-medium">Bosing: PRESENT (✓) / ABSENT (✕)</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Yuklanmoqda...</div>
          ) : students.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">Guruhda faol talabalar topilmadi</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {students.map((st) => {
                const isPresent = st.status === 'PRESENT';
                const isAbsent = st.status === 'ABSENT';

                return (
                  <div
                    key={st._id}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-2xl transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 font-bold text-xs text-slate-700 flex items-center justify-center">
                        {st.firstName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900">{st.firstName} {st.lastName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{st.phone}</p>
                      </div>
                    </div>

                    {/* Touch-Friendly Large Circular Toggle Control */}
                    <button
                      disabled={inFuture}
                      onClick={() => handleToggleAttendance(st._id, st.status)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 transform active:scale-95 border-2 ${
                        inFuture
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 border-slate-200 text-slate-400'
                          : isPresent
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : isAbsent
                          ? 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/30'
                          : 'bg-white border-slate-300 hover:border-infast-400 text-slate-400'
                      }`}
                    >
                      {isPresent && <Check className="w-6 h-6 stroke-[3]" />}
                      {isAbsent && <X className="w-6 h-6 stroke-[3]" />}
                      {!isPresent && !isAbsent && <span className="w-3 h-3 rounded-full bg-slate-300" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
