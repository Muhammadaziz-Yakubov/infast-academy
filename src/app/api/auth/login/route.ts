import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, createUserSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Login va parolni kiriting" }, { status: 400 });
    }

    let token: string | null = null;

    // Check env Admin credentials first
    if (verifyAdminCredentials(username, password)) {
      token = createAdminSession(username);
    } else {
      // Connect to DB and search for employee user
      await connectToDatabase();
      const user = await User.findOne({ username: username.trim(), active: { $ne: false } });
      
      if (!user) {
        return NextResponse.json({ error: "Login yoki parol noto'g'ri." }, { status: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Login yoki parol noto'g'ri." }, { status: 401 });
      }

      token = createUserSession({
        id: user._id.toString(),
        username: user.username,
        name: user.name,
        role: user.role || 'MANAGER',
        permissions: user.permissions || [],
      });
    }

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
