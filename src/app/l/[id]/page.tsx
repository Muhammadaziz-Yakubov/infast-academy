'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Zap,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  BookOpen,
  Clock,
  MessageSquare,
  ArrowRight,
  Star,
  Users,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicUTMLandingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const linkId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [linkData, setLinkData] = useState<any>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});

  useEffect(() => {
    const fetchLanding = async () => {
      try {
        const res = await fetch(`/api/public/utm-landing/${linkId}`);
        const data = await res.json();
        if (data.success && data.link) {
          setLinkData(data.link);

          // Initialize default form values
          const initialValues: Record<string, any> = {};
          if (data.link.customFields && Array.isArray(data.link.customFields)) {
            data.link.customFields.forEach((field: any) => {
              if (field.type === 'checkbox') {
                initialValues[field.id] = false;
              } else {
                initialValues[field.id] = '';
              }
            });
          }
          setFormValues(initialValues);
        } else {
          setError(data.error || "Forma topilmadi");
        }
      } catch (e) {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };

    if (linkId) fetchLanding();
  }, [linkId]);

  const handleChange = (fieldId: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check mandatory standard fields (fullName & phone) or first two inputs
    let fullName = formValues.fullName || formValues.name || formValues.ism || '';
    let phone = formValues.phone || formValues.tel || formValues.telefon || '';

    // Fallback if custom field names are used
    if (!fullName) {
      const textKeys = Object.keys(formValues).filter(
        (k) => typeof formValues[k] === 'string' && formValues[k].trim() !== ''
      );
      if (textKeys.length > 0) fullName = formValues[textKeys[0]];
    }
    if (!phone) {
      const textKeys = Object.keys(formValues).filter(
        (k) => typeof formValues[k] === 'string' && formValues[k].trim() !== ''
      );
      if (textKeys.length > 1) phone = formValues[textKeys[1]];
    }

    if (!fullName || !phone) {
      setError("Iltimos, ismingiz va telefon raqamingizni kiriting");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Build notes string from all custom field answers
      const customAnswersFormatted = Object.entries(formValues)
        .map(([key, val]) => {
          const fieldDef = linkData?.customFields?.find((f: any) => f.id === key);
          const label = fieldDef?.label || key;
          return `${label}: ${val}`;
        })
        .join(' | ');

      const res = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          notes: customAnswersFormatted,
          utmSource: searchParams.get('utm_source') || linkData?.utmSource || 'UTM Link',
          utmMedium: searchParams.get('utm_medium') || linkData?.utmMedium || 'cpc',
          utmCampaign: searchParams.get('utm_campaign') || linkData?.utmCampaignId?.name || undefined,
          utmContent: searchParams.get('utm_content') || linkData?.utmContent || undefined,
          utmTerm: searchParams.get('utm_term') || linkData?.utmTerm || undefined,
          landingSlug: linkId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error || "Arizani yuborishda xatolik");
      }
    } catch (e) {
      setError("Internet aloqasini tekshiring va qayta urinib ko'ring");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] text-white flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-xs font-semibold text-neutral-400">Sahifa yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] flex flex-col items-center justify-between p-4 sm:p-8 relative overflow-hidden font-sans selection:bg-amber-500 selection:text-black">
      {/* Background Glowing Mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[450px] bg-gradient-to-b from-amber-500/15 via-infast-600/10 to-transparent blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/10 blur-[180px] pointer-events-none" />

      {/* Top Branding Pill */}
      <header className="w-full max-w-xl mx-auto flex items-center justify-between py-2 relative z-10">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-infast-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-infast-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4 fill-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white">
            InFast <span className="text-neutral-400 font-normal text-xs ml-1">IT Academy</span>
          </span>
        </Link>

        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-semibold text-neutral-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Rasmiy Qabul</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-lg w-full relative z-10 py-6 sm:py-8 space-y-6">
        {/* Header Headline & Offer */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Maxsus Taklif</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-[1.15]">
            {linkData?.pageTitle || 'INFAST IT-ACADEMY'}
          </h1>

          {linkData?.pageDescription && (
            <p className="text-xs sm:text-sm text-neutral-400 max-w-md mx-auto leading-relaxed">
              {linkData.pageDescription}
            </p>
          )}

          {/* Trust Highlights */}
          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-neutral-400 font-medium">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" /> 4.9/5 Baho
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-400" /> 1,200+ Bitiruvchilar
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-emerald-400" /> Sertifikat
            </span>
          </div>
        </div>

        {/* Success View */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 sm:p-10 rounded-[32px] bg-neutral-900/90 border border-emerald-500/40 text-center space-y-5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Arizangiz qabul qilindi!</h2>
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 max-w-sm mx-auto leading-relaxed">
                Mutaxassisimiz tez orada siz bilan bog'lanib, bepul sinov darsi va barcha savollaringiz bo'yicha to'liq ma'lumot beradi.
              </p>
            </div>

            {/* Next Steps Timeline */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-left text-xs space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                Keyingi qadamlar:
              </span>
              <div className="space-y-1.5 text-neutral-300">
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>Operatorimiz qo'ng'irog'ini kuting</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-neutral-400 flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>Bepul sinov darsi vaqtini belgilang</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-neutral-400 flex items-center justify-center text-[10px] font-bold">3</span>
                  <span>Darslarga qo'shiling va dasturlashni boshlang</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <Link
                href="/student-app"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs transition-all shadow-md"
              >
                📱 Student App ilovamizni yuklang
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-white font-semibold text-xs transition-all"
              >
                Bosh sahifaga qaytish
              </Link>
            </div>
          </motion.div>
        ) : (
          /* Dynamic Form View */
          <div className="p-6 sm:p-8 rounded-[32px] bg-neutral-900/80 border border-white/[0.1] shadow-2xl backdrop-blur-2xl space-y-5">
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {/* Fallback Standard Fields */}
              {(!linkData?.customFields || linkData.customFields.length === 0) && (
                <>
                  <div>
                    <label className="block text-neutral-300 font-bold mb-1.5">
                      Ism va familiyangiz *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="text"
                        required
                        placeholder="Ali Valiyev"
                        value={formValues.fullName || ''}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/60 border border-white/[0.1] text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-bold mb-1.5">
                      Telefon raqamingiz *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                      <input
                        type="tel"
                        required
                        placeholder="+998 90 123 45 67"
                        value={formValues.phone || ''}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-black/60 border border-white/[0.1] text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Dynamic Form Custom Fields */}
              {linkData?.customFields?.map((field: any) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-neutral-300 font-bold">
                    {field.label} {field.required && <span className="text-amber-500">*</span>}
                  </label>

                  {/* Text / Tel / Number */}
                  {(field.type === 'text' || field.type === 'tel' || field.type === 'number') && (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/[0.1] text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  )}

                  {/* Dropdown Select */}
                  {field.type === 'select' && (
                    <select
                      required={field.required}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/[0.1] text-sm font-semibold text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 cursor-pointer"
                    >
                      <option value="" className="bg-neutral-900 text-white">Tanlang...</option>
                      {field.options?.map((opt: string, i: number) => (
                        <option key={i} value={opt} className="bg-neutral-900 text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Textarea */}
                  {field.type === 'textarea' && (
                    <textarea
                      rows={3}
                      required={field.required}
                      placeholder={field.placeholder || "Savollaringizni yozib qoldiring..."}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/[0.1] text-sm font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none"
                    />
                  )}

                  {/* Checkbox */}
                  {field.type === 'checkbox' && (
                    <label className="flex items-center space-x-3 cursor-pointer py-1.5">
                      <input
                        type="checkbox"
                        checked={Boolean(formValues[field.id])}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        className="w-4 h-4 rounded bg-black border-white/20 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-semibold text-neutral-300">
                        {field.placeholder || "Roziman"}
                      </span>
                    </label>
                  )}
                </div>
              ))}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-infast-600 via-amber-500 to-orange-500 text-white font-black text-sm shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 pt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Hoziroq Ariza Qoldirish</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-1 text-[11px] text-neutral-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ma'lumotlaringiz maxfiy va xavfsiz saqlanadi</span>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Mini Footer */}
      <footer className="w-full max-w-xl mx-auto py-4 text-center text-[11px] text-neutral-500 relative z-10 border-t border-white/[0.06]">
        &copy; {new Date().getFullYear()} InFast IT-Academy. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  );
}
