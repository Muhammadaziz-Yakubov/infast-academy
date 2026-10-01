'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import {
  Award,
  Users,
  Calendar,
  Search,
  Plus,
  FileCheck,
  Eye,
  Edit2,
  Download,
  Printer,
  QrCode,
  ExternalLink,
  Ban,
  RotateCcw,
  CheckCircle2,
  X,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { STANDARD_NOMINATIONS, formatUzbekDateDisplay } from '@/lib/certificateUtils';
import { MainCertificate } from '@/components/graduates/MainCertificate';
import { AwardCertificate } from '@/components/graduates/AwardCertificate';
import { downloadCertificatePdf } from '@/lib/pdfExport';
import QRCode from 'qrcode';

interface GraduateItem {
  _id: string;
  graduateId: string;
  certificateId: string;
  awardId: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  fullName: string;
  birthDate?: string;
  phone?: string;
  photoUrl?: string;
  track: string;
  courseName: string;
  duration: string;
  startDate: string;
  endDate: string;
  mentor: string;
  director: string;
  status: 'active' | 'revoked';
  nomination: string;
  issuedDate: string;
  notes?: string;
  createdAt: string;
}

interface StatsData {
  totalGraduates: number;
  activeCertificates: number;
  totalNominations: number;
  revokedCount: number;
  ceremonyDate: string;
}

export default function GraduatesPage() {
  const [graduates, setGraduates] = useState<GraduateItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    totalGraduates: 0,
    activeCertificates: 0,
    totalNominations: 0,
    revokedCount: 0,
    ceremonyDate: '02.10.2026',
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedGraduate, setSelectedGraduate] = useState<GraduateItem | null>(null);
  const [previewType, setPreviewType] = useState<'main' | 'award'>('main');
  const [qrCodeImg, setQrCodeImg] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Form State
  const initialFormData = {
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
  };

  const [formData, setFormData] = useState(initialFormData);
  const [customNomination, setCustomNomination] = useState(false);

  const fetchGraduates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/graduates?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setGraduates(data.graduates || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraduates();
  }, [search, statusFilter]);

  const handleOpenAdd = () => {
    setFormData(initialFormData);
    setCustomNomination(false);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (grad: GraduateItem) => {
    setSelectedGraduate(grad);
    setFormData({
      firstName: grad.firstName || '',
      lastName: grad.lastName || '',
      middleName: grad.middleName || '',
      birthDate: grad.birthDate || '',
      phone: grad.phone || '',
      photoUrl: grad.photoUrl || '',
      track: grad.track || 'Full-Stack Development',
      courseName: grad.courseName || 'Full-Stack Development',
      duration: grad.duration || '15 oy',
      startDate: grad.startDate || '01.07.2025',
      endDate: grad.endDate || '02.10.2026',
      mentor: grad.mentor || 'M. Yakubov',
      director: grad.director || 'N. Yakubova',
      nomination: grad.nomination || 'Best Full-Stack Developer',
      issuedDate: grad.issuedDate || '02.10.2026',
      notes: grad.notes || '',
    });
    setCustomNomination(!STANDARD_NOMINATIONS.includes(grad.nomination));
    setEditModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName) {
      alert('Ism va Familiya kiritilishi shart!');
      return;
    }

    try {
      setSaving(true);
      const res = await fetch('/api/graduates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setAddModalOpen(false);
        fetchGraduates();
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGraduate) return;

    try {
      setSaving(true);
      const res = await fetch(`/api/graduates/${selectedGraduate._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setEditModalOpen(false);
        fetchGraduates();
      } else {
        alert(data.error || 'Xatolik yuz berdi');
      }
    } catch (err: any) {
      alert(err.message || 'Xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (grad: GraduateItem) => {
    const isCurrentlyRevoked = grad.status === 'revoked';
    const confirmText = isCurrentlyRevoked
      ? `"${grad.fullName}" sertifikatini qayta tiklamoqchimisiz?`
      : `Haqiqatan ham "${grad.fullName}" sertifikatini bekor qilmoqchimisiz?`;

    if (!window.confirm(confirmText)) return;

    try {
      const newStatus = isCurrentlyRevoked ? 'active' : 'revoked';
      const res = await fetch(`/api/graduates/${grad._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          revokedReason:
            newStatus === 'revoked' ? 'Administrator tomonidan bekor qilindi' : '',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchGraduates();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenPreview = (grad: GraduateItem, type: 'main' | 'award') => {
    setSelectedGraduate(grad);
    setPreviewType(type);
    setPreviewModalOpen(true);
  };

  const handleOpenQr = (grad: GraduateItem, isAward = false) => {
    setSelectedGraduate(grad);
    const id = isAward ? grad.awardId : grad.certificateId;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infastacademy.uz';
    const verifyUrl = `${origin}/verify/${id}`;

    QRCode.toDataURL(verifyUrl, { width: 320, margin: 2 }, (err, url) => {
      if (!err && url) {
        setQrCodeImg(url);
      } else {
        setQrCodeImg(`https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(verifyUrl)}`);
      }
      setQrModalOpen(true);
    });
  };

  const handleDownloadModalPdf = async () => {
    if (!selectedGraduate) return;
    try {
      setDownloading(true);
      const elementId = previewType === 'main' ? 'modal-main-cert' : 'modal-award-cert';
      const fileName = `${selectedGraduate.fullName.replace(/\s+/g, '_')}_${previewType === 'main' ? 'Sertifikat' : 'Nominatsiya'}.pdf`;
      await downloadCertificatePdf(elementId, fileName);
    } catch (err) {
      console.error(err);
      alert('PDF yuklab olishda xatolik yuz berdi');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex flex-col font-sans">
      {/* Top Standard Navbar Header */}
      <Header title="Bitiruvchilar" />

      {/* Main Container */}
      <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Page Hero Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-[24px] shadow-sm">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="px-3 py-1 rounded-full bg-infast-50 dark:bg-infast-950/40 text-infast-600 dark:text-infast-400 font-bold text-xs tracking-wider uppercase border border-infast-200/60 dark:border-infast-800/60">
                Bitiruv marosimi — 02.10.2026
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-2">
              Bitiruvchilar va Sertifikatlar Tizimi
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bitiruvchilar ma’lumotlari, avtomatlashtirilgan sertifikatlar va QR verifikatsiyani boshqarish
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-infast-500 hover:bg-infast-600 active:scale-[0.98] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-md shadow-infast-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Bitiruvchi qo‘shish</span>
          </button>
        </div>

        {/* 4 Sleek Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[22px] shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Bitiruvchilar</span>
              <Users className="w-4 h-4 text-infast-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalGraduates}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Jami ro‘yxatdagilar</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[22px] shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Sertifikatlar</span>
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {stats.activeCertificates}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Faol asosiy sertifikatlar</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[22px] shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Nominatsiyalar</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-500">
              {stats.totalNominations}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Maxsus mukofotlar</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[22px] shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Bekor qilingan</span>
              <Ban className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {stats.revokedCount}
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Nofaol holatdagi sertifikatlar</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-4 rounded-[22px] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="F.I.O. yoki Sertifikat ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500 font-medium"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-infast-500"
            >
              <option value="all">Barcha statuslar</option>
              <option value="active">✓ Faol sertifikatlar</option>
              <option value="revoked">✕ Bekor qilinganlar</option>
            </select>
          </div>
        </div>

        {/* Graduates Minimalist Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[24px] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-5 w-12 text-center">№</th>
                  <th className="py-4 px-5">Bitiruvchi F.I.O.</th>
                  <th className="py-4 px-5">Yo‘nalish</th>
                  <th className="py-4 px-5">Nominatsiya</th>
                  <th className="py-4 px-5">Sertifikat №</th>
                  <th className="py-4 px-5">Berilgan Sana</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-infast-500" />
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : graduates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Award className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      Bitiruvchilar topilmadi. "+ Bitiruvchi qo‘shish" tugmasini bosing.
                    </td>
                  </tr>
                ) : (
                  graduates.map((grad, idx) => {
                    const isRevoked = grad.status === 'revoked';
                    return (
                      <tr
                        key={grad._id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-4 px-5 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-5">
                          <Link
                            href={`/graduates/${grad._id}`}
                            className="font-bold text-slate-900 dark:text-white hover:text-infast-600 transition-colors flex items-center space-x-1.5"
                          >
                            <span>{grad.fullName}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                          {grad.phone && (
                            <span className="text-[11px] text-slate-400 block font-mono mt-0.5">
                              {grad.phone}
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {grad.track}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {grad.duration} • Mentor: {grad.mentor}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50 font-bold text-[11px]">
                            ⭐ {grad.nomination}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                            {grad.certificateId}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            {grad.awardId}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-slate-500 font-mono text-[11px]">
                          {grad.issuedDate || '02.10.2026'}
                        </td>
                        <td className="py-4 px-5">
                          {isRevoked ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-[10px]">
                              Bekor qilingan
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 font-bold text-[10px]">
                              ✓ Faol
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            {/* Main Cert Preview */}
                            <button
                              onClick={() => handleOpenPreview(grad, 'main')}
                              title="Asosiy Sertifikatni ko‘rish"
                              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-infast-600 transition-colors"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>

                            {/* Award Cert Preview */}
                            <button
                              onClick={() => handleOpenPreview(grad, 'award')}
                              title="Nominatsiya Sertifikatini ko‘rish"
                              className="p-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-600 transition-colors"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>

                            {/* QR Code */}
                            <button
                              onClick={() => handleOpenQr(grad, false)}
                              title="QR Kodni ko‘rish"
                              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                            >
                              <QrCode className="w-4 h-4" />
                            </button>

                            {/* Public Verification Link */}
                            <Link
                              href={`/verify/${grad.certificateId}`}
                              target="_blank"
                              title="Verification sahifasini ochish"
                              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-infast-600 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Link>

                            {/* Edit button */}
                            <button
                              onClick={() => handleOpenEdit(grad)}
                              title="Tahrirlash"
                              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Revoke / Restore toggle */}
                            <button
                              onClick={() => handleToggleStatus(grad)}
                              title={isRevoked ? 'Qayta tiklash' : 'Sertifikatni bekor qilish'}
                              className={`p-2 rounded-xl transition-colors ${
                                isRevoked
                                  ? 'hover:bg-emerald-50 text-emerald-600'
                                  : 'hover:bg-rose-50 text-rose-600'
                              }`}
                            >
                              {isRevoked ? (
                                <RotateCcw className="w-4 h-4" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] w-full max-w-2xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-2xl bg-infast-500 text-white flex items-center justify-center font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {addModalOpen ? 'Yangi Bitiruvchi Qo‘shish' : 'Bitiruvchini Tahrirlash'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addModalOpen ? handleSaveAdd : handleSaveEdit} className="p-6 space-y-5">
              {/* Personal Information Group */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-infast-600 mb-3">
                  1. Shaxsiy Ma’lumotlar
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Familiya *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Aliyev"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Ism *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Muhammad"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Otasining ismi
                    </label>
                    <input
                      type="text"
                      placeholder="Aliyevich"
                      value={formData.middleName}
                      onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Tug‘ilgan sana
                    </label>
                    <input
                      type="text"
                      placeholder="15.08.2002"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Telefon raqami
                    </label>
                    <input
                      type="text"
                      placeholder="+998 90 123 45 67"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>
                </div>
              </div>

              {/* Education Information Group */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-infast-600 mb-3">
                  2. Ta’lim va Sertifikat Ma’lumotlari
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Yo‘nalish
                    </label>
                    <input
                      type="text"
                      value={formData.track}
                      onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-infast-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-infast-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Boshlanish sanasi
                    </label>
                    <input
                      type="text"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-infast-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-infast-600 focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                      Direktor
                    </label>
                    <input
                      type="text"
                      value={formData.director}
                      onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>
                </div>
              </div>

              {/* Nomination Group */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    3. Nominatsiya (Taqdirlash)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setCustomNomination(!customNomination)}
                    className="text-[11px] text-infast-600 hover:underline font-bold"
                  >
                    {customNomination ? 'Ro‘yxatdan tanlash' : '+ Boshqa nominatsiya yozish'}
                  </button>
                </div>

                {customNomination ? (
                  <input
                    type="text"
                    placeholder="Masalan: Exceptional Architecture, Best Team Player..."
                    value={formData.nomination}
                    onChange={(e) => setFormData({ ...formData, nomination: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <select
                    value={formData.nomination}
                    onChange={(e) => setFormData({ ...formData, nomination: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-infast-500"
                  >
                    {STANDARD_NOMINATIONS.map((nom) => (
                      <option key={nom} value={nom}>
                        {nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-infast-500 hover:bg-infast-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-infast-500/20 transition-all flex items-center space-x-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{addModalOpen ? 'Saqlash va Sertifikat Yaratish' : 'O‘zgarishlarni Saqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL CERTIFICATE PREVIEW MODAL */}
      {previewModalOpen && selectedGraduate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-[28px] w-full max-w-6xl max-h-[96vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  ← Orqaga
                </button>
                <div className="flex space-x-1 bg-slate-800/80 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewType('main')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      previewType === 'main'
                        ? 'bg-infast-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Asosiy Sertifikat
                  </button>
                  <button
                    onClick={() => setPreviewType('award')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                      previewType === 'award'
                        ? 'bg-amber-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Nominatsiya Sertifikati
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setPreviewModalOpen(false);
                    handleOpenEdit(selectedGraduate);
                  }}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Tahrirlash</span>
                </button>

                <button
                  onClick={handleDownloadModalPdf}
                  disabled={downloading}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-infast-500 hover:bg-infast-600 text-white text-xs font-bold rounded-xl shadow transition-colors disabled:opacity-50"
                >
                  {downloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>PDF yuklab olish</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <Link
                  href={`/verify/${
                    previewType === 'main'
                      ? selectedGraduate.certificateId
                      : selectedGraduate.awardId
                  }`}
                  target="_blank"
                  className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Verification</span>
                </Link>

                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Container */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-950">
              {previewType === 'main' ? (
                <MainCertificate id="modal-main-cert" data={selectedGraduate} />
              ) : (
                <AwardCertificate id="modal-award-cert" data={selectedGraduate} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrModalOpen && selectedGraduate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[28px] p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Unique Verification QR
              </h3>
              <button
                onClick={() => setQrModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-2xl inline-block shadow-sm mb-4">
              {qrCodeImg && (
                <img
                  src={qrCodeImg}
                  alt="QR Code"
                  className="w-48 h-48 object-contain mx-auto"
                />
              )}
            </div>

            <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">
              {selectedGraduate.fullName}
            </p>
            <p className="font-mono text-xs font-bold text-infast-600 mb-4">
              {selectedGraduate.certificateId}
            </p>

            <div className="flex space-x-2">
              <a
                href={qrCodeImg}
                download={`${selectedGraduate.certificateId}_QR.png`}
                className="flex-1 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>QR Yuklab olish</span>
              </a>
              <Link
                href={`/verify/${selectedGraduate.certificateId}`}
                target="_blank"
                className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
