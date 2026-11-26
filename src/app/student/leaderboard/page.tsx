'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Coins,
  Crown,
  Medal,
  Users,
  Building2,
  Globe,
  Sparkles,
} from 'lucide-react';

export default function StudentLeaderboardPage() {
  const [scope, setScope] = useState<'group' | 'branch' | 'all'>('group');
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [scope]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/student/leaderboard?scope=${scope}`, { headers });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error('Leaderboard error:', e);
    } finally {
      setLoading(false);
    }
  };

  const students = data?.leaderboard || [];
  const myRank = data?.myRank;

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      
      {/* Header with Scope Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/15 to-[#FF7A00]/15 border border-amber-500/20 px-3.5 py-1 rounded-full text-[11px] font-bold text-amber-400">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>TALABALAR REYTINGI</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Top Dasturchilar</h1>
          <p className="text-xs text-neutral-400">
            Darslar, testlar va faollik uchun to'plangan umumiy XP reytingi
          </p>
        </div>

        {/* Scope Switcher Tabs */}
        <div className="flex items-center bg-black/50 p-1.5 rounded-full border border-white/10 shrink-0">
          <button
            onClick={() => setScope('group')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              scope === 'group'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Mening Guruhim
          </button>
          <button
            onClick={() => setScope('branch')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              scope === 'branch'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Filial
          </button>
          <button
            onClick={() => setScope('all')}
            className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              scope === 'all'
                ? 'bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Butun Akademiya
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400">Reyting yuklanmoqda...</p>
        </div>
      ) : (
        <div className="space-y-4">
          
          {/* Top 3 Podium Cards */}
          {students.length >= 3 && (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 pt-4 pb-2 items-end">
              {/* 2nd Place */}
              <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/40 border border-white/10 text-center space-y-2 order-1 backdrop-blur-xl">
                <div className="relative inline-block">
                  <img
                    src={students[1]?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=silver'}
                    alt="Silver"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto border-2 border-slate-300 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center">
                    2
                  </div>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                  {students[1]?.firstName} {students[1]?.lastName}
                </h4>
                <div className="text-[11px] font-mono font-bold text-slate-300">
                  {students[1]?.xp || 0} XP
                </div>
              </div>

              {/* 1st Place */}
              <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-amber-500/20 to-neutral-900/60 border border-amber-500/40 text-center space-y-2.5 order-2 shadow-2xl shadow-amber-500/10 backdrop-blur-xl -translate-y-2 sm:-translate-y-4">
                <div className="relative inline-block">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-400">
                    <Crown className="w-6 h-6 fill-amber-400 animate-bounce" />
                  </div>
                  <img
                    src={students[0]?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=gold'}
                    alt="Gold"
                    className="w-14 h-14 sm:w-20 sm:h-20 rounded-full mx-auto border-2 border-amber-400 object-cover shadow-lg shadow-amber-500/30"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                    1
                  </div>
                </div>
                <h4 className="font-bold text-sm sm:text-base text-white truncate">
                  {students[0]?.firstName} {students[0]?.lastName}
                </h4>
                <div className="text-xs font-mono font-black text-amber-400">
                  {students[0]?.xp || 0} XP
                </div>
              </div>

              {/* 3rd Place */}
              <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/40 border border-white/10 text-center space-y-2 order-3 backdrop-blur-xl">
                <div className="relative inline-block">
                  <img
                    src={students[2]?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=bronze'}
                    alt="Bronze"
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto border-2 border-amber-700 object-cover"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center">
                    3
                  </div>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white truncate">
                  {students[2]?.firstName} {students[2]?.lastName}
                </h4>
                <div className="text-[11px] font-mono font-bold text-amber-600">
                  {students[2]?.xp || 0} XP
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard List */}
          <div className="rounded-3xl bg-neutral-900/40 border border-white/[0.08] overflow-hidden backdrop-blur-2xl divide-y divide-white/[0.04]">
            {students.map((st: any, idx: number) => {
              const isMe = st.isCurrent;
              return (
                <div
                  key={st._id}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 transition-colors ${
                    isMe
                      ? 'bg-gradient-to-r from-[#FF2A85]/15 to-[#00F0FF]/15 border-l-4 border-l-[#FF2A85]'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <span className="w-7 font-mono font-black text-sm text-neutral-400 text-center">
                      #{idx + 1}
                    </span>

                    <img
                      src={st.avatarUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=' + st._id}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs sm:text-sm text-white truncate">
                          {st.firstName} {st.lastName}
                        </span>
                        {isMe && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#FF2A85]/20 text-[#FF2A85] border border-[#FF2A85]/30">
                            Siz
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 truncate">
                        {st.branchName || "InFast"} • {st.groupName || "Guruh"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0 font-mono text-xs font-bold">
                    <div className="text-right">
                      <span className="block text-amber-400">{st.xp || 0} XP</span>
                      <span className="text-[10px] text-neutral-500 font-normal">
                        +{st.xcoin || 0} Coin
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}