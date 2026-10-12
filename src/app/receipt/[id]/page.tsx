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
    const el = document.getElementById('receipt-print-area');
    if (!el) {
      window.print();
      return;
    }

    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) {
      window.print();
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Chek</title>
          <style>
            @page {
              size: 58mm auto;
              margin: 0mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              width: 58mm;
              margin: 0 auto;
              padding: 2mm 1mm;
              background: #ffffff;
              color: #000000;
              font-family: monospace;
              font-size: 10px;
              line-height: 1.25;
            }
            .receipt-box {
              width: 100% !important;
              max-width: 56mm !important;
              margin: 0 auto !important;
              padding: 0 !important;
              border: none !important;
              box-shadow: none !important;
            }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .font-extrabold { font-weight: 800; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .items-start { align-items: flex-start; }
            .items-center { align-items: center; }
            .border-b { border-bottom: 1px dashed #000; }
            .border-b-2 { border-bottom: 2px solid #000; }
            .border-t { border-top: 1px dashed #999; }
            .py-1 { padding-top: 3px; padding-bottom: 3px; }
            .py-1\\.5 { padding-top: 4px; padding-bottom: 4px; }
            .pb-1\\.5 { padding-bottom: 4px; }
            .pt-1\\.5 { padding-top: 4px; }
            .my-0\\.5 { margin-top: 2px; margin-bottom: 2px; }
            .mt-1\\.5 { margin-top: 4px; }
            .space-y-1 > * + * { margin-top: 3px; }
            .space-y-0\\.5 > * + * { margin-top: 1px; }
            .text-black { color: #000; }
            .text-neutral-800, .text-neutral-700, .text-neutral-600 { color: #222; }
            .text-\\[13px\\] { font-size: 13px; }
            .text-\\[10px\\] { font-size: 10px; }
            .text-\\[9px\\] { font-size: 9px; }
            .text-\\[8px\\] { font-size: 8px; }
            .text-\\[7\\.5px\\] { font-size: 7.5px; }
            .text-\\[17px\\] { font-size: 17px; }
            img { max-width: 100%; height: auto; }
            .w-11 { width: 44px; }
            .h-11 { height: 44px; }
          </style>
        </head>
        <body>
          ${el.outerHTML}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
              setTimeout(function() { window.close(); }, 800);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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
          @page {
            size: 58mm auto;
            margin: 0mm;
          }
          html, body {
            width: 58mm !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
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
            width: 54mm !important;
            max-width: 54mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            box-shadow: none !important;
            border: none !important;
            background: #ffffff !important;
            color: #000000 !important;
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
