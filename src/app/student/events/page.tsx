'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Coins,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export default function StudentEventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/events', { headers });
      if (res.ok) {
        const json = await res.json();
        setEvents(json.events || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string, isRegistered: boolean) => {
    try {
      setActionLoading(eventId);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          eventId,
          action: isRegistered ? 'UNREGISTER' : 'REGISTER',
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchEvents();
      } else {
        alert(json.error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-2">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FF2A85]/15 to-[#FF7A00]/15 border border-[#FF2A85]/20 px-3.5 py-1 rounded-full text-[11px] font-bold text-[#FF2A85]">
          <Calendar className="w-3.5 h-3.5" />
          <span>AKADEMIYA TADBIRLARI VA HAKATONLAR</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">IT Tadbirlar & Masterklasslar</h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
          Tadbirlarda faol qatnashib, yangi bilimlar oling, mentorlar bilan muloqot qiling va qo'shimcha InFast XCoinlarni qo'lga kiriting!
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-8 h-8 border-3 border-[#FF2A85] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400">Tadbirlar ro'yxati yuklanmoqda...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-neutral-900/40 border border-white/10 space-y-3">
          <Calendar className="w-12 h-12 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Yaqin orada tadbirlar rejalashtirilmagan</h3>
          <p className="text-xs text-neutral-400">Yangi tadbirlar e'lon qilinganda bu yerda ko'rinadi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => {
            const isLoading = actionLoading === evt._id;
            return (
              <div
                key={evt._id}
                className="p-6 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-5 flex flex-col justify-between shadow-xl hover:border-white/20 transition-all group"
              >
                <div className="space-y-4">
                  {/* Top tags */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00F0FF] font-mono font-bold">
                      <Coins className="w-3.5 h-3.5" />
                      <span>+{evt.coinReward || 500} XCoin</span>
                    </span>

                    <span className="text-[11px] text-neutral-400 font-mono">
                      {evt.participantsCount || 0} / {evt.maxParticipants || 100} ishtirokchi
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white group-hover:text-white transition-colors">
                    {evt.title}
                  </h3>

                  <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                    {evt.description || "Ushbu tadbirda qatnashib, real keyslarni tahlil qiling va bilimlaringizni oshiring."}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-white/[0.06] text-xs text-neutral-300">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-[#FF7A00]" />
                      <span>
                        {evt.date ? new Date(evt.date).toLocaleString('uz-UZ', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : "Tez orada"}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-[#00F0FF]" />
                      <span>{evt.location || "InFast IT-Academy Asosiy Zal"}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  {evt.isRegistered ? (
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Siz ro'yxatdan o'tgansiz</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-neutral-400">Qatnashish mutlaqo bepul</span>
                  )}

                  <button
                    onClick={() => handleRegister(evt._id, evt.isRegistered)}
                    disabled={isLoading}
                    className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95 flex items-center space-x-1.5 ${
                      evt.isRegistered
                        ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md shadow-[#FF2A85]/20 hover:scale-105'
                    }`}
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : evt.isRegistered ? (
                      <span>Bekor qilish</span>
                    ) : (
                      <>
                        <span>Qatnashish</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}