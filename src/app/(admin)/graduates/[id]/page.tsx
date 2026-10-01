'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Award,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Edit2,
  Download,
  Printer,
  ExternalLink,
  Ban,
  RotateCcw,
  Sparkles,
  QrCode,
  FileCheck,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { MainCertificate } from '@/components/graduates/MainCertificate';
import { AwardCertificate } from '@/components/graduates/AwardCertificate';
import { downloadCertificatePdf } from '@/lib/pdfExport';
import { formatUzbekDateDisplay, STANDARD_NOMINATIONS } from '@/lib/certificateUtils';
import QRCode from 'qrcode';

export default function GraduateDetailPage() {
  const router = useRouter();
  const params = useParams();
  const graduateId = params?.id as string;

  const [graduate, setGraduate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'main' | 'award'>('main');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [customNomination, setCustomNomination] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    birthDate: '',
    phone: '',
    photoUrl: '',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Best Full-Stack Developer',
    issuedDate: '02.10.2026',
    notes: '',
  });

  const fetchGraduate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/graduates/${graduateId}`);
      const data = await res.json();
      if (data.success && data.graduate) {
        setGraduate(data.graduate);
        setFormData({
          firstName: data.graduate.firstName || '',
          lastName: data.graduate.lastName || '',
          middleName: data.graduate.middleName || '',
          birthDate: data.graduate.birthDate || '',
          phone: data.graduate.phone || '',
          photoUrl: data.graduate.photoUrl || '',
          track: data.graduate.track || 'Full-Stack Development',
          courseName: data.graduate.courseName || 'Full-Stack Development',
          duration: data.graduate.duration || '15 oy',
          startDate: data.graduate.startDate || '01.07.2025',
          endDate: data.graduate.endDate || '02.10.2026',
          mentor: data.graduate.mentor || 'M. Yakubov',
          director: data.graduate.director || 'N. Yakubova',
          nomination: data.graduate.nomination || 'Best Full-Stack Developer',
          issuedDate: data.graduate.issuedDate || '02.10.2026',
          notes: data.graduate.notes || '',
        });
        setCustomNomination(!STANDARD_NOMINATIONS.includes(data.graduate.nomination));

        // Generate QR code
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infastacademy.uz';
        const verifyUrl = `${origin}/verify/${data.graduate.certificateId}`;
        QRCode.toDataURL(verifyUrl, { width: 300, margin: 2 }, (err, url) => {
          if (!err && url) setQrCodeUrl(url);
          else setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verifyUrl)}`);
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (graduateId) {
      fetchGraduate();
    }
  }, [graduateId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/graduates/${graduateId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        fetchGraduate();
      } else {
        alert(data.error || 'Xatolik');
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    }
  };

  const handleToggleStatus = async () => {
    if (!graduate) return;
    const isCurrentlyRevoked = graduate.status === 'revoked';
    const confirmMsg = isCurrentlyRevoked
      ? 'Sertifikatni qayta tiklashni tasdiqlaysizmi?'
      : 'Ushbu sertifikatni bekor qilishni tasdiqlaysizmi?';

    if (!window.confirm(confirmMsg)) return;

    try {
      const newStatus = isCurrentlyRevoked ? 'active' : 'revoked';
      const res = await fetch(`/api/graduates/${graduate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          revokedReason: newStatus === 'revoked' ? 'Administrator tomonidan bekor qilindi' : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchGraduate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadPdf = async () => {
    if (!graduate) return;
    try {
      setDownloading(true);
      const elementId = activeTab === 'main' ? 'detail-main-cert' : 'detail-award-cert';
      const typeName = activeTab === 'main' ? 'Sertifikat' : 'Nominatsiya';
      const fileName = `${graduate.fullName.replace(/\s+/g, '_')}_${typeName}_${graduate.certificateId}.pdf`;
      await downloadCertificatePdf(elementId, fileName);
    } catch (err) {
      console.error(err);
      alert('PDF yuklab olishda xatolik');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-infast-500" />
        <p className="text-xs text-slate-500">Bitiruvchi ma’lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (!graduate) {
    return (
      <div className="py-24 text-center">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
          Bitiruvchi topilmadi
        </h2>
        <Link
          href="/graduates"
          className="text-xs font-bold text-infast-600 hover:underline"
        >
          ← Bitiruvchilar ro‘yxatiga qaytish
        </Link>
      </div>
    );
  }

  const isRevoked = graduate.status === 'revoked';

  return (
    <div className="space-y-6 pb-16">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Link
            href="/graduates"
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              Bitiruvchi Profili
            </h1>
            <span className="text-[11px] text-slate-400 font-mono">
              ID: {graduate.graduateId}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setEditModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>✏️ Tahrirlash</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-infast-500 hover:bg-infast-600 text-white rounded-xl text-xs font-bold shadow-md shadow-infast-500/20 transition-all disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>⬇ PDF yuklab olish</span>
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>🖨 Print</span>
          </button>

          <Link
            href={`/verify/${graduate.certificateId}`}
            target="_blank"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>🔗 Verification</span>
          </Link>

          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
              isRevoked
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            {isRevoked ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Qayta Tiklash</span>
              </>
            ) : (
              <>
                <Ban className="w-3.5 h-3.5" />
                <span>Sertifikatni bekor qilish</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-infast-500 to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-infast-500/20">
              {graduate.firstName?.[0] || 'G'}
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                  {graduate.fullName}
                </h2>
                {isRevoked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[10px] font-extrabold border border-rose-200 uppercase">
                    ✕ Bekor qilingan
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-extrabold border border-emerald-200 uppercase">
                    ✓ Bitiruvchi
                  </span>
                )}
              </div>
              <p className="text-xs font-semibold text-infast-600 mt-0.5">
                {graduate.track}
              </p>
              {graduate.phone && (
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Tel: {graduate.phone}
                </p>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Davomiyligi
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                {graduate.duration}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Yo‘nalish
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white">
                Frontend + Backend
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Sertifikat ID
              </span>
              <span className="text-xs font-mono font-black text-infast-600">
                {graduate.certificateId}
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">
                Award ID
              </span>
              <span className="text-xs font-mono font-black text-amber-500">
                {graduate.awardId}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Course History & QR Verification */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course History Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
            <BookOpen className="w-4 h-4 text-infast-500" />
            <span>Kurs Tarixi va Ma’lumotlari</span>
          </div>

          <div className="space-y-2 text-xs pt-1">
            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Boshlanish sanasi:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatUzbekDateDisplay(graduate.startDate)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Bitiruv sanasi:</span>
              <span className="font-bold text-infast-600">
                {formatUzbekDateDisplay(graduate.endDate)}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">O‘quv markaz mentori:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {graduate.mentor}
              </span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Akademiya direktori:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {graduate.director}
              </span>
            </div>

            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Berilgan sana:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {formatUzbekDateDisplay(graduate.issuedDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Nomination Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-bold text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Biriktirilgan Nominatsiya</span>
          </div>

          <div className="p-4 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl text-center space-y-1 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-300 block">
              Maxsus Mukofot
            </span>
            <p className="text-base font-black text-slate-950 dark:text-white uppercase tracking-wide">
              ⭐ {graduate.nomination}
            </p>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed text-center pt-1">
            Ushbu nominatsiya uchun alohida A4 LANDSCAPE formatidagi taqdirlash sertifikati generatsiya qilingan.
          </p>
        </div>

        {/* Verification QR Box */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-2 bg-white border border-slate-200 rounded-2xl shadow-sm shrink-0">
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Verification QR"
                className="w-24 h-24 object-contain"
              />
            ) : (
              <div className="w-24 h-24 bg-slate-100 animate-pulse rounded" />
            )}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
              <span>Public Verification</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Telefon kamerasi orqali skaner qilib sertifikatni tekshirish mumkin.
            </p>
            <Link
              href={`/verify/${graduate.certificateId}`}
              target="_blank"
              className="inline-flex items-center space-x-1 text-[11px] font-bold text-infast-600 hover:underline pt-0.5"
            >
              <span>Sahifani ochish</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Certificate Real-Time Preview Area */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-infast-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Sertifikat Preview (A4 Landscape)
            </h3>
          </div>

          {/* Toggle Tab between Main & Award */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('main')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'main'
                  ? 'bg-infast-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Asosiy Sertifikat
            </button>
            <button
              onClick={() => setActiveTab('award')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'award'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Nominatsiya Sertifikati
            </button>
          </div>
        </div>

        {/* Certificate Render */}
        <div className="overflow-x-auto py-2">
          {activeTab === 'main' ? (
            <MainCertificate id="detail-main-cert" data={graduate} />
          ) : (
            <AwardCertificate id="detail-award-cert" data={graduate} />
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Bitiruvchi ma’lumotlarini tahrirlash
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Familiya
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-infast-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Ism
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-infast-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Otasining ismi
                  </label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:ring-2 focus:ring-infast-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Yo‘nalish
                  </label>
                  <input
                    type="text"
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Davomiyligi
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Mentor
                  </label>
                  <input
                    type="text"
                    value={formData.mentor}
                    onChange={(e) => setFormData({ ...formData, mentor: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Boshlanish sanasi
                  </label>
                  <input
                    type="text"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                    Bitiruv sanasi
                  </label>
                  <input
                    type="text"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-infast-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Nominatsiya
                  </label>
                  <button
                    type="button"
                    onClick={() => setCustomNomination(!customNomination)}
                    className="text-[10px] text-infast-600 hover:underline font-bold"
                  >
                    {customNomination ? 'Ro‘yxatdan tanlash' : 'Boshqa yozish'}
                  </button>
                </div>
                {customNomination ? (
                  <input
                    type="text"
                    value={formData.nomination}
                    onChange={(e) => setFormData({ ...formData, nomination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold"
                  />
                ) : (
                  <select
                    value={formData.nomination}
                    onChange={(e) => setFormData({ ...formData, nomination: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  >
                    {STANDARD_NOMINATIONS.map((nom) => (
                      <option key={nom} value={nom}>
                        {nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-infast-500 hover:bg-infast-600 text-white text-xs font-bold rounded-xl shadow"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
