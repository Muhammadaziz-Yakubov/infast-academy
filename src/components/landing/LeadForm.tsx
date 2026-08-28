'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles, Send } from 'lucide-react';
import { useUTM } from '@/lib/useUTM';
import { motion } from 'framer-motion';

export function LeadForm() {
  const utmParams = useUTM();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState('Frontend Development');
  const [age, setAge] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      setError("Iltimos, ismingiz va telefon raqamingizni kiriting!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/public/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          phone,
          notes: `Yo'nalish: ${course} | Yosh: ${age || 'Kiritilmadi'} | ${notes}`,
          utmSource: utmParams.utmSource,
          utmMedium: utmParams.utmMedium,
          utmCampaign: utmParams.utmCampaign,
          utmContent: utmParams.utmContent,
          utmTerm: utmParams.utmTerm,
          landingSlug: utmParams.landingSlug,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setFullName('');
        setPhone('');
        setNotes('');
        setAge('');
      } else {
        setError(data.error || "Arizani yuborishda xatolik yuz berdi");
      }
    } catch (e) {
      setError("Internet aloqasini tekshiring va qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="ariza" className="py-24 bg-slate-950 text-white relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[550px] bg-infast-500/15 blur-[200px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-infast-500/30 p-8 sm:p-12 shadow-2xl shadow-infast-500/10 backdrop-blur-2xl space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-infast-500/10 border border-infast-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-infast-400">
              <Sparkles className="w-4 h-4" />
              <span>BEPUL KONSULTATSIYA & QABUL</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              IT'dagi ilk qadamingizni <br />
              <span className="text-infast-500">bugun boshlang.</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              Kursingizni tanlang va InFast mutaxassisi 15 daqiqa ichida siz bilan bog‘lanadi.
            </p>
          </div>

          {/* Success Screen */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4 max-w-lg mx-auto"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white">Arizangiz qabul qilindi!</h3>
              <p className="text-sm text-slate-300">
                Tez orada InFast IT-Academy mutaxassisi siz bilan bog‘lanadi va bepul sinov darsiga taklif etadi.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:bg-slate-800 transition-colors"
              >
                Yangi ariza topshirish
              </button>
            </motion.div>
          ) : (
            /* Lead Form */
            <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
              {error && (
                <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Ism va familiyangiz *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ali Valiyev"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-infast-500 focus:ring-1 focus:ring-infast-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Telefon raqamingiz *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-infast-500 focus:ring-1 focus:ring-infast-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Yo'nalishni tanlang *
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-infast-500"
                  >
                    <option value="Frontend Development">Frontend Development (React, Next.js)</option>
                    <option value="Backend Development">Backend Development (Node.js, Mongo)</option>
                    <option value="Cyber Security">Cyber Security (Linux, Pentest)</option>
                    <option value="Hali tanlamadim">Hali tanlamadim (Maslahat kerak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Yoshingiz
                  </label>
                  <input
                    type="number"
                    placeholder="Masalan: 19"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-infast-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Qo'shimcha izoh yoki savolingiz
                </label>
                <textarea
                  rows={3}
                  placeholder="Sinov darsiga qatnashmoqchiman..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:border-infast-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-infast-600 via-infast-500 to-amber-500 text-white font-bold text-base shadow-xl shadow-infast-500/25 hover:shadow-infast-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Bepul konsultatsiya olish</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
