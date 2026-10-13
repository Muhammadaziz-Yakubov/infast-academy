'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { formatMoneyUz, formatDateUz, formatDateTimeUz } from '@/lib/utils';

interface ReceiptCardProps {
  payment: any;
  receiptId?: string;
  className?: string;
}

export function ReceiptCard({ payment, receiptId, className = '' }: ReceiptCardProps) {
  if (!payment) return null;

  const rawId = payment._id || payment.id || receiptId || '';
  const cleanId = typeof rawId === 'string' ? rawId : String(rawId);
  const receiptNo = `INF-${cleanId.slice(-8).toUpperCase()}`;

  const student = payment.studentId || {};
  const studentName = student.firstName && student.lastName
    ? `${student.firstName} ${student.lastName}`
    : student.name || 'Talaba';

  const studentCode = student.studentCode || '';
  const groupName = student.groupId?.name || payment.groupName || '-';
  const courseName = student.courseId?.name || payment.courseName || '';

  const branch = payment.branchId || {};
  const branchName = branch.name || 'INFAST ACADEMY';
  const branchAddress = branch.address || "Farg'ona sh., Al-Farg'oniy k.";
  const branchPhone = branch.phone || '+998 (90) 271-00-27';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${cleanId}`;
  const shortReceiptUrl = `infast.uz/receipt/${cleanId.slice(-8).toUpperCase()}`;

  // QR Code generator via local qrcode package
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (receiptUrl) {
      QRCode.toDataURL(receiptUrl, {
        width: 280,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      })
        .then((url) => {
          if (isMounted) setQrDataUrl(url);
        })
        .catch((err) => {
          console.error('QR code generation error:', err);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [receiptUrl]);

  const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=1&data=${encodeURIComponent(receiptUrl)}`;
  const displayQr = qrDataUrl || fallbackQr;

  const paymentDateFormatted = formatDateTimeUz(payment.paymentDate || payment.createdAt);
  const periodStartFormatted = formatDateUz(payment.periodStartDate);
  const periodEndFormatted = formatDateUz(payment.periodEndDate);

  // To'lov usuli matni
  const getPaymentMethodName = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'CASH':
        return 'NAQD PUL';
      case 'CARD':
        return 'PLASTIK KARTA';
      case 'CLICK':
        return 'CLICK';
      case 'PAYME':
        return 'PAYME';
      case 'UZUM':
        return 'UZUM';
      case 'OTHER':
        return 'BOSHQA';
      default:
        return method ? method.toUpperCase() : 'NAQD PUL';
    }
  };

  return (
    <div
      id="receipt-print-area"
      className={`receipt-box w-full max-w-[330px] mx-auto bg-white text-black font-sans text-[11px] p-5 rounded-2xl shadow-xl border-2 border-neutral-300 select-text leading-normal ${className}`}
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. KORXONA SHAPKASI */}
      <div className="text-center pb-2.5" style={{ textAlign: 'center', paddingBottom: '10px' }}>
        <h2
          className="font-black text-[16px] tracking-wider text-black uppercase"
          style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '0.05em', color: '#000000', margin: 0 }}
        >
          {branchName.toUpperCase()}
        </h2>
        <p
          className="text-[11px] font-bold text-black mt-1"
          style={{ fontSize: '11px', fontWeight: 700, color: '#000000', marginTop: '4px' }}
        >
          IT & Kasbiy Ta'lim Markazi
        </p>
        <p
          className="text-[10px] font-semibold text-black mt-0.5"
          style={{ fontSize: '10px', fontWeight: 600, color: '#000000', marginTop: '2px' }}
        >
          {branchAddress}
        </p>
        <p
          className="text-[10px] font-bold text-black mt-0.5"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000', marginTop: '2px' }}
        >
          STIR: 312956346 • Tel: {branchPhone}
        </p>
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-dashed border-black"
        style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }}
      />

      {/* 2. CHEK SARIQLIGI VA HOLATI */}
      <div className="py-1 text-center" style={{ textAlign: 'center', padding: '4px 0' }}>
        <div
          className="font-black text-[13px] text-black uppercase tracking-wider"
          style={{ fontSize: '13px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000000' }}
        >
          TO'LOV KVITANSIYASI
        </div>
        <div
          className="text-[11px] text-black font-extrabold tracking-wide mt-1"
          style={{ fontSize: '11px', fontWeight: 800, marginTop: '4px', color: '#000000' }}
        >
          ✓ TO'LOV QABUL QILINDI
        </div>
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-dashed border-black"
        style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }}
      />

      {/* 3. REKVIZITLAR VA MA'LUMOTLAR (Katta va qalin shriftlar) */}
      <div className="py-2 space-y-2 text-[11px]" style={{ padding: '8px 0' }}>
        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Chek №:</span>
          <span className="font-black text-black" style={{ fontWeight: 900, color: '#000000' }}>{receiptNo}</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Sana va vaqt:</span>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>{paymentDateFormatted}</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Terminal:</span>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>INF-POS-01</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Talaba:</span>
          <span className="font-black text-black text-right max-w-[170px]" style={{ fontWeight: 900, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {studentName}
          </span>
        </div>

        {studentCode ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Talaba ID:</span>
            <span className="font-black text-black text-right" style={{ fontWeight: 900, color: '#000000' }}>
              {studentCode}
            </span>
          </div>
        ) : null}

        {courseName ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Kurs:</span>
            <span className="font-bold text-black text-right max-w-[170px]" style={{ fontWeight: 700, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
              {courseName}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Guruh:</span>
          <span className="font-bold text-black text-right max-w-[170px]" style={{ fontWeight: 700, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {groupName}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>To'lov davri:</span>
          <span className="font-bold text-black text-right" style={{ fontWeight: 700, textAlign: 'right', color: '#000000' }}>
            {periodStartFormatted} — {periodEndFormatted}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>To'lov turi:</span>
          <span className="font-black text-black uppercase" style={{ fontWeight: 900, textTransform: 'uppercase', color: '#000000' }}>
            {getPaymentMethodName(payment.paymentMethod)}
          </span>
        </div>

        {payment.notes ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
            <span className="font-bold text-black" style={{ fontWeight: 700, color: '#000000' }}>Izoh:</span>
            <span className="font-semibold text-black text-right max-w-[170px]" style={{ fontWeight: 600, textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
              {payment.notes}
            </span>
          </div>
        ) : null}
      </div>

      {/* QALIN 2PX AJRATUVCHI CHIZIQ (JAMI OLDIDAN) */}
      <div
        className="my-2.5 border-b-2 border-black"
        style={{ borderBottom: '2.5px solid #000000', margin: '10px 0' }}
      />

      {/* 4. JAMI SUMMA (Katta va judayam qalin) */}
      <div className="py-2.5 text-center my-1" style={{ textAlign: 'center', padding: '10px 0', margin: '4px 0' }}>
        <div
          className="text-[12px] text-black uppercase font-black tracking-wider"
          style={{ fontSize: '12px', color: '#000000', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.05em' }}
        >
          JAMI TO'LANDI:
        </div>
        <div
          className="text-[22px] font-black text-black tracking-tight mt-1"
          style={{ fontSize: '22px', fontWeight: 900, color: '#000000', letterSpacing: '-0.02em', marginTop: '4px' }}
        >
          {formatMoneyUz(payment.amount)}
        </div>
        <div
          className="text-[10px] text-black font-bold mt-1"
          style={{ fontSize: '10px', color: '#000000', fontWeight: 700, marginTop: '4px' }}
        >
          QQS (0%) • TO'LIQ TO'LANDI
        </div>
      </div>

      {/* QALIN 2PX AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-black"
        style={{ borderBottom: '2.5px solid #000000', margin: '10px 0' }}
      />

      {/* 5. QR-KOD VA ELEKTRON TEKSHIRUV (O'rtada, bemalol, to'liq sig'adigan) */}
      <div className="py-2.5 text-center" style={{ textAlign: 'center', padding: '10px 0' }}>
        <div
          className="font-black text-[11px] uppercase tracking-wider text-black mb-2"
          style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000000', marginBottom: '8px' }}
        >
          ELEKTRON CHEKNI TEKSHIRISH
        </div>

        {/* QR Kod konteyneri — markazlashtirilgan, sig'adigan va aniq */}
        <div
          className="inline-block p-1.5 bg-white border-2 border-black rounded shadow-sm mx-auto"
          style={{
            display: 'inline-block',
            padding: '4px',
            backgroundColor: '#ffffff',
            border: '2px solid #000000',
            borderRadius: '4px',
            margin: '0 auto',
          }}
        >
          <img
            src={displayQr}
            alt="QR Kod"
            className="qr-img w-[115px] h-[115px] object-contain mx-auto block"
            style={{
              width: '115px',
              height: '115px',
              maxWidth: '115px',
              maxHeight: '115px',
              display: 'block',
              margin: '0 auto',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <p
          className="text-[10.5px] text-black font-bold mt-2.5 leading-snug"
          style={{ fontSize: '10.5px', color: '#000000', fontWeight: 700, marginTop: '8px', lineHeight: '1.35' }}
        >
          Chek haqiqiyligini tekshirish uchun<br />QR-kodni kamerangiz orqali skanerlang
        </p>

        <p
          className="text-[10px] text-black font-bold font-mono mt-1"
          style={{ fontSize: '10px', color: '#000000', fontWeight: 700, marginTop: '4px' }}
        >
          {shortReceiptUrl}
        </p>
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ */}
      <div
        className="my-2.5 border-b-2 border-dashed border-black"
        style={{ borderBottom: '1.5px dashed #000000', margin: '10px 0' }}
      />

      {/* 6. PASTKI TASHAKKUR VA KESISH JOVI (Printer kesishi uchun bemalol bo'sh joy) */}
      <div
        className="text-center pt-2 pb-6 space-y-1.5"
        style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '24px' }}
      >
        <p
          className="text-[12px] font-black text-black uppercase"
          style={{ fontSize: '12px', fontWeight: 900, color: '#000000', textTransform: 'uppercase' }}
        >
          TASHAKKUR!
        </p>
        <p
          className="text-[10px] font-bold text-black"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}
        >
          INFAST ACADEMY ni tanlaganingiz uchun rahmat!
        </p>
        <p
          className="text-[10px] font-bold text-black"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}
        >
          Murojaat uchun: +998 (90) 271-00-27
        </p>
        <p
          className="text-[10px] font-bold text-black"
          style={{ fontSize: '10px', fontWeight: 700, color: '#000000' }}
        >
          www.infast.uz
        </p>
      </div>
    </div>
  );
}
