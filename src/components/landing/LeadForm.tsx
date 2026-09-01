'use client';

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Loader2, Send } from 'lucide-react';
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
    <section id="ariza" className="py-24 bg-black text-white relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-neutral-900/40 border border-white/10 p-8 sm:p-12 shadow-2xl backdrop-blur-2xl space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-full text-xs font-medium text-neutral-300">
              <span>Bepul konsultatsiya & Qabul</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
              IT'dagi ilk qadamingizni <br />
              <span className="text-neutral-400 font-normal">bugun boshlang.</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-normal">
              Kursingizni tanlang va InFast mutaxassisi 15 daqiqa ichida siz bilan bog‘lanadi.
            </p>
          </div>

          {/* Success Screen */}
          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 max-w-md mx-auto"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">Arizangiz qabul qilindi!</h3>
              <p className="text-xs text-neutral-400">
                Tez orada InFast IT-Academy mutaxassisi siz bilan bog‘lanadi va bepul sinov darsiga taklif etadi.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-semibold hover:bg-neutral-200 transition-colors"
              >
                Yangi ariza topshirish
              </button>
            </motion.div>
          ) : (
            /* Lead Form */
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
              {error && (
                <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Ism va familiyangiz *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ali Valiyev"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-black/60 border border-white/10 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Telefon raqamingiz *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-black/60 border border-white/10 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Yo'nalishni tanlang *
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-black/60 border border-white/10 text-xs font-medium text-white focus:outline-none focus:border-white/30"
                  >
                    <option value="Frontend Development">Frontend Development (React, Next.js)</option>
                    <option value="Backend Development">Backend Development (Node.js, Mongo)</option>
                    <option value="Cyber Security">Cyber Security (Linux, Pentest)</option>
                    <option value="Hali tanlamadim">Hali tanlamadim (Maslahat kerak)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1">
                    Yoshingiz
                  </label>
                  <input
                    type="number"
                    placeholder="Masalan: 19"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-3 rounded-full bg-black/60 border border-white/10 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1">
                  Qo'shimcha izoh yoki savolingiz
                </label>
                <textarea
                  rows={3}
                  placeholder="Sinov darsiga qatnashmoqchiman..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-black/60 border border-white/10 text-xs font-medium text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 active:scale-95 transition-all shadow-xl shadow-white/10 flex items-center justify-center space-x-2 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Yuborilmoqda...</span>
                  </>
                ) : (
                  <>
                    <span>Bepul konsultatsiya olish</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
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
