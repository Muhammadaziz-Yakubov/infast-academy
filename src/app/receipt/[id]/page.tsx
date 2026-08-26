'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ReceiptCard } from '@/components/payments/ReceiptCard';
import { Printer, ArrowLeft, ShieldCheck, AlertCircle } from 'lucide-react';
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
        setError(err.error || "To'lov kvitansiyasi topilmadi");
      }
    } catch (e: any) {
      setError("Server bilan aloqa bog'lanmadi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-400 font-sans tracking-wide uppercase">
            Rasmiy Kvitansiya Yuklanmoqda...
          </p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 rounded-3xl p-8 shadow-2xl text-center space-y-5 border border-slate-800">
          <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-inner">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white font-sans">Kvitansiya Topilmadi</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {error || "Kiritilgan ID bo'yicha to'lov ma'lumotlari tizimda mavjud emas yoki o'chirilgan."}
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center space-x-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all font-sans"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tizimga Kirish</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center print:bg-white print:p-0">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #receipt-print-area, #receipt-print-area * {
            visibility: visible !important;
          }
          #receipt-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 10px !important;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-[385px] w-full flex items-center justify-between mb-4 no-print font-sans">
        <Link
          href="/payments"
          className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-800 shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Chop etish</span>
        </button>
      </div>

      {/* Verification Status Banner (hidden in print) */}
      <div className="max-w-[385px] w-full mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex items-center space-x-3 text-emerald-400 no-print font-sans">
        <ShieldCheck className="w-5 h-5 shrink-0" />
        <div className="text-[11px] leading-tight">
          <p className="font-bold">Rasmiy verified kvitansiya</p>
          <p className="text-[10px] text-emerald-500/80">INFAST IT Academy bazasidan tasdiqlangan</p>
        </div>
      </div>

      {/* Printable Authentic Receipt Card */}
      <ReceiptCard payment={payment} receiptId={id} />
    </div>
  );
}
