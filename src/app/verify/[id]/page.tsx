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
  Calendar,
  Clock,
  User,
  BookOpen,
  ArrowRight,
  Sparkles,
  ExternalLink,
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
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 dark:border-rose-900">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Sertifikat Topilmadi
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 mb-6">
            "<span className="font-mono font-bold text-slate-800 dark:text-slate-200">{certificateId}</span>" raqamli sertifikat InFast IT-Academy ma’lumotlar bazasida mavjud emas.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-infast-500 hover:bg-infast-600 text-white font-bold text-xs rounded-xl shadow-md shadow-infast-500/20 transition-colors"
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-xl mx-auto w-full">
        {/* Academy Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 mb-3">
            <div className="w-4 h-4 rounded-full bg-infast-500 flex items-center justify-center text-white text-[10px] font-black">
              ✓
            </div>
            <span className="text-[11px] font-bold text-infast-700 dark:text-infast-300 uppercase tracking-wider">
              Rasmiy Verifikatsiya Tizimi
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-950 dark:text-white tracking-tight uppercase">
            INFAST IT-ACADEMY
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            SERTIFIKATNI TEKSHIRISH VA TASDIQLASH
          </p>
        </div>

        {/* Status Verification Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Status Header Banner */}
          <div
            className={`p-6 text-center ${
              isRevoked
                ? 'bg-rose-500 text-white'
                : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white'
            }`}
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-2.5 shadow-inner">
              {isRevoked ? (
                <XCircle className="w-7 h-7 text-white" />
              ) : (
                <CheckCircle2 className="w-7 h-7 text-white" />
              )}
            </div>
            <h2 className="text-lg font-black tracking-wide uppercase">
              {isRevoked ? '✕ SERTIFIKAT BEKOR QILINGAN' : '✓ HAQIQIY SERTIFIKAT'}
            </h2>
            <p className="text-xs text-white/90 font-medium mt-0.5">
              {isRevoked
                ? 'Ushbu sertifikat administrator tomonidan bekor qilingan va haqiqiy emas.'
                : 'Ushbu sertifikat InFast IT-Academy tomonidan rasman tasdiqlangan.'}
            </p>
          </div>

          {/* Certificate Type Banner */}
          <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-infast-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAward ? 'Nominatsiya Sertifikati' : 'Asosiy Bitiruv Sertifikati'}
              </span>
            </div>
            <span className="font-mono text-xs font-black text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 rounded-lg">
              {certificateId}
            </span>
          </div>

          {/* Detailed Information Grid */}
          <div className="p-6 space-y-4">
            {/* Student Full Name */}
            <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                Bitiruvchi F.I.O.
              </span>
              <h3 className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tight">
                {graduate.fullName}
              </h3>
            </div>

            {/* If Nomination, display it prominently */}
            {graduate.nomination && (
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider">
                    Nominatsiya
                  </span>
                </div>
                <p className="text-base font-black text-slate-900 dark:text-white uppercase">
                  “{graduate.nomination}”
                </p>
              </div>
            )}

            {/* Key Data List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Yo‘nalish
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {graduate.track || 'Full-Stack Development'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Davomiyligi
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {graduate.duration || '15 oy'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Kurs Boshlanishi
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatUzbekDateDisplay(graduate.startDate)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Tugash / Bitiruv Sanasi
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatUzbekDateDisplay(graduate.endDate)}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  O‘quv Markaz Mentori
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {graduate.mentor || 'M. Yakubov'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold text-[10px] uppercase">
                  Berilgan Sana
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatUzbekDateDisplay(graduate.issuedDate || '02.10.2026')}
                </span>
              </div>
            </div>

            {/* Revocation notice if applicable */}
            {isRevoked && graduate.revokedReason && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs rounded-xl text-rose-800 dark:text-rose-200">
                <span className="font-bold block mb-0.5">Bekor qilinish sababi:</span>
                {graduate.revokedReason}
              </div>
            )}
          </div>

          {/* Footer Security Note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="flex items-center justify-center space-x-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Elektron muhr bilan himoyalangan va tasdiqlangan</span>
            </div>
          </div>
        </div>

        {/* Bottom Academy Info */}
        <div className="text-center text-xs text-slate-400 space-y-1">
          <p className="font-medium text-slate-500">
            InFast IT-Academy — Zamonaviy IT ta'lim maskani
          </p>
          <p className="text-[11px]">
            Sayt: <a href="https://infastacademy.uz" className="text-infast-600 hover:underline">infastacademy.uz</a> • Tel: +998 (90) 271-00-27
          </p>
        </div>
      </div>
    </div>
  );
}
