'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Layers,
  FileText,
  Award,
  Coins,
  CheckCircle2,
  HelpCircle,
  Code,
} from 'lucide-react';

interface CourseCurriculumModalProps {
  course: any;
  onClose: () => void;
}

export default function CourseCurriculumModal({ course, onClose }: CourseCurriculumModalProps) {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Module creation/edit state
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: '' });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Lesson creation/edit state
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null); // moduleId
  const [lessonForm, setLessonForm] = useState<any>({
    title: '',
    order: '',
    description: '',
    theoryContent: '',
    xpReward: 50,
    xcoinReward: 10,
    practiceTask: {
      title: 'Amaliy mashg\'ulot',
      instructions: 'O\'rganilgan mavzu bo\'yicha amaliy vazifani bajaring.',
      starterCode: '',
      expectedOutput: '',
    },
    testQuestions: [
      // 9 default questions (3 rounds x 3 questions)
      { round: 1, question: '1-Bosqich: 1-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 1, question: '1-Bosqich: 2-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 1, question: '1-Bosqich: 3-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 2, question: '2-Bosqich: 1-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 2, question: '2-Bosqich: 2-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 2, question: '2-Bosqich: 3-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 3, question: '3-Bosqich: 1-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 3, question: '3-Bosqich: 2-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
      { round: 3, question: '3-Bosqich: 3-savol', options: ['A', 'B', 'C', 'D'], correctAnswerIndex: 0 },
    ],
  });

  // Module lessons cache
  const [moduleLessons, setModuleLessons] = useState<Record<string, any[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchModules();
  }, [course._id]);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/courses/${course._id}/modules`);
      if (res.ok) {
        const json = await res.json();
        setModules(json.modules || []);
        const exp: Record<string, boolean> = {};
        for (const m of json.modules || []) {
          exp[m._id] = true;
          fetchLessons(m._id);
        }
        setExpandedModules(exp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/courses/${course._id}/modules/${moduleId}/lessons`);
      if (res.ok) {
        const json = await res.json();
        setModuleLessons((prev) => ({ ...prev, [moduleId]: json.lessons || [] }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingModuleId) {
        await fetch(`/api/courses/${course._id}/modules/${editingModuleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleForm),
        });
      } else {
        await fetch(`/api/courses/${course._id}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleForm),
        });
      }
      setShowAddModule(false);
      setEditingModuleId(null);
      setModuleForm({ title: '', description: '', order: '' });
      fetchModules();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Modul va unga tegishli barcha darslarni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/courses/${course._id}/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchModules();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddLesson) return;
    try {
      setSubmitting(true);
      const res = await fetch(`/api/courses/${course._id}/modules/${showAddLesson}/lessons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lessonForm),
      });
      if (res.ok) {
        const targetModuleId = showAddLesson;
        setShowAddLesson(null);
        fetchLessons(targetModuleId);
        fetchModules();
      } else {
        const json = await res.json();
        alert(json.error || 'Dars yaratishda xatolik');
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Darsni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLessons(moduleId);
        fetchModules();
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-6 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-infast-50 text-infast-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {course.name} — O'quv Dasturi (LMS)
              </h2>
              <p className="text-xs text-slate-500">
                Modullar va Darslar boshqaruvi (Videodarslarsiz: Nazariya &rarr; 9 savolli Test &rarr; Amaliyot)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-slate-600">
            Mavjud modullar soni: <strong>{modules.length} ta</strong>
          </span>
          <button
            onClick={() => {
              setEditingModuleId(null);
              setModuleForm({ title: '', description: '', order: String(modules.length + 1) });
              setShowAddModule(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs shadow-md shadow-infast-500/20 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Modul Qo'shish</span>
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {loading ? (
            <div className="text-center py-12 text-xs text-slate-400">Modullar yuklanmoqda...</div>
          ) : modules.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <Layers className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Ushbu kursda hali hech qanday modul mavjud emas</p>
              <button
                onClick={() => {
                  setEditingModuleId(null);
                  setModuleForm({ title: '', description: '', order: '1' });
                  setShowAddModule(true);
                }}
                className="text-xs text-infast-600 font-bold hover:underline"
              >
                + Birinchi modulni yarating
              </button>
            </div>
          ) : (
            modules.map((m) => {
              const isExpanded = expandedModules[m._id] !== false;
              const lessons = moduleLessons[m._id] || [];

              return (
                <div key={m._id} className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden">
                  {/* Module Bar */}
                  <div className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
                    <div
                      onClick={() =>
                        setExpandedModules((prev) => ({ ...prev, [m._id]: !isExpanded }))
                      }
                      className="flex items-center space-x-3 cursor-pointer select-none"
                    >
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-extrabold text-xs flex items-center justify-center">
                        {m.order}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">{m.title}</h4>
                        {m.description && <p className="text-xs text-slate-400">{m.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                        {lessons.length} ta dars
                      </span>
                      <button
                        onClick={() => {
                          setShowAddLesson(m._id);
                          setLessonForm({
                            title: '',
                            order: String(lessons.length + 1),
                            description: '',
                            theoryContent: `# ${m.title} - Dars\n\nNazariy qism matni va ko'rsatmalar.`,
                            xpReward: 50,
                            xcoinReward: 10,
                            practiceTask: {
                              title: 'Amaliy mashg\'ulot',
                              instructions: 'Vazifani bajaring.',
                              starterCode: '',
                              expectedOutput: '',
                            },
                            testQuestions: [
                              { round: 1, question: '1-Bosqich 1-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 1, question: '1-Bosqich 2-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 1, question: '1-Bosqich 3-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 2, question: '2-Bosqich 1-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 2, question: '2-Bosqich 2-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 2, question: '2-Bosqich 3-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 3, question: '3-Bosqich 1-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 3, question: '3-Bosqich 2-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                              { round: 3, question: '3-Bosqich 3-savol', options: ['A variant', 'B variant', 'C variant', 'D variant'], correctAnswerIndex: 0 },
                            ],
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Dars qo'shish</span>
                      </button>
                      <button
                        onClick={() => handleDeleteModule(m._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons list */}
                  {isExpanded && (
                    <div className="p-3 space-y-2">
                      {lessons.length === 0 ? (
                        <div className="text-center py-4 text-xs text-slate-400 italic">
                          Darslar mavjud emas. Yuqoridagi "+ Dars qo'shish" tugmasini bosing.
                        </div>
                      ) : (
                        lessons.map((les: any) => (
                          <div
                            key={les._id}
                            className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-[10px]">
                                {les.order}
                              </span>
                              <div>
                                <span className="font-extrabold text-slate-900">{les.title}</span>
                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>Nazariya: {les.theoryContent ? 'Bor' : "Yo'q"}</span>
                                  <span>• Test: {les.testQuestions?.length || 9} ta</span>
                                  <span>• +{les.xpReward} XP / +{les.xcoinReward} XCoin</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteLesson(m._id, les._id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Add Module Modal */}
        {showAddModule && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">Yangi Modul Qo'shish</h3>
                <button onClick={() => setShowAddModule(false)} className="p-1.5 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Modul Nomi *</label>
                  <input
                    type="text"
                    required
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    placeholder="Masalan: HTML & CSS Asoslari"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tartib Raqami</label>
                  <input
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tavsif</label>
                  <textarea
                    rows={2}
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModule(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-infast-500 hover:bg-infast-600 text-white font-bold"
                  >
                    Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Lesson Modal */}
        {showAddLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 my-8 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
                <h3 className="font-extrabold text-base text-slate-900">
                  Yangi Dars Qo'shish (Videodarslarsiz arxitektura)
                </h3>
                <button onClick={() => setShowAddLesson(null)} className="p-1.5 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">Dars Nomi *</label>
                    <input
                      type="text"
                      required
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                      placeholder="Semantik teglari va formalar"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tartib *</label>
                    <input
                      type="number"
                      required
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">XP Mukofoti</label>
                    <input
                      type="number"
                      value={lessonForm.xpReward}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, xpReward: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">XCoin Mukofoti</label>
                    <input
                      type="number"
                      value={lessonForm.xcoinReward}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, xcoinReward: Number(e.target.value) })
                      }
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    1. Nazariy Material (Markdown / Matn) * (Videodars kiritilmaydi)
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={lessonForm.theoryContent}
                    onChange={(e) => setLessonForm({ ...lessonForm, theoryContent: e.target.value })}
                    placeholder="Darsning batafsil tushuntirishi, nazariy qoidalar va kod namunalari..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    2. Test Savollari (3 bosqich &times; 3 savol = 9 ta savol, &ge; 8/9 o'tish bali)
                  </label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Standart 9 ta savol avtomatik tuziladi. Har bir savol 4 ta variantdan iborat bo'ladi.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">3. Amaliy Topshiriq</label>
                  <input
                    type="text"
                    value={lessonForm.practiceTask?.title || ''}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        practiceTask: { ...lessonForm.practiceTask, title: e.target.value },
                      })
                    }
                    placeholder="Amaliy topshiriq sarlavhasi"
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold mb-2"
                  />
                  <textarea
                    rows={2}
                    value={lessonForm.practiceTask?.instructions || ''}
                    onChange={(e) =>
                      setLessonForm({
                        ...lessonForm,
                        practiceTask: { ...lessonForm.practiceTask, instructions: e.target.value },
                      })
                    }
                    placeholder="Topshiriq yo'riqnomasi..."
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  />
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddLesson(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-infast-500 hover:bg-infast-600 text-white font-bold"
                  >
                    Darsni Saqlash
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
