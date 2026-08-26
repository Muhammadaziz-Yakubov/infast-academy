'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import { CheckCircle2, Zap, Printer, ArrowLeft, ShieldCheck, CreditCard, Calendar, User, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function PublicReceiptPage() {
  const params = useParams();
  const id = params?.id as string;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchReceipt();
    }
  }, [id]);

  const fetchReceipt = async () => {
    try {
      const res = await fetch(`/api/public/receipt/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPayment(data.payment);
      } else {
        const err = await res.json();
        setError(err.error || "To'lov topilmadi");
      }
    } catch (e: any) {
      setError("Tarmoq xatoligi");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const receiptUrl = typeof window !== 'undefined' ? `${window.location.origin}/receipt/${id}` : `https://infast.uz/receipt/${id}`;
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(receiptUrl)}`;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-infast-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Kvitansiya yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center space-y-4 border border-slate-100">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Kvitansiya Topilmadi</h2>
          <p className="text-sm text-slate-500">{error || "Kiritilgan ID bo'yicha to'lov ma'lumotlari mavjud emas."}</p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-infast-500 text-white rounded-xl text-xs font-bold shadow-md hover:bg-infast-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tizimga Kirish</span>
          </Link>
        </div>
      </div>
    );
  }

  const receiptNo = `INF-PAY-${(payment._id || payment.id || id).slice(-8).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 p-4 md:p-8 flex flex-col items-center justify-center print:bg-white print:p-0">
      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-lg w-full flex items-center justify-between mb-4 print:hidden">
        <Link
          href="/payments"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 text-xs font-bold text-white bg-infast-500 hover:bg-infast-600 px-4 py-2 rounded-xl shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Chop etish (Print)</span>
        </button>
      </div>

      {/* Printable Receipt Card */}
      <div className="max-w-lg w-full bg-white rounded-3xl p-6 md:p-8 shadow-2xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        {/* Verification Status Header */}
        <div className="flex items-center justify-between pb-6 border-b border-dashed border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-infast-500 rounded-2xl flex items-center justify-center text-white font-black shadow-md shadow-infast-500/30 shrink-0">
              <Zap className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="font-black text-lg text-slate-900 tracking-tight leading-none">INFAST</h1>
              <p className="text-[10px] font-extrabold text-infast-600 uppercase tracking-widest mt-1">IT-ACADEMY</p>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>RASMIY CHEK</span>
            </span>
            <p className="text-[10px] font-mono text-slate-400 mt-1">{receiptNo}</p>
          </div>
        </div>

        {/* Amount & Period Highlight */}
        <div className="my-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center space-y-1">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Qabul qilingan to'lov summasi</p>
          <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 tracking-tight">
            {formatMoneyUz(payment.amount)}
          </p>
          <div className="pt-2 border-t border-slate-200/60 mt-2">
            <p className="text-[11px] text-slate-600 font-medium">
              <span className="font-bold text-slate-700">Qamrab olingan davr (Period):</span>
            </p>
            <p className="text-xs font-mono font-bold text-infast-700 mt-0.5">
              {formatDateUz(payment.periodStartDate)} — {formatDateUz(payment.periodEndDate)}
            </p>
          </div>
        </div>

        {/* Details Table */}
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center">
              <User className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Talaba F.I.SH.
            </span>
            <span className="font-bold text-slate-900 text-right">
              {payment.studentId?.firstName} {payment.studentId?.lastName}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Guruh / Kurs
            </span>
            <span className="font-semibold text-slate-800 text-right">
              {payment.studentId?.groupId?.name || '-'} ({payment.studentId?.courseId?.name || '-'})
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center">
              <CreditCard className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> To'lov usuli
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[11px] text-slate-800">
              {payment.paymentMethod}
            </span>
          </div>

          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500 font-medium flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> To'langan sana
            </span>
            <span className="font-medium text-slate-700">{formatDateUz(payment.paymentDate)}</span>
          </div>

          {payment.notes && (
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Izoh</span>
              <span className="font-medium text-slate-700 text-right">{payment.notes}</span>
            </div>
          )}
        </div>

        {/* QR Code & Verification Stamp */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-200 flex items-center justify-between">
          <div className="space-y-1 max-w-[240px]">
            <div className="flex items-center space-x-1 text-emerald-600 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Haqiqiyligi Tasdiqlangan</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Ushbu elektron kvitansiya INFAST IT-ACADEMY CRM tizimi tomonidan avtomatik shakllantirildi va tasdiqlandi.
            </p>
          </div>

          <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
            {/* Standard QR Code preview */}
            <img src={qrCodeSrc} alt="Receipt QR Code" className="w-20 h-20 object-contain" />
          </div>
        </div>

        {/* Printable Footer */}
        <div className="mt-6 text-center text-[10px] text-slate-400 font-mono pt-4 border-t border-slate-100">
          www.infast.uz • Qo'llab-quvvatlash markazi: +998 (90) 123-45-67
        </div>
      </div>
    </div>
  );
}
