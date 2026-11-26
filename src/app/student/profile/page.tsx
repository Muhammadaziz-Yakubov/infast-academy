'use client';

import React, { useState, useEffect } from 'react';
import { useStudent } from '../layout';
import {
  User,
  Phone,
  Building2,
  Users,
  BookOpen,
  Calendar,
  CreditCard,
  KeyRound,
  Camera,
  LogOut,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
  Check,
  Award,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://api.dicebear.com/7.x/bottts/png?seed=developer1',
  'https://api.dicebear.com/7.x/bottts/png?seed=codefast',
];

export default function StudentProfilePage() {
  const { studentData, refreshData, logout } = useStudent();

  // Modals & form state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const student = studentData?.student || {};
  const branch = student.branchId || {};
  const group = student.groupId || {};
  const course = student.courseId || {};
  const payments = studentData?.paymentHistory || [];
  const attendances = studentData?.attendanceHistory || [];

  const handleSelectAvatar = async (url: string) => {
    try {
      setUpdatingAvatar(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({ avatarUrl: url }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await refreshData();
        setAvatarModalOpen(false);
      } else {
        alert(json.error || "Rasm yangilashda xatolik");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setUpdatingAvatar(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: "Yangi parollar bir-biriga mos kelmadi" });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordStatus({ type: 'error', message: "Parol kamida 4 ta belgidan iborat bo'lishi kerak" });
      return;
    }

    try {
      setUpdatingPassword(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('student_token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/student/profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setPasswordStatus({ type: 'success', message: "Parol muvaffaqiyatli yangilandi!" });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordStatus({ type: 'error', message: json.error || "Parolni o'zgartirishda xatolik" });
      }
    } catch (e: any) {
      setPasswordStatus({ type: 'error', message: "Tarmoq xatosi: " + e.message });
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      
      {/* Profile Overview Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF2A85]/15 to-[#00F0FF]/15 blur-[60px] pointer-events-none" />

        {/* Avatar with change button */}
        <div className="relative group shrink-0">
          <img
            src={student.avatarUrl || 'https://api.dicebear.com/7.x/bottts/png?seed=profile1'}
            alt="Avatar"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-white/20 shadow-2xl"
          />
          <button
            onClick={() => setAvatarModalOpen(true)}
            className="absolute -bottom-2 -right-2 p-2 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white shadow-lg shadow-[#FF2A85]/30 hover:scale-110 active:scale-95 transition-all"
            title="Rasmni o'zgartirish"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {student.firstName} {student.lastName}
              </h2>
              <span className="text-xs font-mono font-bold text-[#00F0FF]">
                Talaba ID: {student.studentCode || "INFAST-STUDENT"}
              </span>
            </div>

            <button
              onClick={logout}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-all self-center sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Chiqish</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/[0.06] text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">Telefon:</span>
              <span className="text-neutral-200 font-semibold">{student.phone || "+998"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Kurs:</span>
              <span className="text-neutral-200 font-semibold">{course.name || student.courseName || "Dasturlash"}</span>
            </div>
            <div>
              <span className="text-neutral-500 block text-[10px]">Filial:</span>
              <span className="text-neutral-200 font-semibold">{branch.name || "InFast Bosh"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Password Form & Academic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Change Password Card */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-5">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#FF7A00]" /> Parolni O'zgartirish
          </h3>

          {passwordStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center space-x-2 ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {passwordStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordStatus.message}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Amaldagi Parol
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Yangi Parol
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Kamida 4 ta belgi"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1.5">
                Yangi Parolni Qayta Kiriting
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Qayta kiriting"
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-neutral-500 focus:outline-none focus:border-[#00F0FF]"
              />
            </div>

            <button
              type="submit"
              disabled={updatingPassword}
              className="w-full py-3 rounded-full bg-gradient-to-r from-[#FF2A85] to-[#FF7A00] text-white font-bold text-xs shadow-md shadow-[#FF2A85]/20 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {updatingPassword ? "Yangilanmoqda..." : "Parolni Saqlash"}
            </button>
          </form>
        </div>

        {/* Payment History & Fee Info */}
        <div className="p-6 rounded-3xl bg-neutral-900/40 border border-white/[0.08] backdrop-blur-2xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#00F0FF]" /> To'lovlar Tarixi
          </h3>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
            {payments.length === 0 ? (
              <p className="text-xs text-neutral-500 py-6 text-center">To'lovlar tarixi mavjud emas</p>
            ) : (
              payments.map((p: any, i: number) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/[0.04] flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">
                      {(p.amount || 0).toLocaleString()} so'm
                    </span>
                    <span className="text-[10px] text-neutral-400">
                      {p.paymentMethod || "Karta orqali"} • {p.date ? new Date(p.date).toLocaleDateString('uz-UZ') : ""}
                    </span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                    To'langan
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Preset Avatars Selection Modal */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Yangi Profil Rasmini Tanlang</h3>
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {PRESET_AVATARS.map((url, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectAvatar(url)}
                  disabled={updatingAvatar}
                  className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white/10 hover:border-[#FF2A85] hover:scale-105 active:scale-95 transition-all"
                >
                  <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {updatingAvatar && (
              <p className="text-xs text-center text-neutral-400">Rasm yangilanmoqda...</p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}