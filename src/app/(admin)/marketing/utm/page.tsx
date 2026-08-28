'use client';

import React, { useState, useEffect } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Copy,
  Check,
  QrCode,
  ExternalLink,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  PlusCircle,
  FileText,
  FormInput,
  Sliders,
  Sparkles,
} from 'lucide-react';

interface CustomField {
  id: string;
  label: string;
  type: 'text' | 'tel' | 'number' | 'select' | 'checkbox' | 'textarea';
  placeholder?: string;
  required: boolean;
  optionsStr?: string;
}

export default function UTMYaratishPage() {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Modals & Form Builder State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [qrModalUrl, setQrModalUrl] = useState<string | null>(null);

  const [useInternalForm, setUseInternalForm] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    pageTitle: '',
    pageDescription: '',
    utmSource: 'instagram',
    utmMedium: 'target_ads',
    utmCampaignId: '',
    utmContent: 'story_01',
    utmTerm: '',
    landingUrl: '',
  });

  const [customFields, setCustomFields] = useState<CustomField[]>([
    { id: 'fullName', label: 'Ism va familiya', type: 'text', placeholder: 'Ali Valiyev', required: true },
    { id: 'phone', label: 'Telefon raqam', type: 'tel', placeholder: '+998 90 123 45 67', required: true },
    { id: 'course', label: 'Qiziqtirgan yo‘nalish', type: 'select', optionsStr: 'Frontend Development, Backend Development, Cyber Security', required: true },
  ]);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/marketing/utm');
      const data = await res.json();
      if (data.success) {
        setLinks(data.links || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/marketing/campaigns');
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLinks();
    fetchCampaigns();
  }, []);

  const handleAddField = () => {
    const newId = `field_${Date.now()}`;
    setCustomFields([
      ...customFields,
      { id: newId, label: 'Yangi maydon', type: 'text', placeholder: '', required: false },
    ]);
  };

  const handleRemoveField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, key: keyof CustomField, value: any) => {
    const updated = [...customFields];
    updated[index] = { ...updated[index], [key]: value };
    setCustomFields(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      const formattedFields = customFields.map((f) => ({
        id: f.id,
        label: f.label,
        type: f.type,
        placeholder: f.placeholder,
        required: f.required,
        options: f.type === 'select' && f.optionsStr ? f.optionsStr.split(',').map((o) => o.trim()).filter(Boolean) : [],
      }));

      const res = await fetch('/api/marketing/utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          useInternalForm,
          customFields: formattedFields,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        showToast("UTM tracking havola va dinamik forma yaratildi!");
        setFormData({
          name: '',
          pageTitle: '',
          pageDescription: '',
          utmSource: 'instagram',
          utmMedium: 'target_ads',
          utmCampaignId: '',
          utmContent: 'story_01',
          utmTerm: '',
          landingUrl: '',
        });
        fetchLinks();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("UTM havolani o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/marketing/utm/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast("UTM havola o'chirildi");
        fetchLinks();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center space-x-3 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5" />
          <span>{toast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">🔗</span>
            UTM Yaratish & Dinamik Forma Builder
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Reklama havolalariga UTM teglari qo'shish hamda mijozlar uchun moslashuvchan (dynamic) ochiq forma yasash
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4 mr-2" />
          Yangi UTM + Dinamik Forma Yaratish
        </button>
      </div>

      {/* UTM Links List Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">Kampaniya / Havola Nomi</th>
                <th className="p-4">UTM Source</th>
                <th className="p-4">UTM Medium</th>
                <th className="p-4">Ochiq Forma Maydonlari</th>
                <th className="p-4 text-center">Tashrif (Clicks)</th>
                <th className="p-4 text-center">Leadlar</th>
                <th className="p-4">To'liq Public URL</th>
                <th className="p-4 text-center">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    Ma'lumotlar yuklanmoqda...
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    UTM havolalar topilmadi
                  </td>
                </tr>
              ) : (
                links.map((link) => (
                  <tr key={link._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      <div>{link.name}</div>
                      {link.pageTitle && <div className="text-[10px] text-slate-400 font-normal">{link.pageTitle}</div>}
                    </td>
                    <td className="p-4 font-bold text-blue-600">
                      {link.utmSource}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">
                      {link.utmMedium}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {link.customFields && link.customFields.length > 0 ? (
                          link.customFields.map((f: any, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                              {f.label} ({f.type})
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[10px]">Standart (Ism + Tel)</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-900 dark:text-white">
                      {link.clicksCount || 0}
                    </td>
                    <td className="p-4 text-center font-bold text-emerald-600">
                      {link.leadsCount || 0}
                    </td>
                    <td className="p-4 max-w-xs truncate font-mono text-[10px] text-slate-500">
                      <a href={link.fullUrl} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 hover:underline">
                        {link.fullUrl}
                      </a>
                    </td>
                    <td className="p-4 text-center space-x-1.5 whitespace-nowrap">
                      {/* Copy Link Button */}
                      <button
                        onClick={() => copyToClipboard(link.fullUrl, link._id)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="URL nusxalash"
                      >
                        {copiedId === link._id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>

                      {/* QR Modal Button */}
                      {link.qrCodeUrl && (
                        <button
                          onClick={() => setQrModalUrl(link.qrCodeUrl)}
                          className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                          title="QR-Kod ko'rish"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      )}

                      {/* Open Link */}
                      <a
                        href={link.fullUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 inline-block"
                        title="Ochiq formada ochish"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      {/* Delete Link */}
                      <button
                        onClick={() => handleDelete(link._id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Preview Modal */}
      {qrModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xs w-full p-6 space-y-4 text-center border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">UTM QR-Kod</h3>
            <div className="p-3 bg-white rounded-2xl inline-block shadow-inner">
              <img src={qrModalUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>
            <button
              onClick={() => setQrModalUrl(null)}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Yopish
            </button>
          </div>
        </div>
      )}

      {/* Modal: Create UTM + Dynamic Form Builder */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-amber-500" />
                UTM Tracking + Dinamik Ochiq Forma Yasash
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs font-medium">
              {/* Basic UTM Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-amber-600">
                  1. UTM Kampaniya va Teglar
                </h4>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Kampaniya / Havola Nomi *</label>
                  <input
                    type="text"
                    required
                    placeholder="Insta Story Reels 01 Target"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">UTM Source *</label>
                    <input
                      type="text"
                      required
                      placeholder="instagram"
                      value={formData.utmSource}
                      onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">UTM Medium *</label>
                    <input
                      type="text"
                      required
                      placeholder="target_ads"
                      value={formData.utmMedium}
                      onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Biriktirilgan CRM Kampaniya</label>
                  <select
                    value={formData.utmCampaignId}
                    onChange={(e) => setFormData({ ...formData, utmCampaignId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="">Kampaniyasiz</option>
                    {campaigns.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Landing Choice */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-amber-600">
                  2. Ochiq Forma Sahifasi Sozlamasi
                </h4>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="formType"
                      checked={useInternalForm}
                      onChange={() => setUseInternalForm(true)}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">Avto-yasaladigan Ochiq Forma (/l/link_id)</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="formType"
                      checked={!useInternalForm}
                      onChange={() => setUseInternalForm(false)}
                      className="text-amber-500 focus:ring-amber-500"
                    />
                    <span className="font-bold text-slate-900 dark:text-white">Tashqi Veb-sayt URL</span>
                  </label>
                </div>

                {useInternalForm ? (
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Forma Sahifasi Sarlavhasi</label>
                      <input
                        type="text"
                        placeholder="InFast IT-Academy — Bepul Sinov Darsi"
                        value={formData.pageTitle}
                        onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Forma Izohi</label>
                      <textarea
                        rows={2}
                        placeholder="Quyidagi ma'lumotlarni to'ldiring va mutaxassisimiz siz bilan bog'lanadi."
                        value={formData.pageDescription}
                        onChange={(e) => setFormData({ ...formData, pageDescription: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Tashqi Landing URL *</label>
                    <input
                      type="url"
                      placeholder="https://infast.uz/special-promo"
                      value={formData.landingUrl}
                      onChange={(e) => setFormData({ ...formData, landingUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                )}
              </div>

              {/* Dynamic Custom Form Field Builder */}
              {useInternalForm && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] text-amber-600 flex items-center gap-1.5">
                      <FormInput className="w-4 h-4 text-amber-500" />
                      3. Dinamik Forma Maydonlari Builder (Input, Checkbox, Select...)
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold text-[11px] flex items-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Maydon Qo'shish
                    </button>
                  </div>

                  <div className="space-y-3">
                    {customFields.map((field, idx) => (
                      <div key={idx} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-slate-600 dark:text-slate-300">
                            Maydon #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveField(idx)}
                            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500">Maydon Nomi (Label)</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => handleFieldChange(idx, 'label', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                            />
                          </div>

                          <div className="sm:col-span-1">
                            <label className="block text-[10px] font-bold text-slate-500">Maydon Turi</label>
                            <select
                              value={field.type}
                              onChange={(e) => handleFieldChange(idx, 'type', e.target.value as any)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold"
                            >
                              <option value="text">Matn (Text)</option>
                              <option value="tel">Telefon (Tel)</option>
                              <option value="number">Raqam (Number)</option>
                              <option value="select">Tanlov Dropdown (Select)</option>
                              <option value="checkbox">Rozilik Checkbox</option>
                              <option value="textarea">Katta Matn (Textarea)</option>
                            </select>
                          </div>

                          <div className="sm:col-span-1 flex items-end">
                            <label className="flex items-center space-x-2 cursor-pointer py-1.5">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => handleFieldChange(idx, 'required', e.target.checked)}
                                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Majburiy maydon</span>
                            </label>
                          </div>
                        </div>

                        {/* Options input if Select type */}
                        {field.type === 'select' && (
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500">Variantlar (vergul bilan ajratilgan)</label>
                            <input
                              type="text"
                              placeholder="Frontend, Backend, Cyber Security"
                              value={field.optionsStr || ''}
                              onChange={(e) => handleFieldChange(idx, 'optionsStr', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20"
                >
                  {submitting ? 'Saqlanmoqda...' : 'UTM va Forma Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
