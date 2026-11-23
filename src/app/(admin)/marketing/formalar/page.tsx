'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Trash2,
  TrendingUp,
  Users,
  Eye,
  Send,
  X,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'number' | 'select' | 'checkbox' | 'textarea';
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormItem {
  _id: string;
  name: string;
  pageTitle?: string;
  pageDescription?: string;
  utmSource: string;
  utmMedium: string;
  landingUrl: string;
  fullUrl: string;
  qrCodeUrl?: string;
  customFields?: CustomField[];
  clicksCount: number;
  leadsCount: number;
  createdAt: string;
}

const PRESET_SOURCES = [
  { id: 'instagram', label: 'Instagram', color: 'from-pink-500 to-purple-600' },
  { id: 'telegram', label: 'Telegram', color: 'from-sky-400 to-blue-600' },
  { id: 'tiktok', label: 'TikTok', color: 'from-neutral-800 to-black' },
  { id: 'youtube', label: 'YouTube', color: 'from-red-600 to-red-700' },
  { id: 'facebook', label: 'Facebook', color: 'from-blue-600 to-blue-800' },
  { id: 'google', label: 'Google Ads', color: 'from-emerald-500 to-teal-600' },
  { id: 'banner', label: 'Offline Banner / QR', color: 'from-amber-500 to-orange-600' },
];

const PRESET_MEDIUMS = ['bio', 'story', 'post', 'ads', 'reels', 'dm', 'offline_qr'];

export default function MarketingFormalarPage() {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // QR Modal
  const [selectedQr, setSelectedQr] = useState<{ url: string; title: string } | null>(null);

  // Delete Confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Creation State
  const [formName, setFormName] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [pageDescription, setPageDescription] = useState('');
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('bio');
  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 'fullName', label: 'F.I.SH (Ism va familiya)', type: 'text', placeholder: 'Ali Valiyev', required: true },
    { id: 'phone', label: 'Telefon raqam', type: 'tel', placeholder: '+998 90 123 45 67', required: true },
  ]);

  // Optional Field Toggles
  const [includeCourseSelect, setIncludeCourseSelect] = useState(true);
  const [includeTimeSelect, setIncludeTimeSelect] = useState(false);
  const [includeTelegram, setIncludeTelegram] = useState(false);
  const [includeNotes, setIncludeNotes] = useState(false);

  // New Custom Field Adder
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'select' | 'checkbox' | 'textarea'>('text');
  const [newFieldOptions, setNewFieldOptions] = useState('');

  const fetchForms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/utm');
      const data = await res.json();
      if (data.success) {
        setForms(data.links || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleOpenCreateModal = () => {
    setFormName('');
    setPageTitle('');
    setPageDescription('');
    setUtmSource('instagram');
    setUtmMedium('bio');
    setIncludeCourseSelect(true);
    setIncludeTimeSelect(false);
    setIncludeTelegram(false);
    setIncludeNotes(false);
    setError(null);
    setIsModalOpen(true);
  };

  const handleCreateForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setError("Iltimos, forma nomini kiriting");
      return;
    }
    if (!utmSource.trim()) {
      setError("Iltimos, UTM Manbani tanlang yoki kiriting");
      return;
    }

    setSubmitting(true);
    setError(null);

    // Build the fields list
    const finalFields: CustomField[] = [
      { id: 'fullName', label: 'Ism va familiyangiz', type: 'text', placeholder: 'Ali Valiyev', required: true },
      { id: 'phone', label: 'Telefon raqamingiz', type: 'tel', placeholder: '+998 90 123 45 67', required: true },
    ];

    if (includeCourseSelect) {
      finalFields.push({
        id: 'course',
        label: "Qiziqqan yo'nalishingiz",
        type: 'select',
        required: true,
        options: ['Frontend Dasturlash', 'Backend (NodeJS / Python)', 'Kompyuter Savodxonligi', 'Grafik Dizayn', 'Boshqa'],
      });
    }

    if (includeTimeSelect) {
      finalFields.push({
        id: 'preferredTime',
        label: "Qulay dars vaqti",
        type: 'select',
        required: false,
        options: ['Ertalab (09:00 - 12:00)', 'Tushdan keyin (14:00 - 17:00)', 'Kechki (18:30 - 21:00)'],
      });
    }

    if (includeTelegram) {
      finalFields.push({
        id: 'telegram',
        label: 'Telegram username',
        type: 'text',
        placeholder: '@username',
        required: false,
      });
    }

    if (includeNotes) {
      finalFields.push({
        id: 'extraNote',
        label: 'Savol yoki izohingiz',
        type: 'textarea',
        placeholder: "Qo'shimcha savollaringiz bo'lsa yozib qoldiring...",
        required: false,
      });
    }

    try {
      const res = await fetch('/api/marketing/utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName.trim(),
          pageTitle: pageTitle.trim() || formName.trim(),
          pageDescription: pageDescription.trim(),
          utmSource: utmSource.trim(),
          utmMedium: utmMedium.trim() || 'link',
          useInternalForm: true,
          customFields: finalFields,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        fetchForms();
      } else {
        setError(data.error || "Xatolik yuz berdi");
      }
    } catch (err: any) {
      setError("Server bilan aloqada xatolik");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/marketing/utm/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setForms((prev) => prev.filter((f) => f._id !== id));
        setDeleteId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations
  const totalForms = forms.length;
  const totalClicks = forms.reduce((acc, f) => acc + (f.clicksCount || 0), 0);
  const totalLeads = forms.reduce((acc, f) => acc + (f.leadsCount || 0), 0);
  const avgCR = totalClicks > 0 ? ((totalLeads / totalClicks) * 100).toFixed(1) : '0';

  const filteredForms = forms.filter((f) => {
    const matchesSearch =
      (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.pageTitle || '').toLowerCase().includes(search.toLowerCase()) ||
      (f.utmSource || '').toLowerCase().includes(search.toLowerCase());
    const matchesSource = sourceFilter ? f.utmSource.toLowerCase() === sourceFilter.toLowerCase() : true;
    return matchesSearch && matchesSource;
  });

  return (
    <div className="flex-1 pb-16">
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner with Top Navigation Switcher */}
        <div className="apple-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-infast-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-infast-500/20">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Formalar & Havola Konstruktori
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                Landing formalar yarating, UTM manbasini belgilang va har bir arizachining qayerdan kelganini aniqlang
              </p>
            </div>
          </div>

          {/* 3 Marketing Pillars Nav */}
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-2xl space-x-1 text-xs font-semibold">
            <Link
              href="/marketing"
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Voronka & Metrikalar
            </Link>
            <Link
              href="/marketing/lead-manbalari"
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              Leadlar & Arizalar
            </Link>
            <Link
              href="/marketing/formalar"
              className="px-4 py-2 rounded-xl bg-white dark:bg-[#181820] text-infast-600 dark:text-infast-400 shadow-sm transition-all"
            >
              📝 Formalar & Havolalar
            </Link>
          </div>
        </div>

        {/* 4 Apple KPI Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="apple-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Jami Formalar</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{totalForms} ta</div>
            <p className="text-[10px] text-slate-500">Faol ro'yxatdan o'tish sahifalari</p>
          </div>

          <div className="apple-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Jami Tashriflar</span>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalClicks} ta</div>
            <p className="text-[10px] text-slate-500">Havola orqali kirganlar soni</p>
          </div>

          <div className="apple-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">Qabul Qilingan Leadlar</span>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalLeads} ta</div>
            <p className="text-[10px] text-slate-500">Formani to'ldirib yuborganlar</p>
          </div>

          <div className="apple-card p-5 space-y-1">
            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">O'rtacha Konversiya</span>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{avgCR}%</div>
            <p className="text-[10px] text-slate-500">Tashrifdan arizaga aylanish</p>
          </div>
        </div>

        {/* Action Bar: Search & New Form Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-3 w-full sm:w-auto flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Forma nomi, sarlavha yoki UTM manba..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.08] text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-infast-500"
              />
            </div>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#121216] border border-black/[0.08] dark:border-white/[0.08] text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="">Barcha Manbalar</option>
              {PRESET_SOURCES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-infast-600 hover:bg-infast-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-infast-500/20 transition-all flex items-center justify-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Forma Yaratish</span>
          </button>
        </div>

        {/* Forms Grid */}
        {loading ? (
          <div className="apple-card p-12 text-center text-slate-400 text-xs font-semibold">
            Formalar yuklanmoqda...
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="apple-card p-12 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-infast-50 dark:bg-infast-950/40 text-infast-600 dark:text-infast-400 mx-auto flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Birorta ham forma topilmadi</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                "Yangi Forma Yaratish" tugmasini bosing, taklifingiz sarlavhasi va paragrafini yozing va tizim sizga avtomatik havola generatsiya qilib beradi!
              </p>
            </div>
            <button
              onClick={handleOpenCreateModal}
              className="px-5 py-2.5 rounded-2xl bg-infast-600 text-white font-bold text-xs shadow-md"
            >
              Birinchi formani yaratish
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredForms.map((form) => {
              const cr = form.clicksCount > 0 ? ((form.leadsCount / form.clicksCount) * 100).toFixed(1) : '0';
              const sourceColor =
                PRESET_SOURCES.find((s) => s.id.toLowerCase() === form.utmSource.toLowerCase())?.color ||
                'from-blue-500 to-indigo-600';

              const origin = typeof window !== 'undefined' ? window.location.origin : '';
              const publicUrl = form.fullUrl.startsWith('http')
                ? form.fullUrl
                : `${origin}/l/${form._id}?utm_source=${encodeURIComponent(form.utmSource)}&utm_medium=${encodeURIComponent(form.utmMedium)}`;

              return (
                <div
                  key={form._id}
                  className="apple-card p-5 flex flex-col justify-between hover:shadow-lg transition-all group"
                >
                  <div className="space-y-3">
                    {/* Source Badge & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-1 rounded-xl bg-infast-50 dark:bg-infast-950/50 text-infast-600 dark:text-infast-400 font-extrabold text-[10px] uppercase tracking-wide border border-infast-200 dark:border-infast-800">
                          {form.utmSource}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400">
                          / {form.utmMedium || 'link'}
                        </span>
                      </div>

                      <button
                        onClick={() => setDeleteId(form._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Form Headline & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                        {form.pageTitle || form.name}
                      </h3>
                      {form.pageDescription && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {form.pageDescription}
                        </p>
                      )}
                    </div>

                    {/* Metrics Row */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-black/[0.04] dark:border-white/[0.06] text-center">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Tashrif</span>
                        <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                          {form.clicksCount || 0}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-emerald-500 uppercase">Arizalar</span>
                        <div className="text-xs font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {form.leadsCount || 0}
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-amber-500 uppercase">CR (%)</span>
                        <div className="text-xs font-black text-amber-600 dark:text-amber-400 mt-0.5">
                          {cr}%
                        </div>
                      </div>
                    </div>

                    {/* Custom Fields Summary */}
                    {form.customFields && form.customFields.length > 0 && (
                      <div className="text-[10px] text-slate-400 space-y-1">
                        <span className="font-semibold text-slate-500 dark:text-slate-400">Maydonlar ({form.customFields.length}):</span>
                        <div className="flex flex-wrap gap-1">
                          {form.customFields.map((f, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-slate-600 dark:text-slate-300 text-[9px]">
                              {f.label.split('(')[0]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions & Link Copy Footer */}
                  <div className="mt-4 pt-3 border-t border-black/[0.04] dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center space-x-1.5">
                      <div className="flex-1 bg-black/[0.03] dark:bg-white/[0.04] px-2.5 py-1.5 rounded-xl border border-black/[0.04] dark:border-white/[0.06] text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                        {publicUrl}
                      </div>

                      <button
                        onClick={() => handleCopy(publicUrl, form._id)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center space-x-1 transition-all ${
                          copiedId === form._id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-black/[0.06] dark:bg-white/[0.08] hover:bg-black/[0.1] dark:hover:bg-white/[0.12] text-slate-700 dark:text-slate-200'
                        }`}
                        title="Havoladan nusxa olish"
                      >
                        {copiedId === form._id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Nusxalandi</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Nusxa</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 pt-1">
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-infast-600 dark:text-infast-400 hover:underline"
                      >
                        <span>Ochib ko'rish</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                      {form.qrCodeUrl && (
                        <button
                          onClick={() => setSelectedQr({ url: form.qrCodeUrl!, title: form.pageTitle || form.name })}
                          className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>QR Kod</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Yangi Forma Yaratish */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="apple-card bg-white dark:bg-[#121216] max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-infast-500 text-white flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Yangi Forma Yaratish</h2>
                    <p className="text-xs text-slate-500">Landing sahifa, UTM manbasi va kerakli maydonlarni sozlang</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCreateForm} className="space-y-5 text-xs">
                {/* 1. Forma Nomi */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Forma Nomi (CRM ichki nomi) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Instagram Story - Mart chegirmasi"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-infast-500"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Bu nom faqat admin panelda ro'yxatda ajratib olish uchun ko'rinadi</p>
                </div>

                {/* 2. Sarlavha & Paragraf */}
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-infast-600 dark:text-infast-400">
                    O'quvchi ko'radigan matnlar
                  </span>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Sahifa Sarlavhasi (Headline)
                    </label>
                    <input
                      type="text"
                      placeholder="Masalan: INFAST IT-Akademiyasida Bepul Sinov Darsiga Yoziling!"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.08] dark:border-white/[0.08] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-infast-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tavsif / Paragraf (Taklifingiz matni)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Masalan: Arizangizni qoldiring va 30 daqiqa ichida mutaxassisimiz bog'lanib, sizga bepul dars va chegirma taqdim etadi."
                      value={pageDescription}
                      onChange={(e) => setPageDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.08] dark:border-white/[0.08] font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-infast-500 resize-none"
                    />
                  </div>
                </div>

                {/* 3. UTM Source & UTM Medium */}
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-infast-600 dark:text-infast-400">
                      UTM Manba & Kanal (Tracking)
                    </span>
                    <span className="text-[10px] text-slate-400">Leads ro'yxatida aniq chiqadi</span>
                  </div>

                  {/* Preset Sources Pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SOURCES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setUtmSource(s.id)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                          utmSource.toLowerCase() === s.id.toLowerCase()
                            ? 'bg-infast-600 text-white shadow-sm'
                            : 'bg-white dark:bg-[#181820] text-slate-600 dark:text-slate-300 border border-black/[0.06] dark:border-white/[0.08] hover:bg-slate-50'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        UTM Source (Manba) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="instagram"
                        value={utmSource}
                        onChange={(e) => setUtmSource(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.08] dark:border-white/[0.08] font-semibold text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        UTM Medium (Kanal / Joylashuv)
                      </label>
                      <input
                        type="text"
                        placeholder="bio, story, ads..."
                        value={utmMedium}
                        onChange={(e) => setUtmMedium(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.08] dark:border-white/[0.08] font-semibold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Maydonlar Tanlovi (Form Fields Builder) */}
                <div className="p-4 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-infast-600 dark:text-infast-400">
                      Formaga nimalar kiritilishi (Maydonlar)
                    </span>
                    <span className="text-[10px] text-slate-400">O'quvchi to'ldirishi kerak bo'lgan so'rovlar</span>
                  </div>

                  {/* Mandatory Fields info */}
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 flex items-center space-x-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span className="text-[11px] font-semibold">
                      <strong>Ism va Familiya</strong> hamda <strong>Telefon raqam</strong> har doim avtomatik majburiy bo'ladi.
                    </span>
                  </div>

                  {/* Optional Toggle Switches */}
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.06] dark:border-white/[0.08] cursor-pointer hover:border-infast-500/50 transition-all">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">🎓 Kursni tanlash (Dropdown)</div>
                        <div className="text-[10px] text-slate-400">Frontend, Backend, Python, Dizayn va h.k.</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeCourseSelect}
                        onChange={(e) => setIncludeCourseSelect(e.target.checked)}
                        className="w-5 h-5 rounded text-infast-600 focus:ring-infast-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.06] dark:border-white/[0.08] cursor-pointer hover:border-infast-500/50 transition-all">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">⏰ Qulay o'qish vaqti</div>
                        <div className="text-[10px] text-slate-400">Ertalab, tushdan keyin yoki kechki guruhlar</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeTimeSelect}
                        onChange={(e) => setIncludeTimeSelect(e.target.checked)}
                        className="w-5 h-5 rounded text-infast-600 focus:ring-infast-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.06] dark:border-white/[0.08] cursor-pointer hover:border-infast-500/50 transition-all">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">💬 Telegram username</div>
                        <div className="text-[10px] text-slate-400">Tezkor bog'lanish uchun @username kiritish maydoni</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeTelegram}
                        onChange={(e) => setIncludeTelegram(e.target.checked)}
                        className="w-5 h-5 rounded text-infast-600 focus:ring-infast-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#181820] border border-black/[0.06] dark:border-white/[0.08] cursor-pointer hover:border-infast-500/50 transition-all">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-white text-xs">📝 Qo'shimcha izoh / Savol</div>
                        <div className="text-[10px] text-slate-400">Foydalanuvchi o'z savolini erkin yozishi uchun maydon</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={includeNotes}
                        onChange={(e) => setIncludeNotes(e.target.checked)}
                        className="w-5 h-5 rounded text-infast-600 focus:ring-infast-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end space-x-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Bekor qilish
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl bg-infast-600 hover:bg-infast-700 active:scale-95 text-white font-extrabold shadow-md shadow-infast-500/20 transition-all flex items-center space-x-2"
                  >
                    {submitting ? (
                      <span>Generatsiya qilinmoqda...</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Formani Yaratish va Havola Olish</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Preview Modal */}
        {selectedQr && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="apple-card bg-white dark:bg-[#121216] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">QR Kod</h3>
                <button onClick={() => setSelectedQr(null)} className="p-1 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-slate-200 inline-block">
                <img src={selectedQr.url} alt="QR Code" className="w-52 h-52 mx-auto" />
              </div>

              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {selectedQr.title}
              </p>

              <div className="pt-2">
                <a
                  href={selectedQr.url}
                  download="qr-code.png"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-infast-600 text-white font-bold text-xs inline-block shadow-sm"
                >
                  QR Kodni Yuklab Olish
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="apple-card bg-white dark:bg-[#121216] max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 mx-auto flex items-center justify-center">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Formani o'chirish</h3>
                <p className="text-xs text-slate-500 mt-1">Ushbu forma va uning havolasi bazadan o'chiriladi. Rozimisiz?</p>
              </div>
              <div className="flex items-center justify-center space-x-2 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Ha, o'chirilsin
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
