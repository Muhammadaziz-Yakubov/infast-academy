'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Zap, Phone, Clock, AlertCircle, ArrowRight, CheckCircle2, FileText, ChevronRight, ChevronLeft, Send, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TakeExamPage() {
  const params = useParams();
  const publicExamId = params.publicExamId as string;

  const [phone, setPhone] = useState('+998');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'auth' | 'testing' | 'submitted'>('auth');

  // Exam and student data
  const [examData, setExamData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Test state
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [submitting, setSubmitting] = useState(false);

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`/api/public/take-exam/${publicExamId}?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setExamData(data.exam);
        setStudentData(data.student);
        setAlreadySubmitted(data.alreadySubmitted || false);

        if (data.alreadySubmitted) {
          // If already submitted, stay on info screen with alreadySubmitted alert
        } else {
          // Initialize timer seconds
          const durationSec = (data.exam.durationMinutes || 30) * 60;
          setTimeLeft(durationSec);
        }
      } else {
        setError(data.error || "Ma'lumot topilmadi");
      }
    } catch (err: any) {
      setError("Ulanishda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    if (!examData?.questions || examData.questions.length === 0) {
      alert("Ushbu imtihonda test savollari mavjud emas. Ma'muriyatga murojaat qiling.");
      return;
    }
    setStep('testing');
  };

  // Countdown timer effect during testing
  useEffect(() => {
    if (step !== 'testing' || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit when time runs out
          handleSubmitTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeft]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitTest = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm("Testni yakunlab, javoblarni topshirmoqchimisiz?")) return;

    setSubmitting(true);
    try {
      const answersArray = Object.entries(userAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));

      const res = await fetch(`/api/public/take-exam/${publicExamId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          answers: answersArray,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('submitted');
      } else {
        alert(data.error || "Topshirishda xatolik yuz berdi");
      }
    } catch (e: any) {
      alert("Topshirishda ulanish xatosi yuz berdi: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-infast-500 selection:text-white">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-infast-600 to-infast-500 mx-auto flex items-center justify-center text-white shadow-xl shadow-infast-500/20 mb-3">
          <Zap className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-xl font-extrabold text-white tracking-tight">INFAST IT-ACADEMY</h1>
        <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wider">Online Imtihon Sinovi</p>
      </div>

      {/* Step 1: Phone Verification & Exam Info */}
      {step === 'auth' && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-5"
        >
          {!studentData ? (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-base font-bold text-white">Telefon raqamingizni kiriting</h2>
                <p className="text-xs text-slate-400 mt-1">Imtihonga kirish va kimligingizni tasdiqlash uchun</p>
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
                    className="w-full pl-10 pr-4 py-3.5 bg-slate-950/70 border border-slate-800 rounded-xl font-mono text-sm text-white focus:outline-none focus:border-infast-500 transition-colors"
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
                      <span>Kirish va Tekshirish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Student verified - Exam Overview */
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 text-center">
                <span className="text-[10px] font-bold text-infast-500 bg-infast-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {examData.courseName} • {examData.groupName}
                </span>
                <h2 className="text-lg font-black text-white pt-1">{examData.name}</h2>
                <p className="text-xs text-slate-400 font-medium">O'quvchi: {studentData.firstName} {studentData.lastName}</p>
              </div>

              {alreadySubmitted ? (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium space-y-2 text-center">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-amber-400" />
                  <p className="font-bold text-sm">Siz ushbu testni topshirib bo'lgansiz!</p>
                  <p className="text-slate-300 text-[11px]">
                    Natijalar o'qituvchi/administrator tomonidan e'lon qilingandan so'ng natijalar havolasi orqali bahoingizni ko'rishingiz mumkin.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <Clock className="w-5 h-5 text-infast-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold">Vaqt Chegarasi</p>
                      <p className="text-sm font-extrabold text-white">{examData.durationMinutes} daqiqa</p>
                    </div>
                    <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                      <FileText className="w-5 h-5 text-infast-400 mx-auto mb-1" />
                      <p className="text-[10px] text-slate-400 font-bold">Savollar Soni</p>
                      <p className="text-sm font-extrabold text-white">{examData.questionsCount} ta savol</p>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-1.5 p-3 rounded-xl bg-slate-950/40 border border-slate-800/80">
                    <p className="font-bold text-slate-300">📌 Qoidalar:</p>
                    <p>• Testni boshlagach taymer to'xtamaydi.</p>
                    <p>• Vaqt tugaganda test avtomatik ravishda topshiriladi.</p>
                    <p>• Natijalar e'lon qilinmagunicha javoblar va ballar sir saqlanadi.</p>
                  </div>

                  <button
                    onClick={handleStartExam}
                    className="w-full py-4 bg-gradient-to-r from-infast-500 to-infast-600 hover:from-infast-600 hover:to-infast-700 text-white font-black text-sm rounded-xl shadow-xl shadow-infast-500/30 flex items-center justify-center space-x-2 transition-all"
                  >
                    <span>🚀 Testni Boshlash</span>
                  </button>
                </>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Step 2: Interactive Testing View */}
      {step === 'testing' && examData && (
        <div className="w-full max-w-2xl space-y-4">
          {/* Top Bar: Progress & Live Countdown Timer */}
          <div className="bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 flex items-center justify-between shadow-xl">
            <div>
              <p className="text-xs text-slate-400 font-semibold">{examData.name}</p>
              <p className="text-sm font-bold text-white">
                Savol <span className="text-infast-400">{currentQIndex + 1}</span> / {examData.questions.length}
              </p>
            </div>

            <div className={`px-3.5 py-1.5 rounded-xl font-mono text-sm font-black flex items-center space-x-1.5 border ${
              timeLeft < 300 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-slate-950 text-infast-400 border-slate-800'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{formatTimer(timeLeft)}</span>
            </div>
          </div>

          {/* Question Dots Navigation */}
          <div className="flex flex-wrap gap-1.5 p-3 bg-slate-900/60 rounded-2xl border border-slate-800 justify-center">
            {examData.questions.map((q: any, idx: number) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isCurrent = idx === currentQIndex;

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-infast-500 text-white shadow-md shadow-infast-500/30 scale-105'
                      : isAnswered
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Current Question Card */}
          {examData.questions[currentQIndex] && (
            <motion.div
              key={currentQIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-800 shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
                <h3 className="text-base font-extrabold text-white leading-relaxed">
                  {currentQIndex + 1}. {examData.questions[currentQIndex].questionText}
                </h3>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-infast-500/10 text-infast-400 text-[10px] font-black border border-infast-500/20">
                  {examData.questions[currentQIndex].points || 10} ball
                </span>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {examData.questions[currentQIndex].options.map((opt: string, optIdx: number) => {
                  const isSelected = userAnswers[examData.questions[currentQIndex].id] === optIdx;
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectOption(examData.questions[currentQIndex].id, optIdx)}
                      className={`w-full p-4 rounded-2xl text-left font-medium text-sm flex items-center space-x-3 transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-r from-infast-600/30 to-infast-500/20 border-infast-500 text-white shadow-lg shadow-infast-500/10'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl font-mono font-bold text-xs flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-infast-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {optionLetters[optIdx] || optIdx + 1}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Actions */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setCurrentQIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentQIndex === 0}
                  className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Oldingisi</span>
                </button>

                {currentQIndex < examData.questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentQIndex((prev) => Math.min(prev + 1, examData.questions.length - 1))}
                    className="px-5 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-md shadow-infast-500/20"
                  >
                    <span>Keyingisi</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubmitTest(false)}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? "Topshirilmoqda..." : "Testni Yakunlash"}</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Step 3: Submitted Confirmation Screen */}
      {step === 'submitted' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl text-center space-y-6"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white">🎉 TEST TOPSHIRILDI!</h2>
            <p className="text-xs text-slate-300 font-medium mt-2 leading-relaxed">
              Javoblaringiz muvaffaqiyatli saqlandi.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center justify-center space-x-1.5 text-amber-400 font-bold">
              <Lock className="w-4 h-4" />
              <span>Natijalar hozircha yashirin</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-normal">
              O'qituvchi yoki administrator imtihon natijalarini rasman e'lon qilganidan so'ng, natijalar havolasi orqali bali ko'rishingiz mumkin bo'ladi.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
