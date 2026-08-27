'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { formatDateUz } from '@/lib/utils';
import {
  GraduationCap,
  Plus,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  X,
  Copy,
  BarChart,
} from 'lucide-react';

export default function ExamsPage() {
  const [exams, setExams] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);


  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditExamModal, setShowEditExamModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [scoreList, setScoreList] = useState<any[]>([]);
  const [savingScores, setSavingScores] = useState(false);

  const SAMPLE_QUESTIONS_JSON = JSON.stringify(
    [
      {
        id: "q1",
        questionText: "React-da holatni boshqarish uchun qaysi hook ishlatiladi?",
        options: ["useEffect", "useState", "useRef", "useMemo"],
        correctAnswerIndex: 1,
        points: 10
      },
      {
        id: "q2",
        questionText: "HTML-da eng katta sarlavha tegi qaysi?",
        options: ["<h6>", "<head>", "<h1>", "<header>"],
        correctAnswerIndex: 2,
        points: 10
      }
    ],
    null,
    2
  );

  const [editFormData, setEditFormData] = useState({
    name: '',
    courseId: '',
    groupId: '',
    examDate: '',
    startTime: '',
    endTime: '',
    room: '',
    maxScore: '100',
    passingScore: '60',
    durationMinutes: '30',
    description: '',
    questionsJson: '',
  });

  const handleOpenEditExamModal = (exam: any) => {
    setEditingExam(exam);
    setEditFormData({
      name: exam.name || '',
      courseId: exam.courseId?._id || exam.courseId || '',
      groupId: exam.groupId?._id || exam.groupId || '',
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
      startTime: exam.startTime || '14:00',
      endTime: exam.endTime || '16:00',
      room: exam.room || 'Xona 101',
      maxScore: String(exam.maxScore || 100),
      passingScore: String(exam.passingScore || 60),
      durationMinutes: String(exam.durationMinutes || 30),
      description: exam.description || '',
      questionsJson: exam.questions && exam.questions.length > 0 ? JSON.stringify(exam.questions, null, 2) : '',
    });
    setShowEditExamModal(true);
  };

  const handleEditExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    let questions: any[] = [];
    if (editFormData.questionsJson.trim()) {
      try {
        const parsed = JSON.parse(editFormData.questionsJson);
        questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      } catch (err) {
        alert("JSON formati noto'g'ri! Sintaksisni tekshiring.");
        return;
      }
    }

    try {
      const res = await fetch(`/api/exams/${editingExam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          durationMinutes: Number(editFormData.durationMinutes || 30),
          questions,
        }),
      });

      if (res.ok) {
        setShowEditExamModal(false);
        fetchExams();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  // Add exam form
  const [formData, setFormData] = useState({
    name: '',
    courseId: '',
    groupId: '',
    examDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '16:00',
    room: 'Xona 101',
    maxScore: '100',
    passingScore: '60',
    durationMinutes: '30',
    description: '',
    questionsJson: '',
  });

  useEffect(() => {
    fetchExams();
    fetchCoursesAndGroups();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await fetch('/api/exams');
      if (res.ok) {
        const data = await res.json();
        setExams(data.exams || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoursesAndGroups = async () => {
    try {
      const [cRes, gRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/groups'),
      ]);
      if (cRes.ok) setCourses((await cRes.json()).courses || []);
      if (gRes.ok) setGroups((await gRes.json()).groups || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let questions: any[] = [];
    if (formData.questionsJson.trim()) {
      try {
        const parsed = JSON.parse(formData.questionsJson);
        questions = Array.isArray(parsed) ? parsed : (parsed.questions || []);
      } catch (err) {
        alert("JSON formati noto'g'ri! Sintaksisni tekshiring.");
        return;
      }
    }

    try {
      const res = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          durationMinutes: Number(formData.durationMinutes || 30),
          questions,
        }),
      });

      if (res.ok) {
        setShowAddModal(false);
        fetchExams();
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };


  const openScoresModal = async (exam: any) => {
    setSelectedExam(exam);
    setShowScoresModal(true);
    try {
      const res = await fetch(`/api/exams/${exam._id}`);
      if (res.ok) {
        const data = await res.json();
        setScoreList(data.results || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleScoreChange = (studentId: string, value: string) => {
    setScoreList((prev) =>
      prev.map((item) => (item.studentId === studentId ? { ...item, score: value } : item))
    );
  };

  const handleSaveScores = async () => {
    if (!selectedExam) return;
    setSavingScores(true);
    try {
      const res = await fetch(`/api/exams/${selectedExam._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_scores',
          scores: scoreList.map((s) => ({ studentId: s.studentId, score: s.score })),
        }),
      });

      if (res.ok) {
        alert("Barcha baholar muvaffaqiyatli saqlandi!");
        fetchExams();
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSavingScores(false);
    }
  };

  const handlePublish = async (examId: string) => {
    if (!confirm("Imtihon natijalarini e'lon qilmoqchimisiz? Natijalar ochiq havola orqali taqdim etiladi.")) return;
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        fetchExams();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm("Rostdan ham ushbu imtihonni va uning barcha natijalarini o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/exams/${examId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchExams();
      } else {
        const err = await res.json();
        alert(err.error || "O'chirishda xatolik yuz berdi");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="flex-1 pb-12">
      <Header title="Imtihonlar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <h2 className="font-bold text-base text-slate-900">Imtihonlar va Natijalar Boshqaruvi</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Imtihon Yaratish</span>
          </button>
        </div>

        {/* Exams List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Yuklanmoqda...</div>
          ) : exams.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">Hali imtihonlar mavjud emas</div>
          ) : (
            exams.map((exam) => (
              <div key={exam._id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-infast-600 bg-infast-50 px-3 py-1 rounded-xl">
                      {exam.courseId?.name} • {exam.groupId?.name}
                    </span>
                    {exam.isPublished ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> E'lon qilingan
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                        Loyiha (Qoralama)
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-extrabold text-slate-900">{exam.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Sana: {formatDateUz(exam.examDate)} | Vaqt: {exam.startTime} - {exam.endTime} | Davomiyligi: {exam.durationMinutes || 30} m. | Savollar: {exam.questions?.length || 0} ta
                  </p>

                  {/* Exam Statistics (BUSINESS RULE 27) */}
                  <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-center text-xs">
                    <div className="p-2 bg-slate-50 rounded-xl">
                      <p className="text-[10px] text-slate-400 font-bold">Jami</p>
                      <p className="font-extrabold text-slate-900">{exam.stats?.totalStudents || 0}</p>
                    </div>
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <p className="text-[10px] text-emerald-600 font-bold">O'tdi</p>
                      <p className="font-extrabold text-emerald-700">{exam.stats?.passedCount || 0}</p>
                    </div>
                    <div className="p-2 bg-rose-50 rounded-xl">
                      <p className="text-[10px] text-rose-600 font-bold">O'tmadi</p>
                      <p className="font-extrabold text-rose-700">{exam.stats?.failedCount || 0}</p>
                    </div>
                    <div className="p-2 bg-sky-50 rounded-xl">
                      <p className="text-[10px] text-sky-600 font-bold">O'rtacha</p>
                      <p className="font-extrabold text-sky-700">{exam.stats?.avgScore || 0}</p>
                    </div>
                  </div>

                  {/* Public Links Section */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                    {/* Link 1: Take Test Link */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5 overflow-hidden">
                        <span className="font-bold text-slate-700 shrink-0">📝 Test topshirish:</span>
                        <span className="truncate font-mono text-[10px] text-slate-500">{`${appUrl}/take-exam/${exam.publicExamId}`}</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${appUrl}/take-exam/${exam.publicExamId}`);
                            alert("Test Topshirish Havolasi nusxalandi!");
                          }}
                          className="p-1.5 text-slate-500 hover:text-infast-600 hover:bg-white rounded-lg transition-colors"
                          title="Nusxalash"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/take-exam/${exam.publicExamId}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-infast-600 hover:bg-white rounded-lg transition-colors"
                          title="Ochish"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* Link 2: Result Link */}
                    <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 pt-1.5">
                      <div className="flex items-center space-x-1.5 overflow-hidden">
                        <span className="font-bold text-slate-700 shrink-0">📊 Natijalar:</span>
                        <span className="truncate font-mono text-[10px] text-slate-500">{`${appUrl}/result/${exam.publicExamId}`}</span>
                      </div>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${appUrl}/result/${exam.publicExamId}`);
                            alert("Natijalar Havolasi nusxalandi!");
                          }}
                          className="p-1.5 text-slate-500 hover:text-infast-600 hover:bg-white rounded-lg transition-colors"
                          title="Nusxalash"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href={`/result/${exam.publicExamId}`}
                          target="_blank"
                          className="p-1.5 text-slate-500 hover:text-infast-600 hover:bg-white rounded-lg transition-colors"
                          title="Ochish"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>


                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => openScoresModal(exam)}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center space-x-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Baholarni Kiritish</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditExamModal(exam)}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl transition-colors"
                      title="Imtihonni tahrirlash"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExam(exam._id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-colors"
                      title="Imtihonni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>


                  {/* Publish Button (BUSINESS RULE 28) */}
                  {!exam.isPublished ? (
                    <button
                      onClick={() => handlePublish(exam._id)}
                      className="px-4 py-2 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
                    >
                      <Rocket className="w-4 h-4" />
                      <span>🚀 Natijalarni E'lon Qilish</span>
                    </button>
                  ) : (
                    <Link
                      href={`/result/${exam.publicExamId}`}
                      target="_blank"
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl flex items-center space-x-1"
                    >
                      <span>Ochiq Havolani Ochish</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal: Add Exam */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Yangi Imtihon Yaratish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Imtihon Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Frontend React Oraliq Imtihoni"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kurs *</label>
                  <select
                    required
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guruh *</label>
                  <select
                    required
                    value={formData.groupId}
                    onChange={(e) => setFormData({ ...formData, groupId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Guruhni tanlang</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Imtihon Sanasi *</label>
                  <input
                    type="date"
                    required
                    value={formData.examDate}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlanishi *</label>
                  <input
                    type="text"
                    required
                    placeholder="14:00"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tugashi *</label>
                  <input
                    type="text"
                    required
                    placeholder="16:00"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xona *</label>
                  <input
                    type="text"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maksimal Ball</label>
                  <input
                    type="number"
                    value={formData.maxScore}
                    onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">O'tish Balli</label>
                  <input
                    type="number"
                    value={formData.passingScore}
                    onChange={(e) => setFormData({ ...formData, passingScore: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Imtihon Davomiyligi (daqiqalarda) *</label>
                <input
                  type="number"
                  required
                  placeholder="30"
                  value={formData.durationMinutes}
                  onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Online Test Savollari (JSON formatida)</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, questionsJson: SAMPLE_QUESTIONS_JSON })}
                    className="text-[11px] font-bold text-infast-600 hover:underline"
                  >
                    📋 Shablon JSON'dan Nusxa Olish
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder={`[\n  {\n    "id": "q1",\n    "questionText": "Savol matni",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswerIndex": 1,\n    "points": 10\n  }\n]`}
                  value={formData.questionsJson}
                  onChange={(e) => setFormData({ ...formData, questionsJson: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-infast-500"
                />
                <p className="text-[10px] text-slate-400">
                  `correctAnswerIndex`: 0=A, 1=B, 2=C, 3=D variantni bildiradi.
                </p>
              </div>


              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-infast-500 hover:bg-infast-600 text-white font-semibold rounded-xl shadow-md"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Scores Entry Grid (BUSINESS RULES 26 & 22: Auto status calculation, NO RANKING) */}
      {showScoresModal && selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">{selectedExam.name} - Baholar Matrixi</h3>
                <p className="text-xs text-slate-500">Maksimal: {selectedExam.maxScore} | O'tish balli: {selectedExam.passingScore}</p>
              </div>
              <button onClick={() => setShowScoresModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {scoreList.map((st) => {
                const numericVal = st.score !== null && st.score !== undefined && st.score !== '' ? Number(st.score) : null;
                const isPassed = numericVal !== null && numericVal >= selectedExam.passingScore;
                const isFailed = numericVal !== null && numericVal < selectedExam.passingScore;
                const isAbsent = numericVal === null;

                return (
                  <div key={st.studentId} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{st.firstName} {st.lastName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{st.phone}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        placeholder="Bo'sh (Qatnashmadi)"
                        value={st.score ?? ''}
                        onChange={(e) => handleScoreChange(st.studentId, e.target.value)}
                        className="w-28 p-2 text-center bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-infast-500"
                      />

                      {/* Auto Status Indicator Badge (NO RANKING) */}
                      <span className={`w-28 text-center px-2 py-1.5 rounded-xl font-bold text-xs ${
                        isPassed ? 'bg-emerald-100 text-emerald-800' :
                        isFailed ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isPassed ? '🟢 O\'TDI' : isFailed ? '🔴 O\'TMADI' : '⚪ QATNASHMADI'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end space-x-2">
              <button
                onClick={() => setShowScoresModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
              >
                Yopish
              </button>
              <button
                onClick={handleSaveScores}
                disabled={savingScores}
                className="px-5 py-2 bg-infast-500 hover:bg-infast-600 text-white font-semibold rounded-xl text-xs shadow-md"
              >
                {savingScores ? "Saqlanmoqda..." : "Baholarni Saqlash"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Exam */}
      {showEditExamModal && editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Imtihon Ma'lumotlarini Tahrirlash</h3>
              <button onClick={() => setShowEditExamModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditExamSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Imtihon Nomi *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kurs *</label>
                  <select
                    required
                    value={editFormData.courseId}
                    onChange={(e) => setEditFormData({ ...editFormData, courseId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guruh *</label>
                  <select
                    required
                    value={editFormData.groupId}
                    onChange={(e) => setEditFormData({ ...editFormData, groupId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="">Guruhni tanlang</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Imtihon Sanasi *</label>
                  <input
                    type="date"
                    required
                    value={editFormData.examDate}
                    onChange={(e) => setEditFormData({ ...editFormData, examDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Boshlanishi *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.startTime}
                    onChange={(e) => setEditFormData({ ...editFormData, startTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tugashi *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.endTime}
                    onChange={(e) => setEditFormData({ ...editFormData, endTime: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Xona *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.room}
                    onChange={(e) => setEditFormData({ ...editFormData, room: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maksimal Ball</label>
                  <input
                    type="number"
                    value={editFormData.maxScore}
                    onChange={(e) => setEditFormData({ ...editFormData, maxScore: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">O'tish Balli</label>
                  <input
                    type="number"
                    value={editFormData.passingScore}
                    onChange={(e) => setEditFormData({ ...editFormData, passingScore: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Imtihon Davomiyligi (daqiqalarda) *</label>
                <input
                  type="number"
                  required
                  placeholder="30"
                  value={editFormData.durationMinutes}
                  onChange={(e) => setEditFormData({ ...editFormData, durationMinutes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-700">Online Test Savollari (JSON formatida)</label>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, questionsJson: SAMPLE_QUESTIONS_JSON })}
                    className="text-[11px] font-bold text-infast-600 hover:underline"
                  >
                    📋 Shablon JSON'dan Nusxa Olish
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder={`[\n  {\n    "id": "q1",\n    "questionText": "Savol matni",\n    "options": ["A", "B", "C", "D"],\n    "correctAnswerIndex": 1,\n    "points": 10\n  }\n]`}
                  value={editFormData.questionsJson}
                  onChange={(e) => setEditFormData({ ...editFormData, questionsJson: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:ring-1 focus:ring-infast-500"
                />
              </div>


              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditExamModal(false);
                    handleDeleteExam(editingExam._id);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-xl flex items-center space-x-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>O'chirish</span>
                </button>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowEditExamModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-md"
                  >
                    O'zgarishlarni Saqlash
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
