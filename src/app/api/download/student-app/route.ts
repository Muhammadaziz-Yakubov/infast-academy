import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'student-app', 'assets', 'student-1.0.apk'),
      path.join(process.cwd(), 'infast-academy', 'student-app', 'assets', 'student-1.0.apk'),
      path.join(process.cwd(), 'public', 'downloads', 'student-1.0.apk'),
      path.join(process.cwd(), 'public', 'student-1.0.apk'),
    ];

    let foundPath: string | null = null;
    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      // Fallback response if user hasn't copied the file yet
      return new NextResponse(
        JSON.stringify({
          error: "Fayl hali yuklanmagan",
          message: "student-1.0.apk fayli student-app/assets/ papkasiga joylashtirilgach yuklab olish mumkin bo'ladi.",
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const stat = fs.statSync(foundPath);
    const fileStream = fs.createReadStream(foundPath);

    return new NextResponse(fileStream as any, {
      headers: {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Disposition': 'attachment; filename="student-1.0.apk"',
        'Content-Length': stat.size.toString(),
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Yuklab olishda xatolik yuz berdi" }, { status: 500 });
  }
}
