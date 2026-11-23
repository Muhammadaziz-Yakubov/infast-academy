'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/Header';
import {
  BookOpen,
  Layers,
  Users,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Unlock,
  CheckCircle2,
  Award,
  Coins,
  Sparkles,
  Search,
  Filter,
  Flag,
  HelpCircle,
  Folder,
  Building2,
  X,
  FileText,
  ClipboardCheck,
  Code,
  ArrowRight,
  RotateCcw,
  Edit3,
  Upload,
  Check,
  ExternalLink,
} from 'lucide-react';
import LessonMapTab from '@/components/students/LessonMapTab';
import LessonEditorModal from '@/components/lms/LessonEditorModal';
import JsonImportModal from '@/components/lms/JsonImportModal';

export default function LmsDashboardPage() {
  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'guide'>('curriculum');
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [showJsonImportModal, setShowJsonImportModal] = useState(false);
  const [modules, setModules] = useState<any[]>([]);
  const [moduleLessons, setModuleLessons] = useState<Record<string, any[]>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [loadingModules, setLoadingModules] = useState(false);

  // Student progress state
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('ALL');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('ALL');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Modals state
  const [selectedStudentForMap, setSelectedStudentForMap] = useState<any | null>(null);
  const [groupUnlockModal, setGroupUnlockModal] = useState(false);
  const [groupUnlockForm, setGroupUnlockForm] = useState({ groupId: '', lessonId: '' });
  const [groupUnlockSubmitting, setGroupUnlockSubmitting] = useState(false);

  // Reset modal state
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetScope, setResetScope] = useState<'group' | 'all'>('group');
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Module creation modal
  const [showAddModule, setShowAddModule] = useState(false);
  const [moduleForm, setModuleForm] = useState({ title: '', description: '', order: '' });
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // Lesson creation & edit modal
  const [showAddLesson, setShowAddLesson] = useState<string | null>(null); // moduleId
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lessonId: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchModules(selectedCourseId);
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchStudentsList();
    }
  }, [activeTab, selectedBranchId, selectedGroupId, selectedCourseId]);

  const fetchInitialData = async () => {
    try {
      const [coursesRes, groupsRes, branchesRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/groups'),
        fetch('/api/branches'),
      ]);

      if (coursesRes.ok) {
        const cJson = await coursesRes.json();
        const cList = cJson.courses || [];
        setCourses(cList);
        if (cList.length > 0) {
          setSelectedCourseId(cList[0]._id);
        }
      }

      if (groupsRes.ok) {
        const gJson = await groupsRes.json();
        setGroups(gJson.groups || []);
      }

      if (branchesRes.ok) {
        const bJson = await branchesRes.json();
        setBranches(bJson.branches || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchModules = async (courseId: string) => {
    try {
      setLoadingModules(true);
      const res = await fetch(`/api/courses/${courseId}/modules`);
      if (res.ok) {
        const json = await res.json();
        const mList = json.modules || [];
        setModules(mList);
        const exp: Record<string, boolean> = {};
        for (const m of mList) {
          exp[m._id] = true;
          fetchLessons(courseId, m._id);
        }
        setExpandedModules(exp);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchLessons = async (courseId: string, moduleId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/lessons`);
      if (res.ok) {
        const json = await res.json();
        setModuleLessons((prev) => ({ ...prev, [moduleId]: json.lessons || [] }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudentsList = async () => {
    try {
      setLoadingStudents(true);
      const params = new URLSearchParams();
      if (selectedBranchId !== 'ALL') params.set('branchId', selectedBranchId);
      if (selectedGroupId !== 'ALL') params.set('groupId', selectedGroupId);
      if (selectedCourseId) params.set('courseId', selectedCourseId);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setStudents(json.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !moduleForm.title.trim()) return;

    try {
      setSubmitting(true);
      const url = editingModuleId
        ? `/api/courses/${selectedCourseId}/modules/${editingModuleId}`
        : `/api/courses/${selectedCourseId}/modules`;
      const method = editingModuleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: moduleForm.title.trim(),
          description: moduleForm.description.trim(),
          order: Number(moduleForm.order) || 1,
        }),
      });

      if (res.ok) {
        setShowAddModule(false);
        setEditingModuleId(null);
        setModuleForm({ title: '', description: '', order: '' });
        fetchModules(selectedCourseId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Ushbu modul va undagi barcha darslarni o'chirishni xohlaysizmi?")) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchModules(selectedCourseId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Ushbu darsni o'chirishni xohlaysizmi?")) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchLessons(selectedCourseId, moduleId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleGroupUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupUnlockForm.groupId || !groupUnlockForm.lessonId) return;

    try {
      setGroupUnlockSubmitting(true);
      const res = await fetch(`/api/groups/${groupUnlockForm.groupId}/unlock-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: groupUnlockForm.lessonId }),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Guruh talabalariga dars muvaffaqiyatli ochildi!");
        setGroupUnlockModal(false);
        setGroupUnlockForm({ groupId: '', lessonId: '' });
        fetchStudentsList();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
      alert("Server bilan aloqada xatolik");
    } finally {
      setGroupUnlockSubmitting(false);
    }
  };

  const handleResetProgress = async () => {
    try {
      setResetSubmitting(true);
      const body: any = { scope: resetScope };
      if (resetScope === 'group') {
        if (!selectedGroupId || selectedGroupId === 'ALL') {
          alert("Iltimos, avval bitta guruhni tanlang!");
          setResetSubmitting(false);
          return;
        }
        body.groupId = selectedGroupId;
      } else {
        if (selectedBranchId !== 'ALL') {
          body.branchId = selectedBranchId;
        }
      }

      const res = await fetch('/api/lms/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        alert(data.message || "Talabalar progressi muvaffaqiyatli 0 ga qaytarildi!");
        setResetModalOpen(false);
        fetchStudentsList();
      } else {
        alert(data.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
      alert("Server bilan aloqada xatolik");
    } finally {
      setResetSubmitting(false);
    }
  };

  // Collect all lessons across current modules for dropdown and stats
  const allCurrentLessons = useMemo(() => {
    return modules.flatMap((m) =>
      (moduleLessons[m._id] || []).map((les) => ({
        ...les,
        moduleTitle: m.title,
      }))
    );
  }, [modules, moduleLessons]);

  const totalCourseLessons = allCurrentLessons.length;
  const totalXp = allCurrentLessons.reduce((acc, l) => acc + (Number(l.xpReward) || 0), 0);
  const totalXCoin = allCurrentLessons.reduce((acc, l) => acc + (Number(l.xcoinReward) || 0), 0);

  const selectedCourse = courses.find((c) => c._id === selectedCourseId);

  const toggleAllModules = (expand: boolean) => {
    const next: Record<string, boolean> = {};
    modules.forEach((m) => {
      next[m._id] = expand;
    });
    setExpandedModules(next);
  };

  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const q = searchStudent.toLowerCase();
    return students.filter(
      (s) =>
        (s.firstName || '').toLowerCase().includes(q) ||
        (s.lastName || '').toLowerCase().includes(q) ||
        (s.studentCode || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q)
    );
  }, [students, searchStudent]);

  return (
    <div className="flex-1 pb-16">
      <Header title="LMS — O'quv Dasturi va Boshqaruv" />

      <main className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner with Tabs */}
        <div className="apple-card p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-infast-600 via-infast-500 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-infast-500/25 shrink-0">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  LMS O'quv Platformasi
                </h1>
                <span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-800">
                  Faol
                </span>
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Kurs &rarr; Modul &rarr; Dars (Nazariya, 9-talik test, amaliyot) va Talabalarning darslarini ochish tizimi
              </p>
            </div>
          </div>

          {/* Segmented Pill Navigation */}
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-1.5 rounded-2xl space-x-1 text-xs font-bold w-full md:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'curriculum'
                  ? 'bg-white dark:bg-[#181820] text-infast-600 dark:text-infast-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>O'quv Dasturlari</span>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-[#181820] text-infast-600 dark:text-infast-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Talabalar & Dars Ochish</span>
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'guide'
                  ? 'bg-white dark:bg-[#181820] text-infast-600 dark:text-infast-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Qo'llanma</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Curriculum Management */}
        {activeTab === 'curriculum' && (
          <div className="space-y-6">
            {/* Course Selector Horizontal Cards */}
            <div className="apple-card p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Kursni tanlang
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {courses.length} ta mavjud kurs
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {courses.map((c) => {
                  const isSelected = c._id === selectedCourseId;
                  return (
                    <button
                      key={c._id}
                      onClick={() => setSelectedCourseId(c._id)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all text-left flex items-center space-x-2.5 ${
                        isSelected
                          ? 'bg-infast-600 text-white shadow-md shadow-infast-500/25 ring-2 ring-infast-500/30'
                          : 'bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] text-slate-700 dark:text-slate-300 hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <BookOpen className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <span>{c.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-black/[0.04] dark:bg-white/[0.06] text-slate-500'
                        }`}
                      >
                        {c.durationMonths} oy
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Course Summary Metrics (4 Apple KPI Cards) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="apple-card p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jami Modullar</span>
                <div className="text-xl font-black text-slate-900 dark:text-white">{modules.length} ta</div>
                <p className="text-[10px] text-slate-500">{selectedCourse?.name || 'Kurs'}</p>
              </div>

              <div className="apple-card p-4 space-y-1">
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Jami Darslar</span>
                <div className="text-xl font-black text-blue-600 dark:text-blue-400">{totalCourseLessons} ta</div>
                <p className="text-[10px] text-slate-500">Nazariya, test va amaliyot</p>
              </div>

              <div className="apple-card p-4 space-y-1">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Maksimal XP</span>
                <div className="text-xl font-black text-amber-600 dark:text-amber-400">+{totalXp.toLocaleString()} XP</div>
                <p className="text-[10px] text-slate-500">Barcha darslar yakuni uchun</p>
              </div>

              <div className="apple-card p-4 space-y-1">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">XCoin Jamg'armasi</span>
                <div className="text-xl font-black text-orange-600 dark:text-orange-400">+{totalXCoin.toLocaleString()}</div>
                <p className="text-[10px] text-slate-500">Do'kon uchun tangalar</p>
              </div>
            </div>

            {/* Action Bar: Add Module, Import JSON, Expand/Collapse */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => toggleAllModules(true)}
                  className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Barchasini ochish
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllModules(false)}
                  className="px-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-black/[0.06] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 font-bold text-xs transition-all"
                >
                  Barchasini yopish
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJsonImportModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <Upload className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>JSON Yuklash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingModuleId(null);
                    setModuleForm({ title: '', description: '', order: String(modules.length + 1) });
                    setShowAddModule(true);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-infast-600 hover:bg-infast-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-infast-500/25 flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Modul Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Modules and Lessons List */}
            <div className="space-y-4">
              {loadingModules ? (
                <div className="apple-card p-12 text-center text-xs text-slate-400">
                  Modullar va darslar yuklanmoqda...
                </div>
              ) : modules.length === 0 ? (
                <div className="apple-card p-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-infast-50 dark:bg-infast-950/40 text-infast-600 dark:text-infast-400 mx-auto flex items-center justify-center">
                    <BookOpen className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Ushbu kursda hali modullar yo'q</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                      O'quv rejasini shakllantirish uchun "+ Yangi Modul Qo'shish" yoki "JSON orqali yuklash" tugmasini bosing.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowJsonImportModal(true)}
                      className="px-4 py-2 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>JSON orqali yuklash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModuleId(null);
                        setModuleForm({ title: '', description: '', order: '1' });
                        setShowAddModule(true);
                      }}
                      className="px-4 py-2 rounded-2xl bg-infast-600 text-white text-xs font-bold shadow-md"
                    >
                      Modul qo'shish
                    </button>
                  </div>
                </div>
              ) : (
                modules.map((mod) => {
                  const isExpanded = expandedModules[mod._id] !== false;
                  const lessons = moduleLessons[mod._id] || [];

                  return (
                    <div
                      key={mod._id}
                      className="apple-card overflow-hidden transition-all duration-200"
                    >
                      {/* Module Header Bar */}
                      <div className="p-4 sm:p-5 flex items-center justify-between bg-black/[0.015] dark:bg-white/[0.02] border-b border-black/[0.06] dark:border-white/[0.08]">
                        <div
                          onClick={() =>
                            setExpandedModules((prev) => ({ ...prev, [mod._id]: !isExpanded }))
                          }
                          className="flex items-center space-x-3 cursor-pointer select-none flex-1 min-w-0 pr-3"
                        >
                          <div className="w-8 h-8 rounded-xl bg-infast-50 dark:bg-infast-950/40 text-infast-600 dark:text-infast-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-infast-200 dark:border-infast-800">
                            #{mod.order}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                              {mod.title}
                            </h3>
                            {mod.description && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {mod.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.08] px-2.5 py-1 rounded-xl">
                            {lessons.length} ta dars
                          </span>

                          <button
                            onClick={() => setShowAddLesson(mod._id)}
                            className="px-3 py-1.5 rounded-xl bg-infast-50 hover:bg-infast-100 dark:bg-infast-950/40 dark:hover:bg-infast-900/50 text-infast-700 dark:text-infast-300 text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Dars qo'shish</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingModuleId(mod._id);
                              setModuleForm({
                                title: mod.title,
                                description: mod.description || '',
                                order: String(mod.order),
                              });
                              setShowAddModule(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
                            title="Modulni tahrirlash"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteModule(mod._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                            title="Modulni o'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() =>
                              setExpandedModules((prev) => ({ ...prev, [mod._id]: !isExpanded }))
                            }
                            className="p-1 text-slate-400"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${
                                isExpanded ? 'transform rotate-180' : ''
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Lessons list */}
                      {isExpanded && (
                        <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06] p-2 sm:p-3">
                          {lessons.length === 0 ? (
                            <div className="p-6 text-center text-xs text-slate-400 italic">
                              Ushbu modulda hozircha darslar mavjud emas. Yuqoridagi "+ Dars qo'shish" tugmasini bosing.
                            </div>
                          ) : (
                            lessons.map((les) => (
                              <div
                                key={les._id}
                                className="p-3 sm:p-3.5 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] rounded-2xl transition-colors gap-3"
                              >
                                <div className="flex items-center space-x-3 min-w-0">
                                  <div className="w-7 h-7 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center shrink-0">
                                    {les.order}
                                  </div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                      {les.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 mt-1">
                                      <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium">
                                        <FileText className="w-3 h-3" /> Nazariya
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                                        <ClipboardCheck className="w-3 h-3" /> 9 savolli test (&ge;8/9)
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                                        <Code className="w-3 h-3" /> Amaliyot
                                      </span>
                                      <span>•</span>
                                      <span className="text-amber-500 font-bold">
                                        +{les.xpReward} XP / +{les.xcoinReward} XCoin
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1 shrink-0">
                                  <button
                                    onClick={() => setEditingLesson({ moduleId: mod._id, lessonId: les._id })}
                                    className="p-1.5 text-slate-400 hover:text-infast-600 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                                    title="Darsni tahrirlash"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(mod._id, les._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
                                    title="Darsni o'chirish"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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
          </div>
        )}

        {/* Tab 2: Students & Lesson Management */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Filter and Action Bar */}
            <div className="apple-card p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Talabani qidirish (ism, kod)..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-infast-500"
                  />
                </div>

                {/* Branch filter */}
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="px-3.5 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Barcha Filiallar</option>
                  {branches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>

                {/* Group filter */}
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="px-3.5 py-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Barcha Guruhlar</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Reset Progress Button */}
                <button
                  onClick={() => setResetModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                  title="O'quvchilar progressini, darajasini va darslarini to'liq nollashtirish (Reset)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Reset (0 qilish)</span>
                </button>

                {/* Group Batch Unlock Button */}
                <button
                  onClick={() => setGroupUnlockModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-infast-600 hover:bg-infast-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-infast-500/25 flex items-center space-x-1.5 transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Guruhga Darsni Ochish</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="apple-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/[0.02] dark:bg-white/[0.03] text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-black/[0.06] dark:border-white/[0.08]">
                      <th className="p-4">Talaba</th>
                      <th className="p-4">Filial & Guruh</th>
                      <th className="p-4">Kurs</th>
                      <th className="p-4">XP & Tangalar</th>
                      <th className="p-4 text-center">Boshqaruv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs font-medium">
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">
                          Talabalar yuklanmoqda...
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-slate-400">
                          Hech qanday talaba topilmadi
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st._id} className="hover:bg-black/[0.015] dark:hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center space-x-3">
                              <div className="w-9 h-9 rounded-xl bg-infast-50 dark:bg-infast-950/40 text-infast-600 dark:text-infast-400 font-extrabold flex items-center justify-center shrink-0 border border-infast-200 dark:border-infast-800">
                                {st.firstName?.[0] || 'T'}
                              </div>
                              <div>
                                <span>
                                  {st.firstName} {st.lastName}
                                </span>
                                <span className="block text-[10px] text-slate-400 font-mono">
                                  ID: {st.studentCode || st._id.slice(-4)}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600 dark:text-slate-300">
                            <div>
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {st.branchId?.name || 'Asosiy filial'}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {st.groupId?.name || 'Guruh biriktirilmagan'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                            {st.courseId?.name || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold text-[10px] border border-amber-200 dark:border-amber-900/50 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-500" />
                                {st.xp || 0} XP
                              </span>
                              <span className="px-2.5 py-1 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 font-extrabold text-[10px] border border-orange-200 dark:border-orange-900/50 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-orange-500" />
                                {st.xcoin || 0}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedStudentForMap(st)}
                              className="px-4 py-2 rounded-xl bg-infast-50 hover:bg-infast-100 dark:bg-infast-950/40 dark:hover:bg-infast-900/50 text-infast-700 dark:text-infast-300 font-bold text-xs transition-all border border-infast-200 dark:border-infast-800/80 inline-flex items-center space-x-1.5 shadow-xs"
                            >
                              <Layers className="w-3.5 h-3.5 text-infast-500" />
                              <span>O'quv Xaritasi va Dars Ochish</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Instructions & Guides */}
        {activeTab === 'guide' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-in fade-in duration-200">
            <div className="apple-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Unlock className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                1. O'quvchiga darsni qanday ochaman?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Tizimda talaba mustaqil ravishda keyingi darsni ocholmaydi. O'qituvchi yoki ma'mur nazorati ostida:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  Talaba yonidagi <strong>"O'quv Xaritasi va Dars Ochish"</strong> tugmasini bosing.
                </li>
                <li>
                  Ochiladigan o'quv xaritasida qulflangan dars yonidagi <strong>"Darsni ochish"</strong> tugmasini bosing.
                </li>
                <li>
                  Dars bir zumda ochiladi va talaba nazariyani o'qish hamda test topshirishni boshlaydi.
                </li>
                <li>
                  Agar butun guruhga bitta darsni birdan ochmoqchi bo'lsangiz, yuqoridagi <strong>"Guruhga Darsni Ochish"</strong> tugmasidan foydalaning!
                </li>
              </ul>
            </div>

            <div className="apple-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Flag className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                2. Boshlang'ich darsni qanday belgilayman?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Agar yangi qo'shilgan o'quvchi ma'lum bilimga ega bo'lsa yoki guruhga 4-darsdan qo'shilsa:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  Talaba o'quv xaritasidan 4-darsdagi <Flag className="w-3.5 h-3.5 inline text-purple-600" /> <strong>"Boshlang'ich dars qilish"</strong> tugmasini bosing.
                </li>
                <li>
                  <strong>Muhim qoida:</strong> 1, 2 va 3-darslar soxta tarzda "bajarildi" deb belgilanmaydi va ularga asossiz XP/XCoin berilmaydi.
                </li>
                <li>
                  Talabaning taraqqiyoti toza va adolatli tarzda aynan tanlangan boshlang'ich darsdan hisoblanadi.
                </li>
              </ul>
            </div>

            <div className="apple-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                3. Test qoidalari va o'tish bali
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Har bir darsda qat'iy standartlashtirilgan test sinovi mavjud:
              </p>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc list-inside">
                <li>
                  <strong>3 bosqich &times; 3 savol = 9 ta savol</strong>.
                </li>
                <li>
                  O'tish me'yori: <strong>kamida 8 ta to'g'ri javob (&ge; 8/9)</strong>.
                </li>
                <li>
                  Baho serverda tekshiriladi — brauzer tomondan soxtalashtirish imkonsiz.
                </li>
                <li>
                  Testdan o'tgan talabaga avtomatik XP va XCoin balansi beriladi.
                </li>
              </ul>
            </div>

            <div className="apple-card p-6 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                4. Dars qachon to'liq yakunlanadi?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dars 3 bosqich to'liq bosib o'tilgandagina yakunlangan hisoblanadi:
              </p>
              <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] text-xs font-mono text-slate-800 dark:text-slate-200 space-y-1.5">
                <div>1. Nazariya to'liq o'qiladi</div>
                <div>2. 9 savolli test (&ge; 8/9) muvaffaqiyatli topshiriladi</div>
                <div>3. Amaliy topshiriq o'qituvchi tomonidan tasdiqlanadi</div>
                <div className="text-emerald-600 dark:text-emerald-400 font-bold">&rarr; DARS TO'LIQ YAKUNLANDI (Bonus XP beriladi)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Student Lesson Map */}
      {selectedStudentForMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="apple-card bg-white dark:bg-[#121216] w-full max-w-4xl p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.08] shrink-0">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">
                  {selectedStudentForMap.firstName} {selectedStudentForMap.lastName} — O'quv Xaritasi
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStudentForMap.courseId?.name || 'Kurs'} • {selectedStudentForMap.groupId?.name || 'Guruh'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForMap(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              <LessonMapTab
                studentId={selectedStudentForMap._id}
                courseName={selectedStudentForMap.courseId?.name}
                onRefreshStudent={fetchStudentsList}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal: Group Batch Unlock */}
      {groupUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="apple-card bg-white dark:bg-[#121216] w-full max-w-md p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center space-x-2 text-infast-600 dark:text-infast-400">
                <Unlock className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Guruhga Darsni Ommaviy Ochish
                </h3>
              </div>
              <button onClick={() => setGroupUnlockModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGroupUnlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Guruhni tanlang *</label>
                <select
                  required
                  value={groupUnlockForm.groupId}
                  onChange={(e) =>
                    setGroupUnlockForm({ ...groupUnlockForm, groupId: e.target.value })
                  }
                  className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Guruhni tanlang...</option>
                  {groups.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name} ({g.courseId?.name || 'Kurs'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ochiladigan Darsni tanlang *
                </label>
                <select
                  required
                  value={groupUnlockForm.lessonId}
                  onChange={(e) =>
                    setGroupUnlockForm({ ...groupUnlockForm, lessonId: e.target.value })
                  }
                  className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">Darsni tanlang...</option>
                  {allCurrentLessons.map((les) => (
                    <option key={les._id} value={les._id}>
                      [{les.moduleTitle}] {les.order}-dars: {les.title}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Tanlangan dars guruhdagi barcha faol talabalarga idempotent tarzda ochiladi. Avval ochilgan talabalar holati buzilmaydi.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setGroupUnlockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={groupUnlockSubmitting}
                  className="px-4 py-2 rounded-xl bg-infast-600 hover:bg-infast-700 text-white font-bold shadow-md transition-all flex items-center space-x-1"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{groupUnlockSubmitting ? 'Ochilmoqda...' : 'Guruhga Ochish'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="apple-card bg-white dark:bg-[#121216] w-full max-w-md p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {editingModuleId ? "Modulni Tahrirlash" : "Yangi Modul Qo'shish"}
              </h3>
              <button onClick={() => setShowAddModule(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Modul Nomi *</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  placeholder="Masalan: JavaScript Asoslari"
                  className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-infast-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tartib Raqami</label>
                <input
                  type="number"
                  value={moduleForm.order}
                  onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                  className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-infast-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  value={moduleForm.description}
                  onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  placeholder="Modul bo'yicha qisqacha tavsif..."
                  className="w-full p-2.5 bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.08] rounded-xl font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-infast-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-black/[0.06] dark:border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowAddModule(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-infast-600 hover:bg-infast-700 text-white font-bold shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revamped Lesson Editor Modal (Create or Edit) */}
      {(showAddLesson || editingLesson) && (
        <LessonEditorModal
          courseId={selectedCourseId}
          moduleId={showAddLesson || editingLesson?.moduleId || ''}
          lessonId={editingLesson?.lessonId || null}
          onClose={() => {
            setShowAddLesson(null);
            setEditingLesson(null);
          }}
          onSuccess={() => {
            const modId = showAddLesson || editingLesson?.moduleId;
            if (modId) {
              fetchLessons(selectedCourseId, modId);
            }
            fetchModules(selectedCourseId);
          }}
        />
      )}

      {/* Modal: Reset Progress */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="apple-card bg-white dark:bg-[#121216] w-full max-w-md rounded-3xl p-6 shadow-2xl border border-black/[0.08] dark:border-white/[0.08] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06] dark:border-white/[0.08]">
              <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Progressni Qayta Tiklash (Reset)</h3>
              </div>
              <button onClick={() => setResetModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200 space-y-1">
                <p className="font-bold">⚠️ Ushbu amal qaytarilmaydi!</p>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                  Tanlangan talabalarning barcha <strong>XP</strong> va <strong>XCoin</strong> ballari 0 ga tushadi, <strong>Darajasi</strong> 1 (boshlang'ich) qilinadi, boshlang'ich dars belgilanmagan holatga qaytadi va barcha ochilgan/tugatilgan darslar tozalanadi (xuddi yangi talaba kabi).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">Qamrovni tanlang:</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                    <input
                      type="radio"
                      name="resetScope"
                      checked={resetScope === 'group'}
                      onChange={() => setResetScope('group')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Faqat tanlangan guruh ({selectedGroupId !== 'ALL' ? (groups.find(g => g._id === selectedGroupId)?.name || 'Guruh') : 'Yuqoridagi guruh tanlang'})
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-black/[0.08] dark:border-white/[0.08] cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04]">
                    <input
                      type="radio"
                      name="resetScope"
                      checked={resetScope === 'all'}
                      onChange={() => setResetScope('all')}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Barcha faol talabalar {selectedBranchId !== 'ALL' && `(${branches.find(b => b._id === selectedBranchId)?.name || 'filial'} bo'yicha)`}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-black/[0.06] dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleResetProgress}
                disabled={resetSubmitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-all flex items-center space-x-1"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{resetSubmitting ? 'Nollashtirilmoqda...' : 'Ha, 0 ga qaytarish (Reset)'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Import Modal */}
      {showJsonImportModal && (
        <JsonImportModal
          isOpen={showJsonImportModal}
          onClose={() => setShowJsonImportModal(false)}
          courses={courses}
          defaultCourseId={selectedCourseId}
          onSuccess={(cId) => {
            setSelectedCourseId(cId);
            fetchModules(cId);
          }}
        />
      )}
    </div>
  );
}
