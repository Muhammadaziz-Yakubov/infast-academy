import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const { session, errorResponse } = requireAdminSession('employees');
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const employees = await User.find({}).select('-passwordHash').sort({ createdAt: -1 });

    return NextResponse.json(employees);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xodimlarni yuklashda xatolik' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { session, errorResponse } = requireAdminSession('employees');
    if (errorResponse) return errorResponse;

    const body = await request.json();
    const { name, username, password, permissions } = body;

    if (!name || !username || !password) {
      return NextResponse.json({ error: 'Ism, Login va Parol kiritilishi shart' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ username: username.trim() });
    if (existingUser) {
      return NextResponse.json({ error: 'Bunday loginli foydalanuvchi allaqachon mavjud' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newEmployee = await User.create({
      name: name.trim(),
      username: username.trim(),
      passwordHash,
      role: 'MANAGER', // Always Manager role as requested
      permissions: Array.isArray(permissions) ? permissions : [],
      active: true,
    });

    const userObj = newEmployee.toObject();
    const { passwordHash: _, ...userWithoutPassword } = userObj;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xodimni yaratishda xatolik' }, { status: 500 });
  }
}
