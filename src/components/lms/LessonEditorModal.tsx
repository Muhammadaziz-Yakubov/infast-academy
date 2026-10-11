'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  ClipboardCheck,
  Gamepad2,
  Sparkles,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wand2,
  Settings,
  Layers,
} from 'lucide-react';
import NotionTheoryEditor from './NotionTheoryEditor';
import InteractiveActivityEditor from './InteractiveActivityEditor';
import { ITestQuestion, IInteractiveActivity } from '@/models/Lesson';

interface LessonEditorModalProps {
  courseId: string;
  moduleId: string;
  lessonId?: string | null; // If provided, EDIT mode; else CREATE mode
  onClose: () => void;
  onSuccess: () => void;
}

export default function LessonEditorModal({
  courseId,
  moduleId,
  lessonId,
  onClose,
  onSuccess,
}: LessonEditorModalProps) {
  const [activeTab, setActiveTab] = useState<'basics' | 'theory' | 'test' | 'activity'>('basics');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [order, setOrder] = useState<number | string>(1);
  const [description, setDescription] = useState('');
  const [xpReward, setXpReward] = useState<number>(50);
  const [xcoinReward, setXcoinReward] = useState<number>(10);
  const [theoryContent, setTheoryContent] = useState('');
  const [testQuestions, setTestQuestions] = useState<ITestQuestion[]>([]);
  const [interactiveActivity, setInteractiveActivity] = useState<IInteractiveActivity>({
    type: 'MATCH_PAIRS',
    title: "Tushunchalar juftligini toping",
    instructions: "Chap tomondagi tushunchani o'ng tomondagi to'g'ri ta'rif bilan moslashtiring.",
    pairs: [
      { left: "const", right: "O'zgarmas o'zgaruvchi" },
      { left: "let", right: "O'zgaruvchan qiymat" },
      { left: "function", right: "Qayta ishlatiluvchi funksiya bloki" },
    ],
  });

  // Active question being edited in Test Tab
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number>(0);

  // Load existing lesson data if EDIT mode
  useEffect(() => {
    if (lessonId) {
      loadLessonData(lessonId);
    } else {
      // Create mode: pre-fill skeleton 9 questions if empty
      initializeSkeletonQuestions();
    }
  }, [lessonId]);

  const loadLessonData = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/lessons/${id}`);
      if (res.ok) {
        const json = await res.json();
        const les = json.lesson;
        if (les) {
          setTitle(les.title || '');
          setOrder(les.order || 1);
          setDescription(les.description || '');
          setXpReward(les.xpReward ?? 50);
          setXcoinReward(les.xcoinReward ?? 10);
          setTheoryContent(les.theoryContent || '');
          if (Array.isArray(les.testQuestions) && les.testQuestions.length > 0) {
            setTestQuestions(les.testQuestions);
          } else {
            initializeSkeletonQuestions();
          }
          if (les.interactiveActivity) {
            setInteractiveActivity(les.interactiveActivity);
          }
        }
      }
    } catch (e: any) {
      setErrorMessage(e.message || "Dars ma'lumotlarini yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  const initializeSkeletonQuestions = () => {
    const defaultList: ITestQuestion[] = [];
    for (let r = 1; r <= 3; r++) {
      for (let q = 1; q <= 3; q++) {
        defaultList.push({
          round: r as 1 | 2 | 3,
          question: `${r}-Bosqich, ${q}-Savol: Mavzu bo'yicha tushunchangizni tekshiring`,
          options: [
            "A) To'g'ri javob",
            "B) Noto'g'ri variant 1",
            "C) Noto'g'ri variant 2",
            "D) Noto'g'ri variant 3",
          ],
          correctAnswerIndex: 0,
          explanation: "Ushbu javobning to'g'riligi dars nazariyasiga asoslangan.",
        });
      }
    }
    setTestQuestions(defaultList);
  };

  // Test question helpers
  const handleAddQuestion = () => {
    const currentLen = testQuestions.length;
    const round = (Math.min(3, Math.floor(currentLen / 3) + 1)) as 1 | 2 | 3;
    const newQ: ITestQuestion = {
      round,
      question: `Yangi savol #${currentLen + 1}`,
      options: ['A variant', 'B variant', 'C variant', 'D variant'],
      correctAnswerIndex: 0,
      explanation: '',
    };
    const updated = [...testQuestions, newQ];
    setTestQuestions(updated);
    setEditingQuestionIdx(updated.length - 1);
  };

  const handleUpdateQuestion = (idx: number, patch: Partial<ITestQuestion>) => {
    const updated = [...testQuestions];
    updated[idx] = { ...updated[idx], ...patch };
    setTestQuestions(updated);
  };

  const handleOptionChange = (qIdx: number, optIdx: number, val: string) => {
    const updated = [...testQuestions];
    const opts = [...(updated[qIdx].options || ['', '', '', ''])];
    opts[optIdx] = val;
    updated[qIdx] = { ...updated[qIdx], options: opts };
    setTestQuestions(updated);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (testQuestions.length <= 1) {
      alert("Kamida 1 ta savol qolishi lozim!");
      return;
    }
    const updated = testQuestions.filter((_, i) => i !== idx);
    setTestQuestions(updated);
    setEditingQuestionIdx(Math.max(0, idx - 1));
  };

  // Validation
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return "Dars nomi kiritilishi shart!";
    }
    if (!order || Number(order) < 1) {
      return "Dars tartib raqami to'g'ri kiritilishi shart!";
    }
    if (!theoryContent.trim()) {
      return "Nazariy material (1. Nazariya) bo'sh bo'lishi mumkin emas!";
    }
    if (testQuestions.length !== 9) {
      return `Test savollari soni aynan 9 ta bo'lishi lozim (hozir ${testQuestions.length} ta). "9 ta savol skeletini yaratish" tugmasini bosing yoki savol qo'shing.`;
    }
    for (let i = 0; i < testQuestions.length; i++) {
      const q = testQuestions[i];
      if (!q.question.trim()) {
        return `#${i + 1}-savol matni bo'sh bo'lishi mumkin emas!`;
      }
      if (!Array.isArray(q.options) || q.options.length !== 4) {
        return `#${i + 1}-savolda aynan 4 ta variant bo'lishi lozim!`;
      }
      for (let o = 0; o < 4; o++) {
        if (!q.options[o] || !q.options[o].trim()) {
          return `#${i + 1}-savolning ${String.fromCharCode(65 + o)} varianti bo'sh bo'lishi mumkin emas!`;
        }
      }
      if (typeof q.correctAnswerIndex !== 'number' || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3) {
        return `#${i + 1}-savolning to'g'ri javobi (A, B, C yoki D) tanlanishi lozim!`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    try {
      setSaving(true);
      const payload = {
        title: title.trim(),
        order: Number(order),
        description: description.trim(),
        xpReward: Number(xpReward),
        xcoinReward: Number(xcoinReward),
        theoryContent,
        testQuestions,
        interactiveActivity,
      };

      let res;
      if (lessonId) {
        // Edit existing lesson
        res = await fetch(`/api/lessons/${lessonId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new lesson
        res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const json = await res.json();
        setErrorMessage(json.error || "Darsni saqlashda xatolik yuz berdi");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Server bilan aloqada xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const activeQuestion = testQuestions[editingQuestionIdx] || testQuestions[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-infast-500 text-white flex items-center justify-center font-black shadow-md shadow-infast-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {lessonId ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish"}
              </h3>
              <p className="text-xs text-slate-500">
                Nazariya, 9 savollik test va interaktiv mashg'ulot muharriri (Videolarsiz arxitektura)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-100 bg-white gap-2 overflow-x-auto shrink-0 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('basics')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'basics'
                ? 'bg-infast-50 text-infast-600 border border-infast-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Asosiy ma'lumotlar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('theory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'theory'
                ? 'bg-infast-50 text-infast-600 border border-infast-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>1. Nazariya (Notion)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'test'
                ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>2. Test (9 ta savol)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${testQuestions.length === 9 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {testQuestions.length}/9
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
              activeTab === 'activity'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>3. Interaktiv mashg'ulot</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-800 font-semibold animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal Body / Tab Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: BASICS */}
          {activeTab === 'basics' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block font-bold text-xs text-slate-700 mb-1">
                    Dars Nomi *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masalan: JavaScript o'zgaruvchilari (let va const)"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-infast-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-xs text-slate-700 mb-1">
                    Tartib Raqami *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-infast-400"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-xs text-slate-700 mb-1">
                  Qisqacha Tavsif (Ixtiyoriy)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Darsning qisqacha mazmuni va maqsadi..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-infast-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
                  <label className="block font-bold text-xs text-amber-900 mb-1">
                    XP Mukofoti (Tajriba bali)
                  </label>
                  <input
                    type="number"
                    value={xpReward}
                    onChange={(e) => setXpReward(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900"
                  />
                  <p className="text-[10px] text-amber-700 mt-1">Dars testidan muvaffaqiyatli o'tganda beriladi</p>
                </div>

                <div className="p-4 bg-orange-50/60 rounded-2xl border border-orange-200">
                  <label className="block font-bold text-xs text-orange-900 mb-1">
                    XCoin Mukofoti (Valyuta)
                  </label>
                  <input
                    type="number"
                    value={xcoinReward}
                    onChange={(e) => setXcoinReward(Number(e.target.value))}
                    className="w-full p-2.5 bg-white border border-orange-300 rounded-xl text-xs font-bold text-orange-900"
                  />
                  <p className="text-[10px] text-orange-700 mt-1">Darsni yakunlaganda hisobiga o'tkaziladi</p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                <span>Dars tuzilishini to'ldirish uchun keyingi tablarga o'ting:</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('theory')}
                  className="px-3.5 py-1.5 bg-infast-500 text-white rounded-xl font-bold hover:bg-infast-600 transition-colors"
                >
                  Nazariyaga o'tish &rarr;
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: THEORY (NOTION-STYLE) */}
          {activeTab === 'theory' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">1. Nazariy Material (Notion uslubida)</h4>
                  <p className="text-xs text-slate-500">
                    O'quvchi uchun tushuntirish, qoidalar va dasturlash kod namunalarini yozing.
                  </p>
                </div>
              </div>

              <NotionTheoryEditor
                value={theoryContent}
                onChange={setTheoryContent}
                placeholder={`# ${title || 'Dars Mavzusi'}\n\nUshbu darsda biz quyidagilarni o'rganamiz:\n- Mavzuning asosiy mohiyati\n- Amaliy foydalanish misollari\n\n\`\`\`javascript\n// Misol kod:\nconst greeting = "Assalomu alaykum!";\nconsole.log(greeting);\n\`\`\`\n\n> Muhim eslatma: O'zgaruvchilarni e'lon qilishda har doim 'const' dan boshlang.`}
              />
            </div>
          )}

          {/* TAB 3: TEST (3 ROUNDS X 3 QUESTIONS = 9 QUESTIONS) */}
          {activeTab === 'test' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                <div>
                  <h4 className="font-extrabold text-sm text-amber-950 flex items-center space-x-1.5">
                    <span>2. Test Savollari Muharriri (3 bosqich &times; 3 savol = 9 ta savol)</span>
                  </h4>
                  <p className="text-xs text-amber-800">
                    O'tish me'yori: kamida 8/9 ta to'g'ri javob. Har bir savolda aynan 4 ta variant va 1 ta to'g'ri javob bo'ladi.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={initializeSkeletonQuestions}
                    className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>9 ta savol skeletini yaratish</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Savol qo'shish</span>
                  </button>
                </div>
              </div>

              {/* 3 Rounds Visual Map */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[1, 2, 3].map((roundNum) => {
                  const roundQuestions = testQuestions.filter((q, idx) => (q.round || Math.floor(idx / 3) + 1) === roundNum);
                  return (
                    <div key={roundNum} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-800 flex items-center space-x-1.5">
                          <span className="w-5 h-5 rounded-lg bg-amber-500 text-white flex items-center justify-center text-[10px]">
                            {roundNum}
                          </span>
                          <span>{roundNum}-Bosqich (Round {roundNum})</span>
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {roundQuestions.length} ta savol
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        {testQuestions.map((q, idx) => {
                          const qRound = q.round || Math.floor(idx / 3) + 1;
                          if (qRound !== roundNum) return null;
                          const isSelected = editingQuestionIdx === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setEditingQuestionIdx(idx)}
                              className={`w-full p-2 rounded-xl text-left text-xs font-semibold transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-600 text-white shadow-sm'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span className="truncate pr-2">
                                #{idx + 1}. {q.question || 'Nomsiz savol'}
                              </span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 text-slate-600'}`}>
                                {String.fromCharCode(65 + (q.correctAnswerIndex || 0))}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Active Question Editor */}
              {activeQuestion && (
                <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-black rounded-lg text-xs">
                        #{editingQuestionIdx + 1}-Savol
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {activeQuestion.round || Math.floor(editingQuestionIdx / 3) + 1}-Bosqich
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <select
                        value={activeQuestion.round || 1}
                        onChange={(e) => handleUpdateQuestion(editingQuestionIdx, { round: Number(e.target.value) as 1 | 2 | 3 })}
                        className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700"
                      >
                        <option value={1}>1-Bosqich</option>
                        <option value={2}>2-Bosqich</option>
                        <option value={3}>3-Bosqich</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(editingQuestionIdx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Savolni o'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-700 mb-1">
                      Savol Matni *
                    </label>
                    <input
                      type="text"
                      required
                      value={activeQuestion.question}
                      onChange={(e) => handleUpdateQuestion(editingQuestionIdx, { question: e.target.value })}
                      placeholder="Savol matnini kiriting..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  {/* 4 Options with Radio for Correct Answer */}
                  <div>
                    <label className="block font-bold text-xs text-slate-700 mb-2">
                      Variantlar (Radiodan to'g'ri javobni tanlang):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[0, 1, 2, 3].map((optIdx) => {
                        const isCorrect = (activeQuestion.correctAnswerIndex ?? 0) === optIdx;
                        const letter = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl border flex items-center space-x-2.5 transition-all ${
                              isCorrect
                                ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct_${editingQuestionIdx}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateQuestion(editingQuestionIdx, { correctAnswerIndex: optIdx })}
                              className="w-4 h-4 text-emerald-600 cursor-pointer"
                            />
                            <span className={`font-black text-xs ${isCorrect ? 'text-emerald-700' : 'text-slate-500'}`}>
                              {letter}:
                            </span>
                            <input
                              type="text"
                              required
                              value={activeQuestion.options?.[optIdx] || ''}
                              onChange={(e) => handleOptionChange(editingQuestionIdx, optIdx, e.target.value)}
                              placeholder={`${letter} varianti matni...`}
                              className="flex-1 p-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-xs text-slate-700 mb-1">
                      Tushuntirish / Izoh (To'g'ri javob sababi)
                    </label>
                    <input
                      type="text"
                      value={activeQuestion.explanation || ''}
                      onChange={(e) => handleUpdateQuestion(editingQuestionIdx, { explanation: e.target.value })}
                      placeholder="O'quvchi xato qilganda yoki to'g'ri bajarganda ko'rsatiladigan tushuntirish..."
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: INTERACTIVE ACTIVITY */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <InteractiveActivityEditor
                activity={interactiveActivity}
                onChange={setInteractiveActivity}
              />
            </div>
          )}

          {/* Modal Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
            <span className="text-xs text-slate-500 font-semibold">
              Barcha o'zgarishlar MongoDB va LMS serverida to'liq saqlanadi.
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs shadow-md shadow-infast-500/20 transition-all flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saqlanmoqda...' : 'Darsni Saqlash'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
