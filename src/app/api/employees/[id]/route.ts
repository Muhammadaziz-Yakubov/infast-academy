import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, errorResponse } = requireAdminSession('employees');
    if (errorResponse) return errorResponse;

    const { id } = params;
    const body = await request.json();
    const { name, username, password, permissions } = body;

    await connectToDatabase();

    const employee = await User.findById(id);
    if (!employee) {
      return NextResponse.json({ error: "Xodim topilmadi" }, { status: 404 });
    }

    if (username && username.trim() !== employee.username) {
      const existingUser = await User.findOne({ username: username.trim(), _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json({ error: "Bunday loginli foydalanuvchi mavjud" }, { status: 400 });
      }
      employee.username = username.trim();
    }

    if (name) employee.name = name.trim();
    if (Array.isArray(permissions)) employee.permissions = permissions;
    
    // Only update password if provided
    if (password && password.trim().length > 0) {
      employee.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    await employee.save();

    const updatedObj = employee.toObject();
    const { passwordHash: _, ...userWithoutPassword } = updatedObj;

    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xodimni yangilashda xatolik" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { session, errorResponse } = requireAdminSession('employees');
    if (errorResponse) return errorResponse;

    const { id } = params;

    await connectToDatabase();

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ error: "Xodim topilmadi" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Xodim o'chirildi" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Xodimni o'chirishda xatolik" }, { status: 500 });
  }
}
