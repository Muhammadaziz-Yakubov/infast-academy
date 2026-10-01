'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { InfastSeal } from './InfastSeal';
import { formatUzbekDateDisplay } from '@/lib/certificateUtils';

export interface CertificateData {
  _id?: string;
  graduateId: string;
  certificateId: string;
  awardId?: string;
  fullName: string;
  track?: string;
  courseName?: string;
  duration?: string;
  startDate?: string;
  endDate?: string;
  mentor?: string;
  director?: string;
  issuedDate?: string;
  status?: 'active' | 'revoked';
}

interface MainCertificateProps {
  data: CertificateData;
  id?: string;
  origin?: string;
}

export function MainCertificate({ data, id = 'main-certificate-print', origin }: MainCertificateProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const siteOrigin =
    origin || (typeof window !== 'undefined' ? window.location.origin : 'https://infastacademy.uz');
  const verifyUrl = `${siteOrigin}/verify/${data.certificateId}`;

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
          // Fallback to online QR service
          setQrCodeDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
              verifyUrl
            )}`
          );
        }
      }
    );
  }, [verifyUrl]);

  const startDateFormatted = formatUzbekDateDisplay(data.startDate || '01.07.2025');
  const endDateFormatted = formatUzbekDateDisplay(data.endDate || '02.10.2026');

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

        {/* Outer Premium Minimalist Double Border */}
        <div className="absolute inset-[16px] border border-slate-200 pointer-events-none" />
        <div className="absolute inset-[20px] border-2 border-slate-900 pointer-events-none" />
        <div className="absolute inset-[24px] border border-infast-500/40 pointer-events-none" />

        {/* Corner Geometric Accents */}
        <div className="absolute top-[20px] left-[20px] w-12 h-12 border-t-4 border-l-4 border-infast-500 pointer-events-none" />
        <div className="absolute top-[20px] right-[20px] w-12 h-12 border-t-4 border-r-4 border-infast-500 pointer-events-none" />
        <div className="absolute bottom-[20px] left-[20px] w-12 h-12 border-b-4 border-l-4 border-infast-500 pointer-events-none" />
        <div className="absolute bottom-[20px] right-[20px] w-12 h-12 border-b-4 border-r-4 border-infast-500 pointer-events-none" />

        {/* Subtle Background Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none">
          <span className="text-[260px] font-black tracking-tighter text-slate-900 select-none">
            INFAST
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="relative h-full flex flex-col justify-between px-16 py-11 text-center">
          {/* 1. Header Section */}
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5 text-left">
                <div className="w-8 h-8 rounded-lg bg-infast-500 flex items-center justify-center text-white font-black shadow-md shadow-infast-500/20">
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase">
                    INFAST IT-ACADEMY
                  </h2>
                  <p className="text-[9px] tracking-widest text-infast-600 font-bold uppercase">
                    ACADEMY OF MODERN TECHNOLOGIES
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  ID: <span className="text-slate-900 font-extrabold">{data.certificateId}</span>
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="mt-6 space-y-1">
              <p className="text-[11px] font-bold tracking-[0.35em] text-infast-600 uppercase">
                RASMIY BITIRUV HUJJATI
              </p>
              <h1 className="text-4xl font-extrabold tracking-[0.2em] text-slate-900 uppercase">
                SERTIFIKAT
              </h1>
              <div className="w-24 h-1 bg-gradient-to-r from-infast-500 via-amber-500 to-infast-600 mx-auto rounded-full mt-2" />
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

            {/* Certificate Statement */}
            <p className="text-base text-slate-800 max-w-2xl mx-auto leading-relaxed font-normal">
              <span className="font-bold text-slate-950">{data.duration || '15 oy'}lik</span>{' '}
              <span className="font-bold text-infast-600">{data.track || 'Full-Stack Development'}</span>{' '}
              ta’lim dasturini muvaffaqiyatli tamomlaganligi munosabati bilan berildi.
            </p>

            {/* Course Meta Pills */}
            <div className="inline-flex items-center justify-center gap-8 pt-3 pb-1 border-y border-slate-100 px-8">
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                  Yo‘nalish
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {data.track || 'FULL-STACK DEVELOPMENT'}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                  Davomiyligi
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {data.duration || '15 OY'}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-200" />
              <div>
                <span className="block text-[9px] uppercase tracking-widest text-slate-400 font-bold">
                  Kurs davri
                </span>
                <span className="text-xs font-black text-slate-900 uppercase">
                  {startDateFormatted} — {endDateFormatted}
                </span>
              </div>
            </div>
          </div>

          {/* 3. Footer Section (Signatures, Official Seal, QR Verification) */}
          <div className="pt-2">
            <div className="grid grid-cols-3 items-end gap-4">
              {/* Left: Mentor Signature */}
              <div className="text-center space-y-1">
                <div className="h-14 flex items-end justify-center pb-1">
                  {/* Stylized Digital Signature Graphic */}
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
                  <InfastSeal size={96} variant="orange" />
                </div>
                <div className="flex flex-col items-center">
                  <div className="p-1 bg-white border border-slate-300 rounded-lg shadow-sm">
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
                  {/* Stylized Digital Signature Graphic */}
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
              <span className="font-mono">Rasmiy tekshirish manzili: infastacademy.uz/verify/{data.certificateId}</span>
              <span>InFast Academy © 2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainCertificate;
