'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Zap, Phone, Award, Download, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function PublicExamResultPage() {
  const params = useParams();
  const publicExamId = params.publicExamId as string;

  const [phone, setPhone] = useState('+998');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States: 'input' -> 'countdown' -> 'result'
  const [step, setStep] = useState<'input' | 'countdown' | 'result'>('input');
  const [countdown, setCountdown] = useState(5);
  const [examData, setExamData] = useState<any>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const COUNTDOWN_MESSAGES: Record<number, string> = {
    5: "Tayyormisiz? 👀",
    4: "Biroz qoldi...",
    3: "Natijangiz tayyorlanmoqda...",
    2: "Hayajon boshlandimi? 😎",
    1: "TAYYOR! 🚀",
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/public/exam/${publicExamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setExamData(data);
        setStep('countdown');
        startCountdown();
      } else {
        setError(data.error || "Ma'lumot topilmadi");
      }
    } catch (err: any) {
      setError("Ulanish xatosi. Qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    setCountdown(5);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStep('result');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (step === 'result' && examData?.studentResult?.status === 'PASSED') {
      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [step, examData]);

  const handleDownloadCertificate = async () => {
    const certElement = document.getElementById('academic-certificate');
    if (!certElement) return;

    setGeneratingPdf(true);
    try {
      const canvas = await html2canvas(certElement, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Sertifikat_${examData.studentResult.studentName.replace(/\s+/g, '_')}.pdf`);
    } catch (e: any) {
      alert("Sertifikat yaratishda xatolik: " + e.message);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-infast-500 selection:text-white">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-infast-600 to-infast-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-infast-500/20 mb-3">
          <Zap className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">INFAST IT-ACADEMY</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">Imtihon Natijasini Tekshirish</p>
      </div>

      {/* Step 1: Phone Verification Input */}
      {step === 'input' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/60 shadow-2xl space-y-4"
        >
          <div className="text-center">
            <h2 className="text-base font-bold text-white">Telefon raqamingizni kiriting</h2>
            <p className="text-xs text-slate-400 mt-1">Imtihondagi shaxsiy natijangizni ko'rish uchun</p>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyPhone} className="space-y-4">
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 271 00 27"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/60 border border-slate-700 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-infast-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-infast-500 to-infast-600 hover:from-infast-600 hover:to-infast-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-infast-500/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Natijani Ko'rish</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Step 2: 5-Second Countdown Animation (BUSINESS RULE 23 & SECTION 30) */}
      {step === 'countdown' && (
        <motion.div
          key={countdown}
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
          transition={{ duration: 0.4 }}
          className="text-center space-y-6 py-12"
        >
          <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-infast-600 to-infast-500 text-white font-black text-6xl flex items-center justify-center mx-auto shadow-2xl shadow-infast-500/40 border-4 border-white/20 animate-bounce">
            {countdown}
          </div>
          <p className="text-xl font-extrabold text-white tracking-wide">
            {COUNTDOWN_MESSAGES[countdown] || "Tayyormisiz? 👀"}
          </p>
        </motion.div>
      )}

      {/* Step 3: Result Reveal Experience */}
      {step === 'result' && examData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6 text-center"
        >
          {/* Passed Result Experience */}
          {examData.studentResult.status === 'PASSED' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">🎉 TABRIKLAYMIZ!</h2>
                <p className="text-xs text-slate-300 font-medium mt-1">
                  Siz imtihondan muvaffaqiyatli o'tdingiz!
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2">
                <p className="text-xs text-slate-400 font-semibold">{examData.studentResult.studentName}</p>
                <div className="text-3xl font-black text-emerald-400">
                  {examData.studentResult.score} <span className="text-sm text-slate-400">/ {examData.examInfo.maxScore} ball</span>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs">
                  🟢 O'TDINGIZ
                </span>
              </div>

              {/* Certificate Download Button */}
              <button
                onClick={handleDownloadCertificate}
                disabled={generatingPdf}
                className="w-full py-3.5 bg-gradient-to-r from-infast-500 to-infast-600 hover:from-infast-600 hover:to-infast-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-infast-500/30 flex items-center justify-center space-x-2 transition-all"
              >
                {generatingPdf ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>🏆 Sertifikatni Olish (PDF)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Failed Result Experience */}
          {examData.studentResult.status === 'FAILED' && (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">Bu safar imtihondan o'ta olmadingiz</h2>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-2">
                <p className="text-xs text-slate-400 font-semibold">{examData.studentResult.studentName}</p>
                <div className="text-3xl font-black text-rose-400">
                  {examData.studentResult.score} <span className="text-sm text-slate-400">/ {examData.examInfo.maxScore} ball</span>
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 font-bold text-xs">
                  🔴 O'TMADINGIZ
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium leading-relaxed">
                Endi darsda ustozingiz bilan gaplashing va keyingi imtihonga yanada yaxshi tayyorlaning. 💪
              </p>
            </div>
          )}

          {/* Absent Result Experience */}
          {examData.studentResult.status === 'ABSENT' && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-700 space-y-2">
                <p className="text-xs text-slate-400 font-semibold">{examData.studentResult.studentName}</p>
                <span className="inline-block px-3 py-1.5 rounded-full bg-slate-700 text-slate-200 font-bold text-xs">
                  ⚪ Imtihonda qatnashmagansiz
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => setStep('input')}
            className="text-xs text-slate-400 hover:text-white font-semibold inline-flex items-center space-x-1 pt-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Boshqa telefon raqami kiritish</span>
          </button>
        </motion.div>
      )}

      {/* Hidden Certificate Template for PDF Generation */}
      {examData?.studentResult?.status === 'PASSED' && (
        <div className="fixed left-[-9999px] top-[-9999px]">
          <div
            id="academic-certificate"
            className="w-[1123px] h-[794px] bg-white text-slate-900 p-12 flex flex-col justify-between border-[14px] border-slate-900 relative font-sans overflow-hidden"
          >
            {/* Inner Gold Frame */}
            <div className="absolute inset-3 border-2 border-amber-400/80 pointer-events-none rounded-sm" />

            {/* Corner Decorative Ornaments */}
            <div className="absolute top-5 left-5 w-12 h-12 border-t-4 border-l-4 border-amber-500 pointer-events-none" />
            <div className="absolute top-5 right-5 w-12 h-12 border-t-4 border-r-4 border-amber-500 pointer-events-none" />
            <div className="absolute bottom-5 left-5 w-12 h-12 border-b-4 border-l-4 border-amber-500 pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-12 h-12 border-b-4 border-r-4 border-amber-500 pointer-events-none" />

            {/* Background Watermark Accent */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
              <Zap className="w-[500px] h-[500px] text-slate-900" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-slate-200/80 pb-5 relative z-10 mx-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-infast-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-infast-500/20">
                  <Zap className="w-8 h-8 fill-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">INFAST IT-ACADEMY</h1>
                  <p className="text-xs font-bold text-infast-600 tracking-widest uppercase">Axborot Texnologiyalari Akademiyasi</p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">SERTIFIKAT RAQAMI</span>
                <p className="text-sm font-mono font-black text-slate-900">
                  INF-2026-{(publicExamId || 'CERT').slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="text-center my-4 space-y-3 relative z-10 px-8">
              <div className="inline-flex items-center space-x-2 px-6 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black uppercase tracking-widest shadow-sm">
                <span>🏆 RASMIY AKADEMIK SERTIFIKAT</span>
              </div>

              <h2 className="text-5xl font-black text-slate-900 tracking-tight uppercase pt-2">
                SERTIFIKAT
              </h2>
              <p className="text-xs font-bold text-amber-600 tracking-[0.3em] uppercase">CERTIFICATE OF ACHIEVEMENT</p>

              <p className="text-xs text-slate-500 font-medium max-w-lg mx-auto pt-2">
                Ushbu sertifikat egasi INFAST IT-ACADEMY o'quv markazida tashkil etilgan rasmiy imtihon sinovidan muvaffaqiyatli o'tganligini tasdiqlaydi.
              </p>

              {/* Student Name */}
              <div className="py-2">
                <h3 className="text-4xl font-black text-infast-600 border-b-2 border-amber-400 inline-block px-10 pb-2 tracking-tight">
                  {examData.studentResult.studentName}
                </h3>
              </div>

              {/* Course & Score Statement */}
              <p className="text-sm text-slate-700 font-semibold max-w-2xl mx-auto leading-relaxed pt-1">
                <strong className="text-slate-900 font-extrabold">{examData.examInfo.courseName}</strong> yo'nalishi bo'yicha akademik imtihondan{" "}
                <strong className="text-emerald-600 font-extrabold">{examData.studentResult.score} / {examData.examInfo.maxScore}</strong> ball to'plab, yuqori ko'rsatkich bilan muvaffaqiyatli o'tdi.
              </p>
            </div>

            {/* Footer Details with QR Code & Director Signature */}
            <div className="flex items-end justify-between border-t-2 border-slate-200/80 pt-4 relative z-10 text-xs mx-4">
              {/* Left: Organization Info */}
              <div className="space-y-1">
                <p className="font-black text-slate-900 text-sm">INFAST26 XK</p>
                <p className="text-slate-500 font-medium">Berilgan sana: {new Date().toLocaleDateString('uz-UZ')}</p>
                <div className="flex items-center space-x-1.5 text-[11px] font-bold text-emerald-600 pt-1">
                  <span>✅ RASMIY HAKIQIY SERTIFIKAT</span>
                </div>
              </div>

              {/* Center: Dynamic QR Code Verification */}
              <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                    typeof window !== 'undefined' ? `${window.location.origin}/result/${publicExamId}` : `https://infast.uz/result/${publicExamId}`
                  )}`}
                  alt="Certificate QR Code"
                  className="w-16 h-16 object-contain"
                />
                <div className="text-left max-w-[140px]">
                  <p className="text-[10px] font-bold text-slate-800 leading-tight">Tekshirish uchun QR-kodni skaner qiling</p>
                  <p className="text-[9px] text-slate-400 font-mono mt-0.5">www.infast.uz</p>
                </div>
              </div>

              {/* Right: Director Details */}
              <div className="text-right space-y-1">
                <p className="font-extrabold text-slate-900 text-sm">Director: Muhammadaziz Yakubov</p>
                <p className="text-slate-500 font-medium">INFAST IT-ACADEMY Bosh Direktori</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
