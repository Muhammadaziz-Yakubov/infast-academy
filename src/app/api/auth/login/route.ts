import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Login va parolni kiriting" }, { status: 400 });
    }

    const isValid = verifyAdminCredentials(username, password);

    if (!isValid) {
      return NextResponse.json({ error: "Login yoki parol noto'g'ri." }, { status: 401 });
    }

    const token = createAdminSession(username);

    const response = NextResponse.json({ success: true, message: "Muvaffaqiyatli tizimga kirildi" });
    
    // Set HTTP-Only Cookie
    response.cookies.set({
      name: 'infast_session',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Tizim xatoligi" }, { status: 500 });
  }
}
