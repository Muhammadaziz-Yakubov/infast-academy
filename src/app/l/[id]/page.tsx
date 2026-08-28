'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Zap, Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

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
        setError("Ma'lumotlarni yuklashda xatolik");
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
      const textKeys = Object.keys(formValues).filter((k) => typeof formValues[k] === 'string' && formValues[k].trim() !== '');
      if (textKeys.length > 0) fullName = formValues[textKeys[0]];
    }
    if (!phone) {
      const textKeys = Object.keys(formValues).filter((k) => typeof formValues[k] === 'string' && formValues[k].trim() !== '');
      if (textKeys.length > 1) phone = formValues[textKeys[1]];
    }

    if (!fullName || !phone) {
      setError("Iltimos, barcha majburiy maydonlarni to'liq to'ldiring");
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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-infast-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-infast-500 selection:text-white">
      {/* Background Glowing Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-infast-500/15 blur-[160px] pointer-events-none" />

      <div className="max-w-lg w-full relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-infast-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-infast-500/30">
            <Zap className="w-6 h-6 fill-white" />
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {linkData?.pageTitle || 'INFAST IT-ACADEMY'}
          </h1>
          {linkData?.pageDescription && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              {linkData.pageDescription}
            </p>
          )}
        </div>

        {/* Success View */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-4 shadow-2xl backdrop-blur-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Arizangiz qabul qilindi!</h2>
            <p className="text-xs text-slate-300">
              Tez orada mutaxassisimiz siz bilan bog‘lanadi hamda barcha savollaringizga javob beradi.
            </p>
          </motion.div>
        ) : (
          /* Dynamic Form View */
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-2xl space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
              {/* Standard Fallback Fields if Custom Fields list is empty */}
              {(!linkData?.customFields || linkData.customFields.length === 0) && (
                <>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Ism va familiyangiz *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ali Valiyev"
                      value={formValues.fullName || ''}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-infast-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5">
                      Telefon raqamingiz *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+998 90 123 45 67"
                      value={formValues.phone || ''}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-infast-500"
                    />
                  </div>
                </>
              )}

              {/* Dynamic Admin-Designed Custom Fields Rendering */}
              {linkData?.customFields?.map((field: any) => (
                <div key={field.id} className="space-y-1.5">
                  <label className="block text-slate-300 font-bold">
                    {field.label} {field.required && <span className="text-infast-500">*</span>}
                  </label>

                  {/* Input Type Text / Tel / Number */}
                  {(field.type === 'text' || field.type === 'tel' || field.type === 'number') && (
                    <input
                      type={field.type}
                      required={field.required}
                      placeholder={field.placeholder || ''}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-infast-500"
                    />
                  )}

                  {/* Select Dropdown */}
                  {field.type === 'select' && (
                    <select
                      required={field.required}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-infast-500 cursor-pointer"
                    >
                      <option value="">Tanlang...</option>
                      {field.options?.map((opt: string, i: number) => (
                        <option key={i} value={opt}>
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
                      placeholder={field.placeholder || ''}
                      value={formValues[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-infast-500 resize-none"
                    />
                  )}

                  {/* Checkbox */}
                  {field.type === 'checkbox' && (
                    <label className="flex items-center space-x-3 cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={Boolean(formValues[field.id])}
                        onChange={(e) => handleChange(field.id, e.target.checked)}
                        className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-infast-500 focus:ring-infast-500"
                      />
                      <span className="text-xs font-semibold text-slate-300">{field.placeholder || 'Ha, roziman'}</span>
                    </label>
                  )}
                </div>
              ))}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-infast-600 via-infast-500 to-amber-500 text-white font-extrabold text-sm shadow-xl shadow-infast-500/25 hover:shadow-infast-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 pt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Arizani Yuborish</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
