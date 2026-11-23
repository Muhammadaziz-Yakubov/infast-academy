'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function TavsiyaRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/marketing/formalar');
  }, [router]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
      <Loader2 className="w-8 h-8 text-infast-500 animate-spin" />
      <p className="text-xs font-semibold text-slate-500">Formalar bo'limiga yo'naltirilmoqda...</p>
    </div>
  );
}
