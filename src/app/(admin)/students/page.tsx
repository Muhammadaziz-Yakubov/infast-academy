'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import {
  Users,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileSpreadsheet,
  X,
  CreditCard,
  CheckSquare,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkPaymentModal, setShowBulkPaymentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  // Multi-select & Bulk Payment state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [bulkPaymentData, setBulkPaymentData] = useState({
    customAmount: '',
    paymentMethod: 'CASH',
    notes: '',
  });
  const [submittingBulk, setSubmittingBulk] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map((s) => s._id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sId) => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleBulkPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) return;

    setSubmittingBulk(true);
    try {
      const res = await fetch('/api/payments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedStudentIds,
          customAmount: bulkPaymentData.customAmount || undefined,
          paymentMethod: bulkPaymentData.paymentMethod,
          notes: bulkPaymentData.notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(data.message || `${selectedStudentIds.length} ta talaba uchun to'lov saqlandi`);
        setShowBulkPaymentModal(false);
        setSelectedStudentIds([]);
        setBulkPaymentData({ customAmount: '', paymentMethod: 'CASH', notes: '' });
        fetchStudents();
      } else {
        const err = await res.json();
        alert(err.error || "To'lovni saqlashda xatolik");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setSubmittingBulk(false);
    }
  };

  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    parentPhone: '',
    birthDate: '',
    courseId: '',
    groupId: '',
    joinedDate: '',
    monthlyFee: '',
    paymentDueDay: '5',
    status: 'ACTIVE',
  });

  // Add form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    parentPhone: '',
    birthDate: '',
    courseId: '',
    groupId: '',
    joinedDate: new Date().toISOString().split('T')[0],
    monthlyFee: '',
    paymentDueDay: '5',
    status: 'ACTIVE',
  });

  // Import state
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [validationResults, setValidationResults] = useState<any[]>([]);
  const [validationSummary, setValidationSummary] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [search, selectedCourse, selectedGroup, selectedStatus, selectedPaymentStatus]);

  const fetchInitialData = async () => {
    try {
      const [cRes, gRes] = await Promise.all([
        fetch('/api/courses'),
        fetch('/api/groups'),
      ]);
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || []);
      }
      if (gRes.ok) {
        const gData = await gRes.json();
        setGroups(gData.groups || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCourse) params.append('courseId', selectedCourse);
      if (selectedGroup) params.append('groupId', selectedGroup);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedPaymentStatus) params.append('paymentStatus', selectedPaymentStatus);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          parentPhone: '',
          birthDate: '',
          courseId: '',
          groupId: '',
          joinedDate: new Date().toISOString().split('T')[0],
          monthlyFee: '',
          paymentDueDay: '5',
          status: 'ACTIVE',
        });
        fetchStudents();
      } else {
        const errData = await res.json();
        alert(errData.error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    }
  };

  const handleOpenEditModal = (student: any) => {
    setEditingStudent(student);
    setEditFormData({
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      phone: student.phone || '',
      parentPhone: student.parentPhone || '',
      birthDate: student.birthDate ? new Date(student.birthDate).toISOString().split('T')[0] : '',
      courseId: student.courseId?._id || student.courseId || '',
      groupId: student.groupId?._id || student.groupId || '',
      joinedDate: student.joinedDate ? new Date(student.joinedDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      monthlyFee: student.monthlyFee ? String(student.monthlyFee) : '',
      paymentDueDay: String(student.paymentDueDay || 5),
      status: student.status || 'ACTIVE',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    try {
      const res = await fetch(`/api/students/${editingStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchStudents();
      } else {
        const errData = await res.json();
        alert(errData.error || "Xatolik yuz berdi");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Rostdan ham ushbu talabani o'chirmoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchStudents();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Excel File Read & Parse
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValidating(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);

        // Map column headers to standard ExcelRowData
        const rowsToValidate = rawJson.map((r: any) => ({
          firstName: r["Ism"] || r["First Name"] || "",
          lastName: r["Familiya"] || r["Last Name"] || "",
          phone: r["Telefon"] || r["Phone"] || "",
          parentPhone: r["Ota-ona telefoni"] || r["Parent Phone"] || "",
          birthDate: r["Tug'ilgan sana"] || r["Birth Date"] || "",
          course: r["Kurs"] || r["Course"] || "",
          group: r["Guruh"] || r["Group"] || "",
          joinedDate: r["Qo'shilgan sana"] || r["Joined Date"] || "",
          monthlyFee: r["Oylik to'lov"] || r["Monthly Fee"] || undefined,
          paymentDueDay: r["To'lov kuni"] || r["Payment Due Day"] || undefined,
        }));

        setParsedRows(rowsToValidate);

        // Send to backend validation API
        const vRes = await fetch('/api/students/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'validate', rows: rowsToValidate }),
        });

        if (vRes.ok) {
          const vData = await vRes.json();
          setValidationResults(vData.results || []);
          setValidationSummary(vData.summary || {});
          setImportStep(2);
        }
      } catch (err: any) {
        alert("Faylni o'qishda xatolik: " + err.message);
      } finally {
        setValidating(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmImport = async () => {
    setImporting(true);
    try {
      const validRowsToImport = validationResults.filter((r) => r.isValid);
      const res = await fetch('/api/students/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'commit', validRowsToImport }),
      });

      if (res.ok) {
        setShowImportModal(false);
        setImportStep(1);
        setValidationResults([]);
        fetchStudents();
      } else {
        const errData = await res.json();
        alert(errData.error || "Import qilishda xatolik");
      }
    } catch (e: any) {
      alert("Xatolik: " + e.message);
    } finally {
      setImporting(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (selectedCourse) params.append('courseId', selectedCourse);
    if (selectedGroup) params.append('groupId', selectedGroup);
    if (selectedStatus) params.append('status', selectedStatus);

    window.open(`/api/students/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="Talabalar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Talabani qidirish (ism, familiya, telefon)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-infast-500/20"
              />
            </div>

            {/* Course Filter */}
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">Barcha Kurslar</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>

            {/* Group Filter */}
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">Barcha Guruhlar</option>
              {groups.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>

            {/* Payment Status Filter */}
            <select
              value={selectedPaymentStatus}
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
            >
              <option value="">Barcha To'lov Holatlari</option>
              <option value="PAID">To'langan</option>
              <option value="OVERDUE">Qarzdor</option>
              <option value="PARTIAL">Kutilmoqda</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>

            <button
              onClick={handleExport}
              className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md shadow-infast-500/20 flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Talaba Qo'shish</span>
            </button>
          </div>
        </div>

        {/* Floating Bulk Action Bar */}
        {selectedStudentIds.length > 0 && (
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between border border-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center space-x-3">
              <span className="bg-infast-500 text-white text-xs font-extrabold px-3 py-1 rounded-xl">
                {selectedStudentIds.length} ta tanlandi
              </span>
              <p className="text-xs font-semibold text-slate-300 hidden sm:block">
                Tanlangan talabalar uchun ommaviy to'lov qabul qilish
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowBulkPaymentModal(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-all"
              >
                <CreditCard className="w-4 h-4" />
                <span>To'lov Qilish ({selectedStudentIds.length})</span>
              </button>
              <button
                onClick={() => setSelectedStudentIds([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl font-semibold transition-all"
              >
                Bekor qilish
              </button>
            </div>
          </div>
        )}

        {/* Students Table Card */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={students.length > 0 && selectedStudentIds.length === students.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-300 text-infast-600 focus:ring-infast-500/20 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Talaba</th>
                  <th className="py-3.5 px-4">Telefon</th>
                  <th className="py-3.5 px-4">Kurs</th>
                  <th className="py-3.5 px-4">Guruh</th>
                  <th className="py-3.5 px-4">Oylik To'lov</th>
                  <th className="py-3.5 px-4">To'lov Holati</th>
                  <th className="py-3.5 px-4">Holati</th>
                  <th className="py-3.5 px-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      Yuklanmoqda...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-medium">
                      Hali talabalar mavjud emas. Birinchi talabangizni qo'shing.
                    </td>
                  </tr>
                ) : (
                  students.map((s) => {
                    const isSelected = selectedStudentIds.includes(s._id);
                    return (
                      <tr key={s._id} className={`hover:bg-slate-50/60 transition-colors ${isSelected ? 'bg-infast-50/40' : ''}`}>
                        <td className="py-3.5 px-4 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectStudent(s._id)}
                            className="w-4 h-4 rounded border-slate-300 text-infast-600 focus:ring-infast-500/20 cursor-pointer"
                          />
                        </td>
                        <td className="py-3.5 px-4">
                          <Link href={`/students/${s._id}`} className="flex items-center space-x-3 group">
                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0 group-hover:bg-infast-500 transition-colors">
                              {s.firstName[0]}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 group-hover:text-infast-600 transition-colors">
                                {s.firstName} {s.lastName}
                              </p>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-700">{s.phone}</td>
                        <td className="py-3.5 px-4 text-slate-700">{s.courseId?.name || '-'}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-semibold text-[11px]">
                            {s.groupId?.name || '-'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">{formatMoneyUz(s.effectiveFee)}</td>
                        <td className="py-3.5 px-4">
                        {s.paymentStatus === 'PAID' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center w-max">
                            <CheckCircle className="w-3 h-3 mr-1" /> To'langan
                          </span>
                        )}
                        {s.paymentStatus === 'OVERDUE' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] flex items-center w-max">
                            <XCircle className="w-3 h-3 mr-1" /> Qarzdor ({formatMoneyUz(s.totalDebt)})
                          </span>
                        )}
                        {s.paymentStatus === 'PARTIAL' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[10px] flex items-center w-max">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Kutilmoqda
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                          s.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                          s.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Link
                            href={`/students/${s._id}`}
                            className="p-1.5 text-slate-400 hover:text-infast-600 hover:bg-infast-50 rounded-lg transition-colors"
                            title="Profilni ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(s)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal: Add Student */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Yangi Talaba Qo'shish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Familiya *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon *</label>
                  <input
                    type="text"
                    required
                    placeholder="+998901234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-ona telefoni</label>
                  <input
                    type="text"
                    placeholder="+998909876543"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
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
                      <option key={c._id} value={c._id}>{c.name} ({formatMoneyUz(c.price)})</option>
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maxsus Oylik Fee</label>
                  <input
                    type="number"
                    placeholder="Standart narx"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Har oylik to'lov kuni (Masalan: 5-sana)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formData.paymentDueDay}
                    onChange={(e) => setFormData({ ...formData, paymentDueDay: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
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
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Student */}
      {showEditModal && editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">Talaba Ma'lumotlarini Tahrirlash</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Familiya *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Telefon *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ota-ona telefoni</label>
                  <input
                    type="text"
                    value={editFormData.parentPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, parentPhone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Kurs *</label>
                  <select
                    required
                    value={editFormData.courseId}
                    onChange={(e) => setEditFormData({ ...editFormData, courseId: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
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
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                  >
                    <option value="">Guruhni tanlang</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Maxsus Oylik Fee</label>
                  <input
                    type="number"
                    value={editFormData.monthlyFee}
                    onChange={(e) => setEditFormData({ ...editFormData, monthlyFee: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To'lov kuni (1-31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={editFormData.paymentDueDay}
                    onChange={(e) => setEditFormData({ ...editFormData, paymentDueDay: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Holati (Status)</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="ACTIVE">Faol (ACTIVE)</option>
                  <option value="PAUSED">Muzlatilgan (PAUSED)</option>
                  <option value="LEFT">Tark etgan (LEFT)</option>
                  <option value="COMPLETED">Tugatgan (COMPLETED)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
            </form>
          </div>
        </div>
      )}

      {/* Modal: Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Excel Import</h3>
                <p className="text-xs text-slate-500">Talabalar ro'yxatini .xlsx fayldan yuklash va DB tekshiruvidan o'tkazish</p>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {importStep === 1 && (
              <div className="space-y-6 py-4">
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileSpreadsheet className="w-8 h-8 text-sky-600" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">1-Qadam: Namuna faylini yuklab oling</h4>
                      <p className="text-[11px] text-slate-600">To'g'ri ustunlar strukturasi uchun namuna shablon</p>
                    </div>
                  </div>
                  <a
                    href="/api/students/import"
                    download="Download Sample.xlsx"
                    className="px-4 py-2 bg-white border border-sky-200 text-sky-700 hover:bg-sky-100 font-semibold text-xs rounded-xl shadow-sm"
                  >
                    Download Sample.xlsx
                  </a>
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3 bg-slate-50 hover:bg-slate-100/50 transition-colors relative">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto" />
                  <div>
                    <p className="font-bold text-sm text-slate-800">2-Qadam: Excel (.xlsx) faylingizni tanlang</p>
                    <p className="text-xs text-slate-500">Fayl tizimda avtomatik ravishda Kurs va Guruh tekshiruvidan o'tadi</p>
                  </div>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {importStep === 2 && (
              <div className="space-y-4">
                {/* Validation Summary */}
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 font-semibold">Jami qatorlar</p>
                    <p className="text-lg font-bold text-slate-900">{validationSummary?.totalRows || 0}</p>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <p className="text-emerald-600 font-semibold">Yaroqli qatorlar ✓</p>
                    <p className="text-lg font-bold text-emerald-700">{validationSummary?.validRows || 0}</p>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-rose-600 font-semibold">Xatoli qatorlar ✕</p>
                    <p className="text-lg font-bold text-rose-700">{validationSummary?.invalidRows || 0}</p>
                  </div>
                </div>

                {/* Rows Validation Table Preview */}
                <div className="max-h-64 overflow-y-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-100 sticky top-0">
                      <tr>
                        <th className="p-2.5">Qator</th>
                        <th className="p-2.5">Talaba</th>
                        <th className="p-2.5">Telefon</th>
                        <th className="p-2.5">Kurs</th>
                        <th className="p-2.5">Guruh</th>
                        <th className="p-2.5">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {validationResults.map((res: any, idx: number) => (
                        <tr key={idx} className={res.isValid ? "bg-white" : "bg-rose-50/40"}>
                          <td className="p-2.5 font-bold">{res.rowNumber}</td>
                          <td className="p-2.5 font-semibold">{res.data.firstName} {res.data.lastName}</td>
                          <td className="p-2.5 font-mono">{res.data.phone}</td>
                          <td className="p-2.5">
                            {res.data.course} {res.courseExists ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-rose-600 font-bold">✕</span>}
                          </td>
                          <td className="p-2.5">
                            {res.data.group} {res.groupExists ? <span className="text-emerald-600 font-bold">✓</span> : <span className="text-rose-600 font-bold">✕</span>}
                          </td>
                          <td className="p-2.5">
                            {res.isValid ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Yaroqli</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold" title={res.errorMessage}>
                                Xatolik
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {validationSummary?.invalidRows > 0 && (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-xs whitespace-pre-line font-medium">
                    ⚠️ Ba'zi qatorlarda kurs yoki guruh topilmadi. Faqat yaroqli ({validationSummary?.validRows}) ta talaba import qilinadi.
                  </div>
                )}

                <div className="pt-2 flex justify-between">
                  <button
                    onClick={() => setImportStep(1)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                  >
                    ← Boshqa fayl tanlash
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={importing || validationSummary?.validRows === 0}
                    className="px-5 py-2 bg-infast-500 hover:bg-infast-600 text-white font-semibold rounded-xl text-xs shadow-md disabled:opacity-50"
                  >
                    {importing ? "Import qilinmoqda..." : `${validationSummary?.validRows || 0} ta Talabani Import Qilish`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Bulk Payment */}
      {showBulkPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-emerald-600" />
                Ommaviy To'lov Qabul Qilish
              </h3>
              <button onClick={() => setShowBulkPaymentModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBulkPaymentSubmit} className="space-y-4 text-xs">
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-emerald-900 space-y-1">
                <p className="font-bold text-sm">
                  Tanlangan talabalar: <span className="text-emerald-700 font-extrabold">{selectedStudentIds.length} ta</span>
                </p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Barcha tanlangan talabalar uchun to'lov qabul qilinadi va qarzdorlik to'langan deb belgilanadi.
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Maxsus Summa (Har bir talaba uchun) (Ixtiyoriy)</label>
                <input
                  type="number"
                  placeholder="Bo'sh qolsa, talabalarning oylik tarifi olinadi"
                  value={bulkPaymentData.customAmount}
                  onChange={(e) => setBulkPaymentData({ ...bulkPaymentData, customAmount: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">To'lov Usuli *</label>
                <select
                  value={bulkPaymentData.paymentMethod}
                  onChange={(e) => setBulkPaymentData({ ...bulkPaymentData, paymentMethod: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                >
                  <option value="CASH">Naqd pul (CASH)</option>
                  <option value="CARD">Karta orqali (CARD)</option>
                  <option value="BANK">Bank o'tkazmasi (BANK)</option>
                  <option value="CLICK">Click</option>
                  <option value="PAYME">Payme</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh (Ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="Masalan: Fevral oyi to'lovi"
                  value={bulkPaymentData.notes}
                  onChange={(e) => setBulkPaymentData({ ...bulkPaymentData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBulkPaymentModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submittingBulk}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{submittingBulk ? "Saqlanmoqda..." : `To'lovni Saqlash (${selectedStudentIds.length})`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
