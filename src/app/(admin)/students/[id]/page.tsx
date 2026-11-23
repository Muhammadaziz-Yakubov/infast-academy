'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import TransferModal from '@/components/students/TransferModal';
import LessonMapTab from '@/components/students/LessonMapTab';
import ActivityHistoryTab from '@/components/students/ActivityHistoryTab';
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
  Building2,
  ArrowRightLeft,
  Sparkles,
  Award,
  Coins,
  Key,
  Lock,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const [data, setData] = useState<any>(null);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userSession, setUserSession] = useState<{ role?: string } | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'lesson_map' | 'activities' | 'payments' | 'attendance' | 'exams' | 'portfolio'>('overview');
  const [lmsStats, setLmsStats] = useState<{ xp: number; xcoin: number; level: number } | null>(null);

  // Portfolio tab state
  const [portfolioForm, setPortfolioForm] = useState({
    slug: '',
    avatarUrl: '',
    bio: '',
    skillsStr: '',
    githubUrl: '',
    linkedinUrl: '',
    telegramUsername: '',
    isPublicPortfolio: true,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    githubRepo: '',
    liveDemo: '',
    technologiesStr: '',
  });
  const [savingPortfolio, setSavingPortfolio] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleGeneratePassword = async () => {
    if (!confirm("Talaba uchun yangi vaqtinchalik parol yaratilsinmi?")) return;
    setIsResettingPassword(true);
    try {
      const res = await fetch('/api/students/' + studentId + '/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setGeneratedPassword(json.password);
        setPasswordCopied(false);
      } else {
        alert(json.error || "Parol yaratishda xatolik yuz berdi");
      }
    } catch (e) {
      alert("Server xatosi");
    } finally {
      setIsResettingPassword(false);
    }
  };


  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      alert("Iltimos, yangi parol kiriting");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      if (res.ok) {
        alert("O'quvchi paroli muvaffaqiyatli o'rnatildi!");
        setShowPasswordModal(false);
        setNewPassword('');
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setSavingPassword(false);
    }
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((meData) => {
        if (meData.authenticated) {
          setUserSession(meData.user);
        }
      })
      .catch((e) => console.error(e));
  }, []);

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

      const transferRes = await fetch(`/api/students/${studentId}/transfer`);
      if (transferRes.ok) {
        const tJson = await transferRes.json();
        setTransfers(tJson.transfers || []);
      }

      const lmsRes = await fetch(`/api/students/${studentId}/progress`);
      if (lmsRes.ok) {
        const lmsJson = await lmsRes.json();
        if (lmsJson.progress) {
          setLmsStats({
            xp: lmsJson.progress.xp || 0,
            xcoin: lmsJson.progress.xcoin || 0,
            level: lmsJson.progress.level || 1,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (data?.student) {
      const s = data.student;
      const defaultSlug = s.slug || `${s.firstName}-${s.lastName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
      setPortfolioForm({
        slug: defaultSlug,
        avatarUrl: s.avatarUrl || '',
        bio: s.bio || '',
        skillsStr: (s.skills || []).join(', '),
        githubUrl: s.githubUrl || '',
        linkedinUrl: s.linkedinUrl || '',
        telegramUsername: s.telegramUsername || '',
        isPublicPortfolio: s.isPublicPortfolio !== false,
      });
      setProjects(s.projects || []);
    }
  }, [data]);

  const handleSavePortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPortfolio(true);
    try {
      const skills = portfolioForm.skillsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...portfolioForm,
          skills,
          projects,
        }),
      });

      if (res.ok) {
        alert("Portfolio va rezume ma'lumotlari muvaffaqiyatli saqlandi!");
        fetchStudentDetail();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingPortfolio(false);
    }
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.description) {
      alert("Nomi va tavsifini kiriting");
      return;
    }

    const techArray = projectForm.technologiesStr
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newProject = {
      title: projectForm.title,
      description: projectForm.description,
      githubRepo: projectForm.githubRepo,
      liveDemo: projectForm.liveDemo,
      technologies: techArray,
    };

    setProjects([...projects, newProject]);
    setProjectForm({ title: '', description: '', githubRepo: '', liveDemo: '', technologiesStr: '' });
    setShowProjectModal(false);
  };

  const handleDeleteProject = (index: number) => {
    setProjects(projects.filter((_, idx) => idx !== index));
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
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Talabalar ro'yxatiga qaytish
        </button>

        {/* Student Profile Banner Header */}
        <div className="apple-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-infast-600 to-infast-500 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-infast-500/20">
              {student.firstName[0]}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {student.firstName} {student.lastName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-black/[0.04] dark:bg-white/[0.08] font-mono font-extrabold text-slate-800 dark:text-slate-200 text-xs border border-black/[0.06] dark:border-white/[0.1]">
                  ID: {student.studentCode || `INF-${student._id.slice(-4).toUpperCase()}`}
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
                  <Building2 className="w-3 h-3" />
                  {student.branchId?.name || 'Asosiy filial'}
                </span>
                <span>• {student.courseId?.name || 'Kurs'} • {student.groupId?.name || 'Guruh'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-apple-sm transition-all flex items-center space-x-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Filialga ko'chirish</span>
            </button>

            <button
              onClick={() => {
                setShowPasswordModal(true);
                setGeneratedPassword(null);
                setNewPassword('');
              }}
              className="px-3.5 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs shadow-apple-sm transition-all flex items-center space-x-1.5"
              title="Student mobil ilovasi uchun parol o'rnatish yoki generatsiya qilish"
            >
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Parolni boshqarish</span>
            </button>

            {/* Dynamic Course Month Badge */}
            <div className="px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold text-xs">
              Joriy bosqich: {student.currentCourseMonth}
            </div>

            {/* Gamification Badges */}
            {lmsStats && (
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {lmsStats.xp} XP
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-orange-500" />
                  {lmsStats.xcoin}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Lv.{lmsStats.level}
                </span>
              </div>
            )}

            <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
              student.status === 'ACTIVE' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
              student.status === 'BLOCKED' || student.status === 'BLOCK' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20' :
              student.status === 'QARZDOR' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/20' :
              student.status === 'PAUSED' ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20' : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-700 dark:text-slate-300'
            }`}>
              {student.status}
            </span>
          </div>
        </div>

        {/* Tabs Bar - Apple Segmented Control */}
        <div className="flex p-1.5 rounded-2xl bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.04] dark:border-white/[0.06] gap-1 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Umumiy Ma\'lumot' },
            { id: 'lesson_map', label: 'O\'quv Xaritasi (LMS)' },
            { id: 'activities', label: 'Faoliyat Tarixi' },
            { id: 'payments', label: 'To\'lovlar Tarixi' },
            { id: 'attendance', label: 'Davomat Tarixi' },
            { id: 'exams', label: 'Imtihonlar' },
            { id: 'portfolio', label: 'Portfolio & Rezume' },
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

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            <div className="apple-card p-6 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3">Shaxsiy Ma'lumotlar</h3>
              
              <div className="flex justify-between py-2 border-b border-black/[0.03] dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-slate-400">Telefon:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{student.phone}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/[0.03] dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-slate-400">Ota-ona telefoni:</span>
                <span className="font-bold text-slate-900 dark:text-white font-mono">{student.parentPhone || '-'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Tug'ilgan sana:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatDateUz(student.birthDate)}</span>
              </div>
            </div>

            <div className="apple-card p-6 space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3">O'qish va To'lov Shartlari</h3>

              <div className="flex justify-between py-2 border-b border-black/[0.03] dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-slate-400">Kurs:</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.courseId?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/[0.03] dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-slate-400">Guruh:</span>
                <span className="font-bold text-slate-900 dark:text-white">{student.groupId?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/[0.03] dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-slate-400">Oylik To'lov Narxi:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatMoneyUz(student.effectiveFee)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-black/[0.03] dark:border-white/[0.04]">
                <span className="text-slate-500 dark:text-slate-400">Har oylik to'lov kuni:</span>
                <span className="font-bold text-infast-600 dark:text-infast-400">{student.paymentDueDay}-sana</span>
              </div>
              {student.nextPaymentDueDate && (
                <div className={`flex justify-between p-3 rounded-2xl text-xs font-semibold ${
                  student.paymentStatus === 'PAID' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20'
                }`}>
                  <span className="font-medium">Keyingi to'lov sanasi:</span>
                  <span className="font-extrabold font-mono">{formatDateUz(student.nextPaymentDueDate)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Lesson Map (LMS) */}
        {activeTab === 'lesson_map' && (
          <div className="animate-in fade-in duration-200">
            <LessonMapTab
              studentId={studentId}
              courseName={student.courseId?.name}
              onRefreshStudent={fetchStudentDetail}
            />
          </div>
        )}

        {/* Tab: Activities History */}
        {activeTab === 'activities' && (
          <div className="animate-in fade-in duration-200">
            <ActivityHistoryTab studentId={studentId} />
          </div>
        )}

        {/* Tab 2: Payments History & Periods */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Status Banner */}
            {student.nextPaymentDueDate && (
              <div className={`p-4 rounded-3xl border flex items-center justify-between ${
                student.paymentStatus === 'PAID'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-800 dark:text-rose-300'
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
                  student.paymentStatus === 'PAID' ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-500/20 text-rose-800 dark:text-rose-300'
                }`}>
                  {student.paymentStatus === 'PAID' ? "To'langan" : "Qarzdor"}
                </span>
              </div>
            )}

            {/* Independent Payment Periods Breakdown */}
            <div className="apple-card p-6 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Oylik To'lov Bosqichlari (Mustaqil Davrlar)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {periods.map((p: any) => (
                  <div key={p.periodIndex} className={`p-3.5 rounded-2xl border transition-all ${
                    p.status === 'PAID' ? 'bg-emerald-500/5 border-emerald-500/20' :
                    p.status === 'OVERDUE' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.08]'
                  }`}>
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800 dark:text-slate-200">{p.periodIndex}-Oy Davri</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] ${
                        p.status === 'PAID' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                        p.status === 'OVERDUE' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' : 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                      }`}>
                        {p.statusText}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Muddati: {p.dueDate}</p>
                    <p className="text-xs font-extrabold text-slate-900 dark:text-white mt-2">{formatMoneyUz(p.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Transactions Table */}
            <div className="apple-card overflow-hidden">
              <div className="p-4 border-b border-black/[0.06] dark:border-white/[0.08] font-bold text-sm text-slate-900 dark:text-white">Qabul Qilingan To'lovlar</div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] font-bold text-slate-400">
                    <tr>
                      <th className="p-3">Sana</th>
                      <th className="p-3">Summa</th>
                      <th className="p-3">To'lov Usuli</th>
                      <th className="p-3">Izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                    {payments.length === 0 ? (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-400">To'lovlar topilmadi</td></tr>
                    ) : (
                      payments.map((pay: any) => (
                        <tr key={pay._id}>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{formatDateUz(pay.paymentDate)}</td>
                          <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{formatMoneyUz(pay.amount)}</td>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{pay.paymentMethod}</td>
                          <td className="p-3 text-slate-500 dark:text-slate-400">{pay.notes || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Attendance History */}
        {activeTab === 'attendance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="apple-card p-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Umumiy Davomat Ko'rsatkichi</p>
                <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{attendanceStats.percentage || 100}%</p>
              </div>
              <div className="flex space-x-4 text-xs font-semibold">
                <div className="text-center px-4 py-2 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <p className="text-lg font-bold">{attendanceStats.present || 0}</p>
                  <p className="text-[10px]">Kelgan</p>
                </div>
                <div className="text-center px-4 py-2 bg-rose-500/10 text-rose-700 dark:text-rose-400 rounded-2xl border border-rose-500/20">
                  <p className="text-lg font-bold">{attendanceStats.absent || 0}</p>
                  <p className="text-[10px]">Kelmagan</p>
                </div>
              </div>
            </div>

            <div className="apple-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/[0.02] dark:bg-white/[0.03] border-b border-black/[0.06] dark:border-white/[0.08] font-bold text-slate-400">
                    <tr>
                      <th className="p-3">Sana</th>
                      <th className="p-3">Holati</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] font-medium">
                    {attendances.length === 0 ? (
                      <tr><td colSpan={2} className="p-6 text-center text-slate-400">Davomat yozuvlari yo'q</td></tr>
                    ) : (
                      attendances.map((att: any) => (
                        <tr key={att._id}>
                          <td className="p-3 font-semibold text-slate-800 dark:text-slate-200">{att.date}</td>
                          <td className="p-3">
                            {att.status === 'PRESENT' ? (
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold text-[10px]">✓ Kelgan</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold text-[10px]">✕ Kelmagan</span>
                            )}
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

        {/* Tab 4: Exams */}
        {activeTab === 'exams' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {exams.length === 0 ? (
              <div className="apple-card p-8 text-center text-slate-400 text-xs">
                Hali imtihonlar yo'q
              </div>
            ) : (
              exams.map((ex: any) => (
                <div key={ex._id} className="apple-card p-5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{ex.examId?.name || 'Imtihon'}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                      Sana: {formatDateUz(ex.examId?.examDate)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {ex.score !== null ? `${ex.score} / ${ex.examId?.maxScore || 100}` : '-'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                      ex.status === 'PASSED' ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' :
                      ex.status === 'FAILED' ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400' : 'bg-black/[0.04] dark:bg-white/[0.08] text-slate-600 dark:text-slate-300'
                    }`}>
                      {ex.status === 'PASSED' ? '🟢 O\'tdi' : ex.status === 'FAILED' ? '🔴 O\'tmadi' : '⚪ Qatnashmadi'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 5: Portfolio & Resume */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Public Portfolio Banner Link */}
            <div className="apple-card p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#141418] text-white dark:bg-[#141418]">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">Rasmiy Ommaviy Portfolio</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  infast.uz/portfolio/{portfolioForm.slug || student._id}
                </p>
              </div>
              <a
                href={`/portfolio/${portfolioForm.slug || student._id}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-apple-sm shrink-0 flex items-center space-x-1.5"
              >
                <span>Ommaviy Portfolioni Ko'rish</span>
                <span>↗</span>
              </a>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-6">
              {/* Profile Details & Socials */}
              <div className="apple-card p-6 space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3">Profil va Ijtimoiy Tarmoq Havolalari</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Unikal URL Slug (Portfolio Linki uchun) *</label>
                    <input
                      type="text"
                      required
                      placeholder="alimov-farrux"
                      value={portfolioForm.slug}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, slug: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Rasm Havolasi (Avatar URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={portfolioForm.avatarUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, avatarUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">GitHub Profil Linki</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={portfolioForm.githubUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, githubUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">LinkedIn Profil Linki</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={portfolioForm.linkedinUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, linkedinUrl: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Telegram Usernamesi</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={portfolioForm.telegramUsername}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, telegramUsername: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      id="isPublicPortfolio"
                      checked={portfolioForm.isPublicPortfolio}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, isPublicPortfolio: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <label htmlFor="isPublicPortfolio" className="font-semibold text-slate-800 dark:text-slate-200">
                      Ommaviy Portfolioni Faol (Public) Qilish
                    </label>
                  </div>
                </div>
              </div>

              {/* Bio Summary & Skill Tags */}
              <div className="apple-card p-6 space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-black/[0.06] dark:border-white/[0.08] pb-3">Tavsif va Texnik Ko'nikmalar</h3>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Qisqacha Rezume / Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Masalan: Frontend React va Next.js dasturchi. InFAST IT-Academiyada 6 oy tajriba oshirgan."
                    value={portfolioForm.bio}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, bio: e.target.value })}
                    className="w-full p-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Texnik Ko'nikmalar (Vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, TypeScript, Tailwind CSS, Node.js, MongoDB"
                    value={portfolioForm.skillsStr}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, skillsStr: e.target.value })}
                    className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono font-bold text-emerald-600 dark:text-emerald-400"
                  />
                </div>
              </div>

              {/* Projects List */}
              <div className="apple-card p-6 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-3">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Portfolio Loyihalari ({projects.length})</h3>
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(true)}
                    className="px-3 py-1.5 bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-900 dark:text-white font-semibold rounded-xl border border-black/[0.06] dark:border-white/[0.08] transition-all"
                  >
                    + Yangi Loyiha Qo'shish
                  </button>
                </div>

                {projects.length === 0 ? (
                  <p className="text-center py-6 text-slate-400">Hali loyihalar qo'shilmagan</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">{proj.title}</h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(idx)}
                            className="text-rose-500 hover:text-rose-600 font-bold text-xs"
                          >
                            O'chirish
                          </button>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">{proj.description}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies?.map((tech: string, tIdx: number) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                              {tech}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center space-x-3 pt-2 text-[11px] font-bold font-mono">
                          {proj.githubRepo && (
                            <a href={proj.githubRepo} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">
                              GitHub Repo ↗
                            </a>
                          )}
                          {proj.liveDemo && (
                            <a href={proj.liveDemo} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                              Live Demo ↗
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {userSession?.role !== 'ADMIN' && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingPortfolio}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-apple-sm transition-all"
                  >
                    {savingPortfolio ? "Saqlanmoqda..." : "Portfolio Va Rezumeni Saqlash"}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Modal: Add Project */}
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
            <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.12] w-full max-w-lg rounded-3xl p-6 shadow-apple-float space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Yangi Loyiha Qo'shish</h3>
                <button onClick={() => setShowProjectModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Loyiha Nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: CRM Boshqaruv Tizimi"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Loyiha Haqida Qisqacha Tavsif *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Loyiha vazifasi va imkoniyatlari haqida..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GitHub Repo Havolasi</label>
                    <input
                      type="url"
                      placeholder="https://github.com/user/repo"
                      value={projectForm.githubRepo}
                      onChange={(e) => setProjectForm({ ...projectForm, githubRepo: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Live Demo Website Havolasi</label>
                    <input
                      type="url"
                      placeholder="https://myproject.vercel.app"
                      value={projectForm.liveDemo}
                      onChange={(e) => setProjectForm({ ...projectForm, liveDemo: e.target.value })}
                      className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Texnologiyalar (Vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, Tailwind CSS, MongoDB"
                    value={projectForm.technologiesStr}
                    onChange={(e) => setProjectForm({ ...projectForm, technologiesStr: e.target.value })}
                    className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-slate-700 dark:text-slate-300 font-semibold rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-infast-500 hover:bg-infast-600 text-white font-semibold rounded-xl shadow-apple-sm"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Unified Password Management Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-[#141418] border border-black/[0.08] dark:border-white/[0.12] w-full max-w-md rounded-3xl p-6 shadow-apple-float space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Key className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">Talaba Parolini Boshqarish</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{student.firstName} {student.lastName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setGeneratedPassword(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Success Result View (if generated) */}
              {generatedPassword ? (
                <div className="space-y-4 animate-in fade-in">
                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.04] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] text-center space-y-2">
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Yangi Parol Muvaffaqiyatli O'rnatildi
                    </div>
                    <div className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white select-all py-1.5">
                      {generatedPassword}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedPassword);
                        setPasswordCopied(true);
                        setTimeout(() => setPasswordCopied(false), 2000);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-xl shadow-apple-sm transition-all"
                    >
                      {passwordCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{passwordCopied ? "Nusxa olindi!" : "Nusxalab olish"}</span>
                    </button>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
                      <strong>Diqqat:</strong> Ushbu parol talabaning mobil ilovasi yoki veb portaliga kirishi uchun amal qiladi.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end space-x-2">
                    <button
                      onClick={() => setGeneratedPassword(null)}
                      className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                    >
                      Boshqa parol o'rnatish
                    </button>
                    <button
                      onClick={() => setShowPasswordModal(false)}
                      className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-xl shadow-apple-sm"
                    >
                      Tushundim (Yopish)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Option 1: Quick Generate */}
                  <div className="p-3.5 bg-black/[0.02] dark:bg-white/[0.03] rounded-2xl border border-black/[0.06] dark:border-white/[0.08] flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white">Avtomatik xavfsiz parol</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Tasodifiy 8-10 xonali xavfsiz kod</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      disabled={isResettingPassword}
                      className="px-3.5 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-semibold rounded-xl shadow-apple-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isResettingPassword ? "Generatsiya..." : "Generatsiya qilish"}</span>
                    </button>
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-black/[0.06] dark:border-white/[0.08]" />
                    <span className="flex-shrink mx-3 text-[11px] font-semibold text-slate-400 uppercase">yoki qo'lda kiritish</span>
                    <div className="flex-grow border-t border-black/[0.06] dark:border-white/[0.08]" />
                  </div>

                  {/* Option 2: Manual password input */}
                  <form onSubmit={handleSavePassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Yangi Maxsus Parol <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Masalan: inFast2026!"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.1] rounded-xl text-sm font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/20"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Talaba mobil ilovaga telefon raqami va ushbu parol bilan kira oladi.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setShowPasswordModal(false)}
                        className="px-4 py-2 bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl"
                      >
                        Bekor qilish
                      </button>
                      <button
                        type="submit"
                        disabled={savingPassword || !newPassword.trim()}
                        className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-apple-sm transition-all disabled:opacity-50"
                      >
                        {savingPassword ? "Saqlanmoqda..." : "Parolni Saqlash"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Transfer Modal */}
        <TransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          student={student}
          onSuccess={() => fetchStudentDetail()}
        />
      </main>
    </div>
  );
}
