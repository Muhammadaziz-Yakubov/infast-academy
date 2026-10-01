import React from 'react';
import { Metadata } from 'next';
import { connectToDatabase } from '@/lib/mongodb';
import { Graduate } from '@/models/Graduate';
import { formatUzbekDateDisplay } from '@/lib/certificateUtils';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Award,
  Sparkles,
  ExternalLink,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Sertifikatni Tekshirish | InFast IT-Academy',
  description: 'InFast IT-Academy rasmiy sertifikat tekshirish sahifasi.',
  robots: {
    index: false,
    follow: false,
  },
};

interface VerifyPageProps {
  params: {
    id: string;
  };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  await connectToDatabase();
  const certificateId = params.id?.trim() || '';

  const graduate = await Graduate.findOne({
    $or: [
      { certificateId: certificateId },
      { awardId: certificateId },
      { graduateId: certificateId },
    ],
  }).lean();

  if (!graduate) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-[420px] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-[32px] p-8 text-center shadow-2xl shadow-black/5">
          <div className="w-14 h-14 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900/50">
            <XCircle className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white">
            Sertifikat Topilmadi
          </h1>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-2 mb-6 leading-relaxed">
            «<span className="font-mono font-semibold text-slate-900 dark:text-zinc-200">{certificateId}</span>» raqamli sertifikat InFast IT-Academy ma’lumotlar bazasida mavjud emas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center w-full py-3 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-semibold text-xs rounded-full transition-all active:scale-[0.98]"
          >
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    );
  }

  const isAward = graduate.awardId === certificateId;
  const isRevoked = graduate.status === 'revoked';

  return (
    <div className="min-h-screen bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-zinc-100 flex flex-col justify-between py-12 px-4 sm:px-6 font-sans antialiased">
      <div className="max-w-[480px] mx-auto w-full">
        {/* Apple-style Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-black dark:bg-white text-white dark:text-black font-black text-xs shadow-md mb-3">
            IF
          </div>
          <h1 className="text-xs font-semibold tracking-[0.2em] text-slate-500 dark:text-zinc-400 uppercase">
            INFAST IT-ACADEMY
          </h1>
          <p className="text-lg font-bold text-slate-950 dark:text-white tracking-tight mt-0.5">
            Sertifikat Tekshiruvi
          </p>
        </div>

        {/* Apple-style Main Card */}
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.08] rounded-[32px] shadow-2xl shadow-black/5 overflow-hidden">
          {/* Status Capsule Indicator */}
          <div className="p-6 text-center border-b border-black/[0.04] dark:border-white/[0.06]">
            {isRevoked ? (
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-bold">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>SERTIFIKAT BEKOR QILINGAN</span>
              </div>
            ) : (
              <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>HAQIQIY VA TASDIQLANGAN</span>
              </div>
            )}

            {/* Certificate ID Pill */}
            <div className="mt-3">
              <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-400 dark:text-zinc-500 bg-slate-100 dark:bg-zinc-800/80 px-3 py-1 rounded-full">
                {certificateId}
              </span>
            </div>
          </div>

          {/* Student & Course Details */}
          <div className="p-6 space-y-5">
            {/* Student Name */}
            <div className="text-center pb-2 border-b border-black/[0.04] dark:border-white/[0.06]">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
                Bitiruvchi
              </span>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
                {graduate.fullName}
              </h2>
              <p className="text-xs font-medium text-infast-600 mt-1">
                {graduate.track || 'Full-Stack Development'}
              </p>
            </div>

            {/* Nomination Badge if exists */}
            {graduate.nomination && (
              <div className="p-4 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-2xl text-center">
                <div className="flex items-center justify-center space-x-1 text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Nominatsiya</span>
                </div>
                <p className="text-sm font-bold text-slate-950 dark:text-white">
                  “{graduate.nomination}”
                </p>
              </div>
            )}

            {/* Key Metadata Rows (Apple Settings style) */}
            <div className="bg-[#F5F5F7] dark:bg-zinc-800/50 rounded-2xl divide-y divide-black/[0.04] dark:divide-white/[0.06] text-xs">
              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Yo‘nalish</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {graduate.track}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Davomiyligi</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {graduate.duration}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">O‘quv davri</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {formatUzbekDateDisplay(graduate.startDate)} — {formatUzbekDateDisplay(graduate.endDate)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Mentor</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {graduate.mentor}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5">
                <span className="text-slate-500 dark:text-zinc-400 font-medium">Berilgan sana</span>
                <span className="font-semibold text-slate-900 dark:text-white text-right">
                  {formatUzbekDateDisplay(graduate.issuedDate || '02.10.2026')}
                </span>
              </div>
            </div>

            {/* Revocation explanation if applicable */}
            {isRevoked && graduate.revokedReason && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/80 rounded-2xl text-xs text-rose-800 dark:text-rose-300">
                <span className="font-bold block mb-0.5">Bekor qilinish sababi:</span>
                {graduate.revokedReason}
              </div>
            )}
          </div>

          {/* Footer Security Badge */}
          <div className="px-6 py-4 bg-[#FAFAFA] dark:bg-zinc-950/40 border-t border-black/[0.04] dark:border-white/[0.06] text-center">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] font-medium text-slate-400 dark:text-zinc-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>InFast IT-Academy rasmiy tizimi orqali tekshirildi</span>
            </div>
          </div>
        </div>

        {/* Bottom Footer Link */}
        <div className="text-center mt-6 text-xs text-slate-400 dark:text-zinc-600">
          <p>© 2026 InFast IT-Academy. Barcha huquqlar himoyalangan.</p>
        </div>
      </div>
    </div>
  );
}
