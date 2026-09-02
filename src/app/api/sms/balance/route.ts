import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDevSmsBalance } from '@/lib/devsms';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getDevSmsBalance();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Balansni olishda xatolik" }, { status: 500 });
  }
}
