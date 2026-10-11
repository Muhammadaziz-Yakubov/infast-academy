'use client';

import React, { useState, useEffect } from 'react';
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
      let url = '/api/students?limit=100';
      if (selectedBranchId !== 'ALL') url += `&branchId=${selectedBranchId}`;
      if (selectedGroupId !== 'ALL') url += `&groupId=${selectedGroupId}`;
      if (selectedCourseId) url += `&courseId=${selectedCourseId}`;
      if (searchStudent) url += `&search=${encodeURIComponent(searchStudent)}`;

      const res = await fetch(url);
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
    if (!selectedCourseId) return;
    try {
      setSubmitting(true);
      if (editingModuleId) {
        await fetch(`/api/courses/${selectedCourseId}/modules/${editingModuleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleForm),
        });
      } else {
        await fetch(`/api/courses/${selectedCourseId}/modules`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(moduleForm),
        });
      }
      setShowAddModule(false);
      setEditingModuleId(null);
      setModuleForm({ title: '', description: '', order: '' });
      fetchModules(selectedCourseId);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Modul va unga tegishli darslarni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/courses/${selectedCourseId}/modules/${moduleId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchModules(selectedCourseId);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteLesson = async (moduleId: string, lessonId: string) => {
    if (!confirm("Darsni o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLessons(selectedCourseId, moduleId);
        fetchModules(selectedCourseId);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleGroupUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupUnlockForm.groupId || !groupUnlockForm.lessonId) {
      alert("Iltimos, guruh va ochiladigan darsni tanlang");
      return;
    }
    try {
      setGroupUnlockSubmitting(true);
      const res = await fetch(`/api/groups/${groupUnlockForm.groupId}/unlock-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: groupUnlockForm.lessonId }),
      });
      const json = await res.json();
      if (res.ok) {
        alert(json.message);
        setGroupUnlockModal(false);
        fetchStudentsList();
      } else {
        alert(json.error || "Guruhga dars ochishda xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGroupUnlockSubmitting(false);
    }
  };

  const handleResetProgress = async () => {
    if (!confirm("DIQQAT! Barcha tanlangan o'quvchilarning darajasi, XP, XCoin va ochilgan darslari 0 ga qaytariladi (xuddi yangi o'quvchi kabi toza bo'ladi). Haqiqatan ham tasdiqlaysizmi?")) {
      return;
    }

    try {
      setResetSubmitting(true);
      const payload: any = { confirmReset: true };
      if (resetScope === 'group') {
        if (selectedGroupId === 'ALL') {
          alert("Iltimos, guruhni tanlang yoki 'Barcha talabalar' variantini belgilang");
          setResetSubmitting(false);
          return;
        }
        payload.groupId = selectedGroupId;
      } else {
        if (selectedBranchId !== 'ALL') {
          payload.branchId = selectedBranchId;
        }
      }

      const res = await fetch('/api/lms/reset-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setResetModalOpen(false);
        fetchStudentsList();
      } else {
        alert(data.error || "Progressni qayta tiklashda xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setResetSubmitting(false);
    }
  };

  // Collect all lessons across current modules for dropdown
  const allCurrentLessons = modules.flatMap((m) =>
    (moduleLessons[m._id] || []).map((les) => ({
      ...les,
      moduleTitle: m.title,
    }))
  );

  return (
    <div className="flex-1 pb-16">
      <Header title="LMS — O'quv Dasturi va Boshqaruv" />

      <main className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Banner with Tabs */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-infast-600 to-infast-500 text-white flex items-center justify-center shadow-lg shadow-infast-500/20">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                LMS O'quv Platformasi
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Kurs &rarr; Modul &rarr; Dars (Nazariya, 9-savolli test, amaliyot) va Talabalar taraqqiyotini boshqarish
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl space-x-1 text-xs font-extrabold">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'curriculum'
                  ? 'bg-white text-infast-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              O'quv Dasturlari
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'students'
                  ? 'bg-white text-infast-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Talabalar & Dars Ochish
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-1 ${
                activeTab === 'guide'
                  ? 'bg-white text-infast-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
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
            {/* Course Selector Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500">Tanlangan Kurs:</span>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-infast-500"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.durationMonths} oy)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowJsonImportModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-xs"
                >
                  <Upload className="w-4 h-4 text-purple-600" />
                  <span>JSON Yuklash</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEditingModuleId(null);
                    setModuleForm({ title: '', description: '', order: String(modules.length + 1) });
                    setShowAddModule(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs shadow-md shadow-infast-500/20 flex items-center space-x-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Yangi Modul Qo'shish</span>
                </button>
              </div>
            </div>

            {/* Modules and Lessons List */}
            <div className="space-y-4">
              {loadingModules ? (
                <div className="bg-white p-12 rounded-3xl border text-center text-xs text-slate-400">
                  Modullar yuklanmoqda...
                </div>
              ) : modules.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-100 shadow-card text-center space-y-3">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                  <h3 className="font-bold text-slate-700">Ushbu kursda hali modullar yo'q</h3>
                  <p className="text-xs text-slate-400">
                    O'quv rejasini shakllantirish uchun "+ Yangi Modul Qo'shish" yoki "JSON orqali yuklash" tugmasini bosing.
                  </p>
                  <div className="pt-2 flex items-center justify-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowJsonImportModal(true)}
                      className="px-4 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold transition-all flex items-center space-x-1.5"
                    >
                      <Upload className="w-4 h-4" />
                      <span>JSON orqali yuklash</span>
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
                      className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden"
                    >
                      {/* Module Header Bar */}
                      <div className="p-5 flex items-center justify-between bg-slate-50/50 border-b border-slate-100">
                        <div
                          onClick={() =>
                            setExpandedModules((prev) => ({ ...prev, [mod._id]: !isExpanded }))
                          }
                          className="flex items-center space-x-3 cursor-pointer select-none"
                        >
                          <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center justify-center">
                            {mod.order}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-900">{mod.title}</h3>
                            {mod.description && (
                              <p className="text-xs text-slate-400">{mod.description}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-xl">
                            {lessons.length} ta dars
                          </span>
                          <button
                            onClick={() => setShowAddLesson(mod._id)}
                            className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Dars qo'shish</span>
                          </button>
                          <button
                            onClick={() => handleDeleteModule(mod._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons list */}
                      {isExpanded && (
                        <div className="divide-y divide-slate-100 p-3">
                          {lessons.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-400 italic">
                              Ushbu modulda hozircha darslar mavjud emas. Yuqoridagi "+ Dars qo'shish" tugmasidan foydalaning.
                            </div>
                          ) : (
                            lessons.map((les) => (
                              <div
                                key={les._id}
                                className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 rounded-2xl transition-colors"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-7 h-7 rounded-lg bg-infast-50 text-infast-700 font-extrabold text-xs flex items-center justify-center">
                                    {les.order}
                                  </div>
                                  <div>
                                    <h4 className="font-extrabold text-xs text-slate-900">
                                      {les.title}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                      <span className="flex items-center gap-1 text-slate-600">
                                        <FileText className="w-3 h-3 text-blue-500" /> Nazariya
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-slate-600">
                                        <ClipboardCheck className="w-3 h-3 text-amber-500" /> 9 savolli test (&ge;8/9)
                                      </span>
                                      <span>•</span>
                                      <span className="flex items-center gap-1 text-slate-600">
                                        <Code className="w-3 h-3 text-emerald-500" /> Amaliyot
                                      </span>
                                      <span>•</span>
                                      <span className="text-amber-600 font-bold">
                                        +{les.xpReward} XP / +{les.xcoinReward} XCoin
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => setEditingLesson({ moduleId: mod._id, lessonId: les._id })}
                                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors hover:bg-slate-100"
                                    title="Darsni tahrirlash"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteLesson(mod._id, les._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors hover:bg-slate-100"
                                    title="Darsni o'chirish"
                                  >
                                    <Trash2 className="w-4 h-4" />
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
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-card flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Talabani qidirish..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                {/* Branch filter */}
                <select
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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
                  className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-sm"
                  title="O'quvchilar progressini, darajasini va darslarini to'liq nollashtirish (Reset)"
                >
                  <RotateCcw className="w-4 h-4 text-rose-600" />
                  <span>Reset (0 qilish)</span>
                </button>

                {/* Group Batch Unlock Button */}
                <button
                  onClick={() => setGroupUnlockModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center space-x-1.5 transition-all"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Guruhga Darsni Ommaviy Ochish</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="p-4">Talaba</th>
                      <th className="p-4">Filial & Guruh</th>
                      <th className="p-4">Kurs</th>
                      <th className="p-4">XP & Tangalar</th>
                      <th className="p-4 text-center">Boshqaruv</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {loadingStudents ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Talabalar yuklanmoqda...
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          Hech qanday talaba topilmadi
                        </td>
                      </tr>
                    ) : (
                      students.map((st) => (
                        <tr key={st._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div>
                              <span>
                                {st.firstName} {st.lastName}
                              </span>
                              <span className="block text-[10px] text-slate-400 font-mono">
                                ID: {st.studentCode || st._id.slice(-4)}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">
                            <div>
                              <span className="font-semibold text-slate-900">
                                {st.branchId?.name || 'Asosiy'}
                              </span>
                              <span className="block text-[11px] text-slate-500">
                                {st.groupId?.name || '-'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-700">
                            {st.courseId?.name || '-'}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-black text-[10px] border border-amber-200 flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-500" />
                                {st.xp || 0} XP
                              </span>
                              <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-700 font-black text-[10px] border border-orange-200 flex items-center gap-1">
                                <Coins className="w-3 h-3 text-orange-500" />
                                {st.xcoin || 0}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => setSelectedStudentForMap(st)}
                              className="px-3 py-1.5 rounded-xl bg-infast-50 hover:bg-infast-100 text-infast-700 font-extrabold text-xs transition-all border border-infast-100 inline-flex items-center space-x-1"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Unlock className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                1. O'quvchiga darsni qanday ochaman?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tizimda talaba mustaqil ravishda keyingi darsni ocholmaydi. O'qituvchi yoki ma'mur:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  Talaba yonidagi <strong>"O'quv Xaritasi va Dars Ochish"</strong> tugmasini bosadi.
                </li>
                <li>
                  Ochiladigan o'quv xaritasida qulflangan dars yonidagi <strong>"Darsni ochish"</strong> tugmasini bosadi.
                </li>
                <li>
                  Dars bir zumda ochiladi va talaba nazariyani o'qish hamda test topshirishni boshlashi mumkin bo'ladi.
                </li>
                <li>
                  Agar butun guruhga bitta darsni birdan ochmoqchi bo'lsangiz, yuqoridagi <strong>"Guruhga Darsni Ommaviy Ochish"</strong> tugmasidan foydalaning!
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Flag className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                2. Boshlang'ich darsni qanday belgilayman?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agar yangi qo'shilgan o'quvchi ma'lum bilimga ega bo'lsa yoki guruhga 4-darsdan qo'shilsa:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
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

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                3. Test qoidalari va o'tish bali
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Har bir darsda qat'iy standartlashtirilgan test sinovi mavjud:
              </p>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>
                  <strong>3 bosqich &times; 3 savol = 9 ta savol</strong>.
                </li>
                <li>
                  O'tish me'yori: <strong>kamida 8 ta to'g'ri javob (&ge; 8/9)</strong>.
                </li>
                <li>
                  Baho serverda tekshiriladi — brauzer tomondan soxtalashtirish mumkin emas.
                </li>
                <li>
                  Testdan o'tgan talabaga avtomatik XP va XCoin balansi beriladi.
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">
                4. Dars qachon to'liq yakunlanadi?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dars 3 bosqich to'liq bosib o'tilgandagina yakunlangan hisoblanadi:
              </p>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs font-mono text-slate-800 space-y-1">
                <div>1. Nazariya o'qiladi</div>
                <div>2. 9 savolli test (&ge; 8/9) muvaffaqiyatli topshiriladi</div>
                <div>3. Amaliy topshiriq o'qituvchi tomonidan tasdiqlanadi</div>
                <div className="text-emerald-600 font-bold">&rarr; DARS TO'LIQ YAKUNLANDI (Bonus XP beriladi)</div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Student Lesson Map */}
      {selectedStudentForMap && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 my-8 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-black text-base text-slate-900">
                  {selectedStudentForMap.firstName} {selectedStudentForMap.lastName} — O'quv Xaritasi
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedStudentForMap.courseId?.name || 'Kurs'} • {selectedStudentForMap.groupId?.name || 'Guruh'}
                </p>
              </div>
              <button
                onClick={() => setSelectedStudentForMap(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                Guruhga Darsni Ommaviy Ochish
              </h3>
              <button onClick={() => setGroupUnlockModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGroupUnlock} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guruhni tanlang *</label>
                <select
                  required
                  value={groupUnlockForm.groupId}
                  onChange={(e) =>
                    setGroupUnlockForm({ ...groupUnlockForm, groupId: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
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
                <label className="block font-bold text-slate-700 mb-1">
                  Ochiladigan Darsni tanlang *
                </label>
                <select
                  required
                  value={groupUnlockForm.lessonId}
                  onChange={(e) =>
                    setGroupUnlockForm({ ...groupUnlockForm, lessonId: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="">Darsni tanlang...</option>
                  {allCurrentLessons.map((les) => (
                    <option key={les._id} value={les._id}>
                      [{les.moduleTitle}] {les.order}-dars: {les.title}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500">
                Tanlangan dars guruhdagi barcha faol talabalarga idempotent tarzda ochiladi. Avval ochilgan talabalar holati buzilmaydi.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGroupUnlockModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={groupUnlockSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md transition-all flex items-center space-x-1"
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
                  placeholder="Masalan: JavaScript Asoslari"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-rose-600">
                <RotateCcw className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">Progressni Qayta Tiklash (Reset)</h3>
              </div>
              <button onClick={() => setResetModalOpen(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-rose-900 space-y-1">
                <p className="font-bold">⚠️ Ushbu amal qaytarilmaydi!</p>
                <p className="text-[11px] text-rose-800 leading-relaxed">
                  Tanlangan talabalarning barcha <strong>XP</strong> va <strong>XCoin</strong> ballari 0 ga tushadi, <strong>Darajasi</strong> 1 (boshlang'ich) qilinadi, boshlang'ich dars belgilanmagan holatga qaytadi va barcha ochilgan/tugatilgan darslar tozalanadi (xuddi yangi talaba kabi).
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Qamrovni tanlang:</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="resetScope"
                      checked={resetScope === 'group'}
                      onChange={() => setResetScope('group')}
                      className="text-rose-600"
                    />
                    <span className="font-semibold text-slate-800">
                      Faqat tanlangan guruh ({selectedGroupId !== 'ALL' ? (groups.find(g => g._id === selectedGroupId)?.name || 'Guruh') : 'Yuqoridagi guruh tanlang'})
                    </span>
                  </label>

                  <label className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50">
                    <input
                      type="radio"
                      name="resetScope"
                      checked={resetScope === 'all'}
                      onChange={() => setResetScope('all')}
                      className="text-rose-600"
                    />
                    <span className="font-semibold text-slate-800">
                      Barcha faol talabalar {selectedBranchId !== 'ALL' && `(${branches.find(b => b._id === selectedBranchId)?.name || 'filial'} bo'yicha)`}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
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
