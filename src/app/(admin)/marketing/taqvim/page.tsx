'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Instagram,
  Send,
  Video,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';

export default function KontentTaqvimiPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/content');
      const data = await res.json();
      if (data.success) {
        setContents(data.contents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">📅</span>
            Kontent taqvimi
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chiqadigan kontentlar va postlarning oylik va haftalik taqvim ko'rinishi
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="font-bold text-sm text-slate-900 dark:text-white min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>

          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        {/* Days Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>Dush</div>
          <div>Sesh</div>
          <div>Chor</div>
          <div>Pay</div>
          <div>Jum</div>
          <div>Shan</div>
          <div>Yak</div>
        </div>

        {/* Month Days */}
        <div className="grid grid-cols-7 gap-2">
          {daysInMonth.map((day, idx) => {
            const dayContents = contents.filter(
              (c) => c.scheduledAt && isSameDay(new Date(c.scheduledAt), day)
            );

            return (
              <div
                key={idx}
                className="min-h-[110px] p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-2 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={`font-bold ${isSameDay(day, new Date()) ? 'w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center' : 'text-slate-700 dark:text-slate-300'}`}>
                    {format(day, 'd')}
                  </span>
                  {dayContents.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md">
                      {dayContents.length} ta
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 overflow-y-auto max-h-[70px]">
                  {dayContents.map((c) => (
                    <div
                      key={c._id}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] shadow-2xs font-semibold text-slate-900 dark:text-white truncate"
                      title={c.title}
                    >
                      <span className="text-amber-500 font-bold mr-1">[{c.platform}]</span>
                      {c.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
