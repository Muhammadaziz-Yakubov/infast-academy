'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/Header';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import { ReceiptModal } from '@/components/payments/ReceiptModal';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  Calendar,
  User,
  X,
  CheckCircle2,
  FileText,
} from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<any>(null);

  const [formData, setFormData] = useState({
    studentId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    periodStartDate: new Date().toISOString().split('T')[0],
    periodEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    paymentMethod: 'CLICK',
    notes: '',
  });

  useEffect(() => {
    fetchPayments();
    fetchStudents();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/payments');
      if (res.ok) {
        const data = await res.json();
        setPayments(data.payments || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStudentSelect = (selectedId: string) => {
    const student = students.find((s) => s._id === selectedId);
    if (!student) {
      setFormData((prev) => ({ ...prev, studentId: selectedId }));
      return;
    }

    const fee = student.monthlyFee || student.courseId?.price || '';
    const joinedDateStr = student.joinedDate || new Date().toISOString().split('T')[0];
    const joinedDate = new Date(joinedDateStr);

    const totalPaid = student.totalAmountPaid || 0;
    const numFee = Number(fee) || 1;
    const paidMonthsCount = Math.floor(totalPaid / numFee);

    const startDateObj = new Date(joinedDate);
    startDateObj.setMonth(startDateObj.getMonth() + paidMonthsCount);

    const endDateObj = new Date(startDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + 1);

    const startStr = startDateObj.toISOString().split('T')[0];
    const endStr = endDateObj.toISOString().split('T')[0];

    setFormData((prev) => ({
      ...prev,
      studentId: selectedId,
      amount: fee ? String(fee) : prev.amount,
      periodStartDate: startStr,
      periodEndDate: endStr,
    }));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setShowAddModal(false);
        const currentStudent = students.find((s) => s._id === formData.studentId);
        setFormData({
          studentId: '',
          amount: '',
          paymentDate: new Date().toISOString().split('T')[0],
          periodStartDate: new Date().toISOString().split('T')[0],
          periodEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
          paymentMethod: 'CLICK',
          notes: '',
        });
        await fetchPayments();

        if (data.payment) {
          const newPayment = {
            ...data.payment,
            studentId: currentStudent || data.payment.studentId,
          };
          setSelectedPaymentForReceipt(newPayment);
        }
      } else {
        const err = await res.json();
        alert(err.error || "Xatolik");
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="flex-1 pb-12">
      <Header title="To'lovlar" />

      <main className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-card">
          <h2 className="font-bold text-base text-slate-900">Barcha Qabul Qilingan To'lovlar</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-semibold text-xs rounded-xl shadow-md flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>To'lov Qabul Qilish</span>
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase">
              <tr>
                <th className="p-3.5">Talaba</th>
                <th className="p-3.5">Guruh / Kurs</th>
                <th className="p-3.5">Summa</th>
                <th className="p-3.5">To'lov Sana</th>
                <th className="p-3.5">Davr (Period)</th>
                <th className="p-3.5">Usul</th>
                <th className="p-3.5">Izoh</th>
                <th className="p-3.5 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr><td colSpan={8} className="p-12 text-center text-slate-400">Yuklanmoqda...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={8} className="p-12 text-center text-slate-400">To'lovlar mavjud emas</td></tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">
                      {p.studentId?.firstName} {p.studentId?.lastName}
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {p.studentId?.groupId?.name || '-'} ({p.studentId?.courseId?.name || '-'})
                    </td>
                    <td className="p-3.5 font-extrabold text-emerald-600">{formatMoneyUz(p.amount)}</td>
                    <td className="p-3.5">{formatDateUz(p.paymentDate)}</td>
                    <td className="p-3.5 text-slate-500 font-mono">
                      {formatDateUz(p.periodStartDate)} → {formatDateUz(p.periodEndDate)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[10px]">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{p.notes || '-'}</td>
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedPaymentForReceipt(p)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200 inline-flex items-center space-x-1 transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Chek</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal: Record Payment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-900">To'lov Qabul Qilish</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Talaba *</label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="">Talabani tanlang</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentCode ? `[${s.studentCode}] ` : ''}{s.firstName} {s.lastName} ({s.groupId?.name || 'Guruh'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To'lov Summasi (so'm) *</label>
                  <input
                    type="number"
                    required
                    placeholder="800000"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To'lov Usuli *</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="CLICK">Click</option>
                    <option value="PAYME">Payme</option>
                    <option value="CARD">Karta</option>
                    <option value="CASH">Naqd</option>
                    <option value="OTHER">Boshqa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Davr Boshi *</label>
                  <input
                    type="date"
                    required
                    value={formData.periodStartDate}
                    onChange={(e) => setFormData({ ...formData, periodStartDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Davr Oxiri *</label>
                  <input
                    type="date"
                    required
                    value={formData.periodEndDate}
                    onChange={(e) => setFormData({ ...formData, periodEndDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Izoh</label>
                <input
                  type="text"
                  placeholder="Masalan: Click orqali to'landi"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
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

      {/* Modal: Receipt Preview & Print */}
      {selectedPaymentForReceipt && (
        <ReceiptModal
          payment={selectedPaymentForReceipt}
          onClose={() => setSelectedPaymentForReceipt(null)}
        />
      )}
    </div>
  );
}
