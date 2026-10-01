'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { InfastSeal } from './InfastSeal';
import { formatUzbekDateDisplay } from '@/lib/certificateUtils';
import { CertificateData } from './MainCertificate';

interface AwardCertificateProps {
  data: CertificateData & { nomination?: string };
  id?: string;
  origin?: string;
}

export function AwardCertificate({
  data,
  id = 'award-certificate-print',
  origin,
}: AwardCertificateProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const awardNumber = data.awardId || data.certificateId.replace('GRAD', 'AWARD');
  const siteOrigin =
    origin || (typeof window !== 'undefined' ? window.location.origin : 'https://infastacademy.uz');
  const verifyUrl = `${siteOrigin}/verify/${awardNumber}`;

  useEffect(() => {
    QRCode.toDataURL(
      verifyUrl,
      {
        width: 240,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrCodeDataUrl(url);
        } else {
          setQrCodeDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              verifyUrl
            )}`
          );
        }
      }
    );
  }, [verifyUrl]);

  return (
    <div className="w-full overflow-x-auto flex justify-center py-4 bg-slate-100/60 dark:bg-slate-950/40 rounded-2xl p-2 print:p-0 print:bg-white">
      <div
        id={id}
        className="relative bg-white text-slate-900 select-none shadow-2xl print:shadow-none mx-auto overflow-hidden print:m-0"
        style={{
          width: '1123px',
          height: '794px',
          minWidth: '1123px',
          minHeight: '794px',
          maxWidth: '1123px',
          maxHeight: '794px',
          boxSizing: 'border-box',
          fontFamily: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Status watermark if revoked */}
        {data.status === 'revoked' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[1px]">
            <div className="transform -rotate-12 border-8 border-rose-600/80 text-rose-600/90 text-6xl font-black uppercase px-16 py-6 tracking-widest rounded-2xl bg-white/95 shadow-2xl">
              BEKOR QILINGAN
            </div>
          </div>
        )}

        {/* Outer Premium Minimalist Double Border with Golden/Amber Highlights */}
        <div className="absolute inset-[16px] border border-amber-200 pointer-events-none" />
        <div className="absolute inset-[20px] border-2 border-slate-900 pointer-events-none" />
        <div className="absolute inset-[24px] border border-amber-500/50 pointer-events-none" />

        {/* Corner Geometric Accents */}
        <div className="absolute top-[20px] left-[20px] w-12 h-12 border-t-4 border-l-4 border-amber-500 pointer-events-none" />
        <div className="absolute top-[20px] right-[20px] w-12 h-12 border-t-4 border-r-4 border-amber-500 pointer-events-none" />
        <div className="absolute bottom-[20px] left-[20px] w-12 h-12 border-b-4 border-l-4 border-amber-500 pointer-events-none" />
        <div className="absolute bottom-[20px] right-[20px] w-12 h-12 border-b-4 border-r-4 border-amber-500 pointer-events-none" />

        {/* Subtle Background Monogram */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none">
          <span className="text-[240px] font-black tracking-tighter text-amber-900 select-none">
            AWARD
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="relative h-full flex flex-col justify-between px-16 py-11 text-center">
          {/* 1. Header Section */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-black shadow-md shadow-amber-500/20">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase">
                    INFAST IT-ACADEMY
                  </h2>
                  <p className="text-[9px] tracking-widest text-amber-600 font-bold uppercase">
                    HONOR & EXCELLENCE AWARD
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  AWARD ID: <span className="text-slate-900 font-extrabold">{awardNumber}</span>
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="mt-6 space-y-1">
              <p className="text-[11px] font-bold tracking-[0.35em] text-amber-600 uppercase">
                MAXSUS E’TIROF VA YUTUQ
              </p>
              <h1 className="text-4xl font-extrabold tracking-[0.16em] text-slate-900 uppercase">
                NOMINATSIYA SERTIFIKATI
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-amber-500 via-infast-500 to-amber-600 mx-auto rounded-full mt-2" />
            </div>
          </div>

          {/* 2. Middle Body Section */}
          <div className="space-y-4 my-auto py-2">
            <p className="text-sm font-medium text-slate-500 italic tracking-wide">
              Ushbu sertifikat
            </p>

            {/* Graduate Name */}
            <div className="py-1">
              <div className="inline-block relative">
                <h2 className="text-3xl sm:text-[34px] font-black text-slate-950 tracking-wide uppercase px-8 pb-2 border-b-2 border-slate-900">
                  {data.fullName}
                </h2>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-500 tracking-wide">
              ga
            </p>

            {/* Nomination Title Badge */}
            <div className="py-2">
              <div className="inline-block bg-gradient-to-r from-amber-500/10 via-infast-500/15 to-amber-500/10 border-2 border-amber-500/40 px-10 py-3 rounded-2xl shadow-sm">
                <span className="text-xs uppercase tracking-widest text-amber-700 font-bold block mb-1">
                  YIL NOMINATSIYASI
                </span>
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-wider uppercase">
                  “{data.nomination || 'BEST FULL-STACK DEVELOPER'}”
                </span>
              </div>
            </div>

            <p className="text-base text-slate-800 max-w-2xl mx-auto leading-relaxed font-normal">
              nominatsiyasi bilan o‘qish davomida ko‘rsatgan yuqori natijalari va professional mahorati uchun taqdirlandi.
            </p>
          </div>

          {/* 3. Footer Section (Signatures, Official Seal, QR Verification) */}
          <div className="pt-2">
            <div className="grid grid-cols-3 items-end gap-4">
              {/* Left: Mentor Signature */}
              <div className="text-center space-y-1">
                <div className="h-14 flex items-end justify-center pb-1">
                  <svg className="w-36 h-10 text-slate-800 opacity-90" viewBox="0 0 160 50" fill="none">
                    <path
                      d="M10 35 C 30 10, 45 45, 65 20 C 85 -5, 100 40, 120 15 C 135 25, 150 10, 155 30"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M30 38 Q 70 30 140 38"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="w-44 h-px bg-slate-400 mx-auto" />
                <p className="text-xs font-black text-slate-900 tracking-tight">
                  {data.mentor || 'M. Yakubov'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  O‘quv markaz mentori
                </p>
              </div>

              {/* Center: Official Seal & QR Code */}
              <div className="flex items-center justify-center space-x-4">
                <div className="transform scale-95 transition-transform hover:scale-100">
                  <InfastSeal size={96} variant="gold" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-1 bg-white border border-amber-200 rounded-lg shadow-sm">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Verification QR"
                        className="w-[72px] h-[72px] object-contain"
                      />
                    ) : (
                      <div className="w-[72px] h-[72px] bg-slate-100 animate-pulse rounded" />
                    )}
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                    Skaner qiling
                  </span>
                </div>
              </div>

              {/* Right: Director Signature */}
              <div className="text-center space-y-1">
                <div className="h-14 flex items-end justify-center pb-1">
                  <svg className="w-36 h-10 text-slate-800 opacity-90" viewBox="0 0 160 50" fill="none">
                    <path
                      d="M15 25 C 35 45, 55 5, 80 35 C 105 10, 125 45, 145 20 C 150 15, 155 35, 158 28"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M25 40 Q 80 34 148 40"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="w-44 h-px bg-slate-400 mx-auto" />
                <p className="text-xs font-black text-slate-900 tracking-tight">
                  {data.director || 'N. Yakubova'}
                </p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  InFast IT-Academy direktori
                </p>
              </div>
            </div>

            {/* Bottom Verification Text */}
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-3 border-t border-slate-100 mt-2">
              <span>Berilgan sana: {formatUzbekDateDisplay(data.issuedDate || '02.10.2026')}</span>
              <span className="font-mono">Rasmiy tekshirish manzili: infastacademy.uz/verify/{awardNumber}</span>
              <span>InFast Academy © 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AwardCertificate;
