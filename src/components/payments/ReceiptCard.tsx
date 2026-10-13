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
  const branchPhone = branch.phone || '(90) 271-00-27';

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://infast.uz';
  const receiptUrl = `${origin}/receipt/${cleanId}`;
  const shortReceiptUrl = `infast.uz/receipt/${cleanId.slice(-8).toUpperCase()}`;

  // QR Code generator via local qrcode package
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (receiptUrl) {
      QRCode.toDataURL(receiptUrl, {
        width: 260,
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

  const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=1&data=${encodeURIComponent(receiptUrl)}`;
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
      className={`receipt-box w-full max-w-[320px] mx-auto bg-white text-black font-mono text-[10px] p-5 rounded-2xl shadow-xl border border-neutral-300 select-text leading-normal ${className}`}
      style={{
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: '"Courier New", Courier, monospace, system-ui',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. KORXONA SHAPKASI */}
      <div className="text-center pb-2.5" style={{ textAlign: 'center', paddingBottom: '10px' }}>
        <h2
          className="font-extrabold text-[15px] tracking-wider text-black uppercase"
          style={{ fontSize: '15px', fontWeight: 900, letterSpacing: '0.05em', color: '#000000', margin: 0 }}
        >
          {branchName.toUpperCase()}
        </h2>
        <p
          className="text-[9.5px] font-semibold text-neutral-800 mt-1"
          style={{ fontSize: '9.5px', fontWeight: 600, color: '#222222', marginTop: '4px' }}
        >
          IT & Kasbiy Ta'lim Markazi
        </p>
        <p
          className="text-[8.5px] text-neutral-600 mt-0.5"
          style={{ fontSize: '8.5px', color: '#555555', marginTop: '2px' }}
        >
          {branchAddress}
        </p>
        <p
          className="text-[8.5px] text-neutral-600 mt-0.5"
          style={{ fontSize: '8.5px', color: '#555555', marginTop: '2px' }}
        >
          STIR: 312956346 • Tel: {branchPhone}
        </p>
      </div>

      {/* AJRATUVCHI CHIZIQ */}
      <div
        className="my-2 border-b border-dashed border-neutral-400"
        style={{ borderBottom: '1px dashed #666666', margin: '8px 0' }}
      />

      {/* 2. CHEK SARIQLIGI VA HOLATI */}
      <div className="py-1 text-center" style={{ textAlign: 'center', padding: '4px 0' }}>
        <div
          className="font-bold text-[11px] text-black uppercase tracking-wider"
          style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}
        >
          TO'LOV CHEKI (KVITANSIYA)
        </div>
        <div
          className="text-[9px] text-black font-bold tracking-wide mt-1"
          style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '4px' }}
        >
          ✓ TO'LOV MUVAFFAQIYATLI QABUL QILINDI
        </div>
      </div>

      {/* AJRATUVCHI CHIZIQ */}
      <div
        className="my-2 border-b border-dashed border-neutral-400"
        style={{ borderBottom: '1px dashed #666666', margin: '8px 0' }}
      />

      {/* 3. REKVIZITLAR VA MA'LUMOTLAR (Bemalol, uzunroq qilib) */}
      <div className="py-2 space-y-2 text-[9.5px]" style={{ padding: '8px 0' }}>
        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>Chek №:</span>
          <span className="font-bold text-black" style={{ fontWeight: 'bold', color: '#000000' }}>{receiptNo}</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>Sana va vaqt:</span>
          <span className="font-semibold text-black" style={{ fontWeight: 600, color: '#000000' }}>{paymentDateFormatted}</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>Terminal / Kassa:</span>
          <span className="font-medium text-black" style={{ color: '#000000' }}>INF-POS-01</span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>Talaba:</span>
          <span className="font-bold text-black text-right max-w-[170px]" style={{ fontWeight: 'bold', textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {studentName}
          </span>
        </div>

        {studentCode ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="text-neutral-600" style={{ color: '#555555' }}>Talaba ID:</span>
            <span className="font-bold text-black text-right" style={{ fontWeight: 'bold', color: '#000000' }}>
              {studentCode}
            </span>
          </div>
        ) : null}

        {courseName ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="text-neutral-600" style={{ color: '#555555' }}>Kurs:</span>
            <span className="font-medium text-black text-right max-w-[170px]" style={{ textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
              {courseName}
            </span>
          </div>
        ) : null}

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>Guruh:</span>
          <span className="font-medium text-black text-right max-w-[170px]" style={{ textAlign: 'right', color: '#000000', maxWidth: '170px' }}>
            {groupName}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>To'lov davri:</span>
          <span className="font-semibold text-black text-right" style={{ fontWeight: 600, textAlign: 'right', color: '#000000' }}>
            {periodStartFormatted} — {periodEndFormatted}
          </span>
        </div>

        <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span className="text-neutral-600" style={{ color: '#555555' }}>To'lov turi:</span>
          <span className="font-bold text-black uppercase" style={{ fontWeight: 'bold', textTransform: 'uppercase', color: '#000000' }}>
            {getPaymentMethodName(payment.paymentMethod)}
          </span>
        </div>

        {payment.notes ? (
          <div className="flex justify-between items-start" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="text-neutral-600" style={{ color: '#555555' }}>Izoh:</span>
            <span className="font-normal text-neutral-800 text-right max-w-[170px]" style={{ textAlign: 'right', color: '#222222', maxWidth: '170px' }}>
              {payment.notes}
            </span>
          </div>
        ) : null}
      </div>

      {/* QALIN AJRATUVCHI CHIZIQ (JAMI OLDIDAN) */}
      <div
        className="my-2 border-b-2 border-black"
        style={{ borderBottom: '2px solid #000000', margin: '10px 0' }}
      />

      {/* 4. JAMI SUMMA */}
      <div className="py-2.5 text-center my-1" style={{ textAlign: 'center', padding: '10px 0', margin: '4px 0' }}>
        <div
          className="text-[9.5px] text-neutral-700 uppercase font-bold tracking-wider"
          style={{ fontSize: '9.5px', color: '#444444', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}
        >
          JAMI TO'LANDI:
        </div>
        <div
          className="text-[19px] font-black text-black tracking-tight mt-1"
          style={{ fontSize: '19px', fontWeight: 900, color: '#000000', letterSpacing: '-0.02em', marginTop: '4px' }}
        >
          {formatMoneyUz(payment.amount)}
        </div>
        <div
          className="text-[8px] text-neutral-500 mt-1"
          style={{ fontSize: '8px', color: '#777777', marginTop: '4px' }}
        >
          QQS (0%) • To'liq to'landi
        </div>
      </div>

      {/* AJRATUVCHI CHIZIQ */}
      <div
        className="my-2 border-b border-dashed border-neutral-400"
        style={{ borderBottom: '1px dashed #666666', margin: '8px 0' }}
      />

      {/* 5. QR-KOD VA ELEKTRON TEKSHIRUV (O'rtada, bemalol, qog'ozga to'liq sig'adigan) */}
      <div className="py-2.5 text-center" style={{ textAlign: 'center', padding: '10px 0' }}>
        <div
          className="font-bold text-[9px] uppercase tracking-wider text-black mb-2"
          style={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#000000', marginBottom: '8px' }}
        >
          ELEKTRON CHEKNI TEKSHIRISH
        </div>

        {/* QR Kod konteyneri — markazlashtirilgan, sig'adigan va aniq */}
        <div
          className="inline-block p-1 bg-white border border-neutral-300 rounded shadow-sm mx-auto"
          style={{
            display: 'inline-block',
            padding: '4px',
            backgroundColor: '#ffffff',
            border: '1px solid #cccccc',
            borderRadius: '4px',
            margin: '0 auto',
          }}
        >
          <img
            src={displayQr}
            alt="QR Kod"
            className="qr-img w-[110px] h-[110px] object-contain mx-auto block"
            style={{
              width: '110px',
              height: '110px',
              maxWidth: '110px',
              maxHeight: '110px',
              display: 'block',
              margin: '0 auto',
              imageRendering: 'pixelated',
            }}
          />
        </div>

        <p
          className="text-[8.5px] text-neutral-700 mt-2 leading-tight"
          style={{ fontSize: '8.5px', color: '#333333', marginTop: '8px', lineHeight: '1.3' }}
        >
          Chek haqiqiyligini tekshirish uchun<br />QR-kodni kamerangiz orqali skanerlang
        </p>

        <p
          className="text-[8px] text-neutral-500 font-sans mt-1"
          style={{ fontSize: '8px', color: '#666666', marginTop: '4px' }}
        >
          {shortReceiptUrl}
        </p>
      </div>

      {/* AJRATUVCHI CHIZIQ */}
      <div
        className="my-2 border-b border-dashed border-neutral-300"
        style={{ borderBottom: '1px dashed #888888', margin: '8px 0' }}
      />

      {/* 6. PASTKI TASHAKKUR VA KESISH JOVI (Printer kesishi uchun bemalol bo'sh joy) */}
      <div
        className="text-center pt-2 pb-6 space-y-1"
        style={{ textAlign: 'center', paddingTop: '8px', paddingBottom: '24px' }}
      >
        <p
          className="text-[9px] font-bold text-black uppercase"
          style={{ fontSize: '9px', fontWeight: 'bold', color: '#000000', textTransform: 'uppercase' }}
        >
          Tashakkur!
        </p>
        <p
          className="text-[8px] text-neutral-600"
          style={{ fontSize: '8px', color: '#555555' }}
        >
          INFAST ACADEMY ni tanlaganingiz uchun rahmat!
        </p>
        <p
          className="text-[8px] text-neutral-600"
          style={{ fontSize: '8px', color: '#555555' }}
        >
          Murojaat: +998 (90) 271-00-27
        </p>
        <p
          className="text-[8px] text-neutral-500 font-sans"
          style={{ fontSize: '8px', color: '#777777' }}
        >
          www.infast.uz
        </p>
      </div>
    </div>
  );
}
