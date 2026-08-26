'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatMoneyUz, formatDateUz } from '@/lib/utils';
import { CheckCircle2, Printer, ArrowLeft, ShieldCheck, FileCheck } from 'lucide-react';
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
      <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-400">Kvitansiya yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 shadow-2xl text-center space-y-4 border border-slate-800">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Kvitansiya Topilmadi</h2>
          <p className="text-sm text-slate-400">{error || "Kiritilgan ID bo'yicha to'lov ma'lumotlari mavjud emas."}</p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors"
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center print:bg-white print:p-0">
      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-md w-full flex items-center justify-between mb-4 print:hidden">
        <Link
          href="/payments"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Chop etish (Print)</span>
        </button>
      </div>

      {/* Authentic Printable Receipt Card */}
      <div className="max-w-md w-full bg-white text-slate-900 font-mono rounded-2xl p-6 md:p-8 shadow-2xl border border-slate-200 relative overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none print:rounded-none">
        {/* Header Organization Details */}
        <div className="text-center space-y-1 pb-4 border-b border-dashed border-slate-300">
          <h2 className="font-extrabold text-base tracking-tight font-sans text-slate-950">INFAST IT-ACADEMY</h2>
          <p className="text-[10px] text-slate-500 font-sans font-semibold">"INFAST26" Xususiy Korxonasi</p>
          <p className="text-[10px] text-slate-500">STIR: 312 956 346 • Tel: +998 (90) 271-00-27</p>
          <p className="text-[10px] text-slate-400">www.infast.uz</p>
        </div>

        {/* Receipt Title */}
        <div className="text-center font-bold tracking-wider py-1.5 border-b border-slate-200 uppercase bg-slate-50 text-[11px] text-slate-800 my-3">
          TO'LOV KVITANSIYASI / FISCAL RECEIPT
        </div>

        {/* Data Table */}
        <div className="space-y-2 text-xs pt-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Chek №:</span>
            <span className="font-bold text-slate-900">{receiptNo}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Sana va vaqt:</span>
            <span className="font-bold text-slate-900">{formatDateUz(payment.paymentDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Talaba F.I.SH.:</span>
            <span className="font-bold text-slate-900 text-right">
              {payment.studentId?.firstName} {payment.studentId?.lastName}
            </span>
          </div>
          {payment.studentId?.studentCode && (
            <div className="flex justify-between">
              <span className="text-slate-500">Talaba ID (Kod):</span>
              <span className="font-bold text-slate-900 font-mono">{payment.studentId.studentCode}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-500">Guruh / Kurs:</span>
            <span className="font-bold text-slate-900 text-right">
              {payment.studentId?.groupId?.name || '-'} ({payment.studentId?.courseId?.name || '-'})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">To'lov usuli:</span>
            <span className="font-bold text-slate-900 uppercase">{payment.paymentMethod}</span>
          </div>
          {payment.notes && (
            <div className="flex justify-between">
              <span className="text-slate-500">Izoh:</span>
              <span className="font-bold text-slate-900 text-right">{payment.notes}</span>
            </div>
          )}
        </div>

        {/* Payment Period Block */}
        <div className="my-4 py-3 px-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-0.5">
          <p className="text-[10px] font-sans font-bold text-slate-500 uppercase tracking-wider">Qamrab olingan to'lov davri</p>
          <p className="text-xs font-bold text-slate-950 font-mono">
            {formatDateUz(payment.periodStartDate)} — {formatDateUz(payment.periodEndDate)}
          </p>
        </div>

        {/* Total Amount Box */}
        <div className="py-4 px-4 border-2 border-slate-950 rounded-xl text-center space-y-0.5 bg-slate-950 text-white my-4">
          <p className="text-[10px] font-sans text-slate-400 uppercase tracking-widest font-medium">Jami to'langan summa</p>
          <p className="text-2xl font-black tracking-tight text-emerald-400">
            {formatMoneyUz(payment.amount)}
          </p>
        </div>

        {/* QR Code Verification Section */}
        <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between gap-3">
          <div className="space-y-1 text-[10px] text-slate-500 leading-tight">
            <div className="flex items-center space-x-1 text-emerald-700 font-bold font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ONLINE CHEK VERIFIED</span>
            </div>
            <p className="font-sans">Haqiqiyligini tekshirish uchun ushbu QR-kodni telefoningiz kameralari orqali skaner qiling.</p>
            <p className="text-[9px] text-slate-400 font-mono">ID: {id}</p>
          </div>

          <div className="p-1 bg-white border border-slate-300 rounded-lg shrink-0">
            <img src={qrCodeSrc} alt="Receipt QR Code" className="w-20 h-20 object-contain" />
          </div>
        </div>

        {/* Footer Receipt Note */}
        <div className="text-center text-[9px] text-slate-400 pt-3 border-t border-slate-200 mt-4">
          *** XIZMATINGIZ UCHUN TASHAKKUR! ***
        </div>
      </div>
    </div>
  );
}
