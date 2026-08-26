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
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'attendance' | 'exams' | 'portfolio'>('overview');

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
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {student.firstName} {student.lastName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 font-mono font-extrabold text-slate-800 text-xs border border-slate-200">
                  ID: {student.studentCode || `INF-${student._id.slice(-4).toUpperCase()}`}
                </span>
              </div>
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
            { id: 'portfolio', label: 'Portfolio & Rezume' },
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

        {/* Tab 5: Portfolio & Resume */}
        {activeTab === 'portfolio' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Public Portfolio Banner Link */}
            <div className="bg-slate-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">Rasmiy Ommaviy Portfolio</span>
                </div>
                <p className="text-sm font-bold text-white font-mono">
                  infast.uz/portfolio/{portfolioForm.slug || student._id}
                </p>
              </div>
              <a
                href={`/portfolio/${portfolioForm.slug || student._id}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center space-x-1.5"
              >
                <span>Ommaviy Portfolioni Ko'rish</span>
                <span>↗</span>
              </a>
            </div>

            <form onSubmit={handleSavePortfolio} className="space-y-6">
              {/* Profile Details & Socials */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Profil va Ijtimoiy Tarmoq Havolalari</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unikal URL Slug (Portfolio Linki uchun) *</label>
                    <input
                      type="text"
                      required
                      placeholder="alimov-farrux"
                      value={portfolioForm.slug}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, slug: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Rasm Havolasi (Avatar URL)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={portfolioForm.avatarUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, avatarUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GitHub Profil Linki</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username"
                      value={portfolioForm.githubUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, githubUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">LinkedIn Profil Linki</label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={portfolioForm.linkedinUrl}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, linkedinUrl: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Telegram Usernamesi</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={portfolioForm.telegramUsername}
                      onChange={(e) => setPortfolioForm({ ...portfolioForm, telegramUsername: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
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
                    <label htmlFor="isPublicPortfolio" className="font-bold text-slate-800">
                      Ommaviy Portfolioni Faol (Public) Qilish
                    </label>
                  </div>
                </div>
              </div>

              {/* Bio Summary & Skill Tags */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 text-xs">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">Tavsif va Texnik Ko'nikmalar</h3>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qisqacha Rezume / Bio</label>
                  <textarea
                    rows={3}
                    placeholder="Masalan: Frontend React va Next.js dasturchi. InFAST IT-Academiyada 6 oy tajriba oshirgan."
                    value={portfolioForm.bio}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, bio: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Texnik Ko'nikmalar (Vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, TypeScript, Tailwind CSS, Node.js, MongoDB"
                    value={portfolioForm.skillsStr}
                    onChange={(e) => setPortfolioForm({ ...portfolioForm, skillsStr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Projects List */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900">Portfolio Loyihalari ({projects.length})</h3>
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(true)}
                    className="px-3 py-1.5 bg-infast-50 hover:bg-infast-100 text-infast-700 font-bold rounded-xl border border-infast-200"
                  >
                    + Yangi Loyiha Qo'shish
                  </button>
                </div>

                {projects.length === 0 ? (
                  <p className="text-center py-6 text-slate-400">Hali loyihalar qo'shilmagan</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map((proj: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 relative">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-slate-900 text-sm">{proj.title}</h4>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(idx)}
                            className="text-rose-500 hover:text-rose-700 font-bold text-xs"
                          >
                            O'chirish
                          </button>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-xs">{proj.description}</p>

                        <div className="flex flex-wrap gap-1 pt-1">
                          {proj.technologies?.map((tech: string, tIdx: number) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
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

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPortfolio}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all"
                >
                  {savingPortfolio ? "Saqlanmoqda..." : "Portfolio Va Rezumeni Saqlash"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal: Add Project */}
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Yangi Loyiha Qo'shish</h3>
                <button onClick={() => setShowProjectModal(false)} className="p-1 text-slate-400">
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddProject} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loyiha Nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: CRM Boshqaruv Tizimi"
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loyiha Haqida Qisqacha Tavsif *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Loyiha vazifasi va imkoniyatlari haqida..."
                    value={projectForm.description}
                    onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">GitHub Repo Havolasi</label>
                    <input
                      type="url"
                      placeholder="https://github.com/user/repo"
                      value={projectForm.githubRepo}
                      onChange={(e) => setProjectForm({ ...projectForm, githubRepo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Live Demo Website Havolasi</label>
                    <input
                      type="url"
                      placeholder="https://myproject.vercel.app"
                      value={projectForm.liveDemo}
                      onChange={(e) => setProjectForm({ ...projectForm, liveDemo: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Texnologiyalar (Vergul bilan ajratilgan)</label>
                  <input
                    type="text"
                    placeholder="React, Next.js, Tailwind CSS, MongoDB"
                    value={projectForm.technologiesStr}
                    onChange={(e) => setProjectForm({ ...projectForm, technologiesStr: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                  />
                </div>

                <div className="pt-3 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-infast-500 hover:bg-infast-600 text-white font-bold rounded-xl shadow-md"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
