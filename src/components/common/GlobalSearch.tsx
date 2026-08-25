'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Users,
  Folder,
  BookOpen,
  UserCheck,
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  Settings,
  X,
  CornerDownLeft,
  ChevronRight,
  Phone,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_LINKS = [
  { name: 'Bosh sahifa', href: '/dashboard', icon: LayoutDashboard, desc: 'Statistika va asosiy ko\'rsatkichlar' },
  { name: 'Talabalar', href: '/students', icon: Users, desc: 'Barcha talabalar ro\'yxati va to\'lov holati' },
  { name: 'Guruhlar', href: '/groups', icon: Folder, desc: 'O\'quv guruhlari va dars jadvallari' },
  { name: 'Davomat', href: '/attendance', icon: CalendarCheck, desc: 'Kunlik va oylik davomat jurnali' },
  { name: "To'lovlar", href: '/payments', icon: CreditCard, desc: 'To\'lov qabul qilish va kvitansiyalar' },
  { name: 'Imtihonlar', href: '/exams', icon: GraduationCap, desc: 'Imtihonlar va baholash natijalari' },
  { name: 'Kurslar', href: '/courses', icon: BookOpen, desc: 'Mavjud ta\'lim yo\'nalishlari va narxlar' },
  { name: 'Sozlamalar', href: '/settings', icon: Settings, desc: 'Tizim va ma\'muriyat sozlamalari' },
];

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENTS' | 'GROUPS' | 'COURSES' | 'TEACHERS'>('ALL');
  const [results, setResults] = useState<{
    students: any[];
    groups: any[];
    courses: any[];
    teachers: any[];
  }>({
    students: [],
    groups: [],
    courses: [],
    teachers: [],
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
      setActiveTab('ALL');
      setResults({ students: [], groups: [], courses: [], teachers: [] });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ students: [], groups: [], courses: [], teachers: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults({
            students: data.students || [],
            groups: data.groups || [],
            courses: data.courses || [],
            teachers: data.teachers || [],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  const filteredStudents = activeTab === 'ALL' || activeTab === 'STUDENTS' ? results.students : [];
  const filteredGroups = activeTab === 'ALL' || activeTab === 'GROUPS' ? results.groups : [];
  const filteredCourses = activeTab === 'ALL' || activeTab === 'COURSES' ? results.courses : [];
  const filteredTeachers = activeTab === 'ALL' || activeTab === 'TEACHERS' ? results.teachers : [];

  const totalResultsCount =
    filteredStudents.length +
    filteredGroups.length +
    filteredCourses.length +
    filteredTeachers.length;

  return (
    <>
      {/* Apple Spotlight Trigger Bar */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-between w-48 sm:w-64 px-3.5 py-2 bg-slate-100/90 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-400 dark:text-slate-400 rounded-xl text-xs font-medium transition-all border border-slate-200 dark:border-slate-700/60 shadow-xs group"
        title="Tezkor qidiruv (Ctrl+K)"
      >
        <div className="flex items-center space-x-2.5 truncate">
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-infast-500 transition-colors shrink-0" />
          <span className="truncate">Qidirish...</span>
        </div>
        <div className="flex items-center space-x-1 shrink-0">
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </button>

      {/* Apple Spotlight Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4">
            {/* Ambient Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            />

            {/* Spotlight Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-10 flex flex-col max-h-[80vh] ring-1 ring-black/10"
            >
              {/* Search Input Bar */}
              <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-[#0f172a]">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0 mr-3.5" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Talaba, guruh, kurs yoki o'qituvchini qidiring..."
                  className="flex-1 bg-transparent text-sm sm:text-base font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
                />
                {loading ? (
                  <div className="w-4 h-4 border-2 border-infast-500 border-t-transparent rounded-full animate-spin shrink-0 ml-2" />
                ) : query ? (
                  <button
                    onClick={() => setQuery('')}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="text-[10px] font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md font-bold">
                    ESC
                  </kbd>
                )}
              </div>

              {/* Filter Tabs (when searching) */}
              {query.trim().length >= 2 && (
                <div className="flex items-center space-x-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-100 dark:border-slate-800 overflow-x-auto text-[11px] font-bold">
                  <button
                    onClick={() => setActiveTab('ALL')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'ALL'
                        ? 'bg-infast-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    Barchasi ({results.students.length + results.groups.length + results.courses.length + results.teachers.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('STUDENTS')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'STUDENTS'
                        ? 'bg-infast-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    Talabalar ({results.students.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('GROUPS')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'GROUPS'
                        ? 'bg-infast-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    Guruhlar ({results.groups.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('COURSES')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'COURSES'
                        ? 'bg-infast-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    Kurslar ({results.courses.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('TEACHERS')}
                    className={`px-3 py-1 rounded-lg transition-colors ${
                      activeTab === 'TEACHERS'
                        ? 'bg-infast-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                    }`}
                  >
                    O'qituvchilar ({results.teachers.length})
                  </button>
                </div>
              )}

              {/* Results Container */}
              <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {/* Empty Query State: Apple Style Quick Links */}
                {!query.trim() && (
                  <div className="space-y-2">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-infast-500" />
                      Tezkor Sahifalar
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {QUICK_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <button
                            key={link.href}
                            onClick={() => handleSelect(link.href)}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                          >
                            <div className="flex items-center space-x-3 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-infast-500 group-hover:text-white flex items-center justify-center transition-colors shrink-0">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-infast-600 dark:group-hover:text-infast-400 transition-colors">
                                  {link.name}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">
                                  {link.desc}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-infast-500 transition-colors shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* No Results Fallback */}
                {query.trim().length >= 2 && !loading && totalResultsCount === 0 && (
                  <div className="py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Hech qanday natija topilmadi
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      "{query}" so'rovi bo'yicha ma'lumot mavjud emas
                    </p>
                  </div>
                )}

                {/* Students Group */}
                {filteredStudents.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                      <Users className="w-3 h-3 mr-1 text-infast-500" />
                      Talabalar ({filteredStudents.length})
                    </p>
                    <div className="space-y-1">
                      {filteredStudents.map((s) => (
                        <button
                          key={s._id}
                          onClick={() => handleSelect(`/students/${s._id}`)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-infast-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                              {s.firstName?.[0] || 'T'}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-infast-600 dark:group-hover:text-infast-400 transition-colors truncate">
                                {s.firstName} {s.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center space-x-2 truncate">
                                <span>{s.phone}</span>
                                <span>•</span>
                                <span className="font-semibold text-infast-600 dark:text-infast-400">
                                  {s.groupId?.name || s.courseId?.name || 'Guruh'}
                                </span>
                              </p>
                            </div>
                          </div>
                          <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groups Group */}
                {filteredGroups.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                      <Folder className="w-3 h-3 mr-1 text-sky-500" />
                      Guruhlar ({filteredGroups.length})
                    </p>
                    <div className="space-y-1">
                      {filteredGroups.map((g) => (
                        <button
                          key={g._id}
                          onClick={() => handleSelect(`/groups/${g._id}`)}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold text-xs flex items-center justify-center shrink-0 border border-sky-500/20">
                              <Folder className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-infast-600 dark:group-hover:text-infast-400 transition-colors truncate">
                                {g.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {g.courseId?.name || 'Kurs'} • Xona: {g.room || '-'} • Ustoz: {g.teacherId ? `${g.teacherId.firstName} ${g.teacherId.lastName}` : '-'}
                              </p>
                            </div>
                          </div>
                          <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Courses Group */}
                {filteredCourses.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                      <BookOpen className="w-3 h-3 mr-1 text-emerald-500" />
                      Kurslar ({filteredCourses.length})
                    </p>
                    <div className="space-y-1">
                      {filteredCourses.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => handleSelect('/courses')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-infast-600 dark:group-hover:text-infast-400 transition-colors truncate">
                                {c.name}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                Davomiyligi: {c.durationMonths} oy • Narxi: {new Intl.NumberFormat('uz-UZ').format(c.price || 0)} so'm
                              </p>
                            </div>
                          </div>
                          <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Teachers Group */}
                {filteredTeachers.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center">
                      <UserCheck className="w-3 h-3 mr-1 text-purple-500" />
                      O'qituvchilar ({filteredTeachers.length})
                    </p>
                    <div className="space-y-1">
                      {filteredTeachers.map((t) => (
                        <button
                          key={t._id}
                          onClick={() => handleSelect('/teachers')}
                          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all text-left group border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60"
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center shrink-0 border border-purple-500/20">
                              <UserCheck className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-infast-600 dark:group-hover:text-infast-400 transition-colors truncate">
                                {t.firstName} {t.lastName}
                              </p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                {t.phone}
                              </p>
                            </div>
                          </div>
                          <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Apple Spotlight Minimal Footer */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between text-[11px] text-slate-400 font-medium px-5">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] mr-1.5 shadow-2xs font-mono font-bold">↵</kbd>
                    Ochish
                  </span>
                  <span className="flex items-center">
                    <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] mr-1.5 shadow-2xs font-mono font-bold">esc</kbd>
                    Yopish
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-infast-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-infast-500 animate-pulse" />
                  <span>Spotlight</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
