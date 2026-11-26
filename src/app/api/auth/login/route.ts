import { NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, createUserSession, createStudentSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Student } from '@/models/Student';
import { Branch } from '@/models/Branch';
import { getClientIp, checkRateLimit } from '@/lib/rateLimit';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Login va parolni kiriting" }, { status: 400 });
    }

    const rawUsername = username.toString().trim();
    const cleanUsername = rawUsername.toLowerCase();
    const clientIp = getClientIp(request);

    // Rate limiting: 10 attempts / 15 min per IP+username
    const limitCheck = await checkRateLimit(`login:${clientIp}:${cleanUsername}`, 10, 15 * 60 * 1000);
    if (!limitCheck.success && limitCheck.response) {
      return limitCheck.response;
    }

    // 1. Check Super Admin env credentials first
    if (verifyAdminCredentials(rawUsername, password)) {
      const token = createAdminSession(rawUsername);
      const response = NextResponse.json({
        success: true,
        role: 'ADMIN',
        redirectUrl: '/dashboard',
        message: "Muvaffaqiyatli tizimga kirildi",
      });
      response.cookies.set({
        name: 'infast_session',
        value: token,
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    await connectToDatabase();

    // 2. Check Employee / Manager / Teacher User model
    const user = await User.findOne({ username: rawUsername, active: { $ne: false } });
    if (user && user.passwordHash) {
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (isPasswordValid) {
        let branchIdStr = user.branchId ? user.branchId.toString() : undefined;

        if (user.role === 'MANAGER' && !branchIdStr) {
          const assignedBranch = await Branch.findOne({ managerId: user._id });
          if (assignedBranch) {
            branchIdStr = assignedBranch._id.toString();
            user.branchId = assignedBranch._id;
            await User.updateOne({ _id: user._id }, { $set: { branchId: assignedBranch._id } });
          }
        }

        const defaultManagerPermissions = [
          'dashboard',
          'students',
          'groups',
          'attendance',
          'payments',
          'exams',
          'courses',
          'reports',
          'notifications',
          'marketing',
          'branches',
        ];

        const userPermissions =
          user.permissions && user.permissions.length > 0
            ? user.permissions
            : user.role === 'MANAGER'
            ? defaultManagerPermissions
            : ['*'];

        const token = createUserSession({
          id: user._id.toString(),
          username: user.username,
          name: user.name,
          role: user.role || 'MANAGER',
          branchId: branchIdStr,
          permissions: userPermissions,
        });

        const response = NextResponse.json({
          success: true,
          role: user.role || 'MANAGER',
          redirectUrl: '/dashboard',
          message: "Muvaffaqiyatli tizimga kirildi",
        });

        response.cookies.set({
          name: 'infast_session',
          value: token,
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7,
        });

        return response;
      }
    }

    // 3. Check Student model (by phone, phone with +, or studentCode)
    const cleanIdentifier = rawUsername.replace(/\s+/g, '');
    const cleanDigits = cleanIdentifier.replace(/\D/g, '');

    const student = await Student.findOne({
      $or: [
        { phone: cleanIdentifier },
        ...(cleanDigits ? [{ phone: cleanDigits }, { phone: `+${cleanDigits}` }] : []),
        { studentCode: cleanIdentifier.toUpperCase() },
      ],
      status: { $in: ['ACTIVE', 'PAUSED', 'QARZDOR', 'BLOCKED', 'BLOCK'] },
    })
      .populate('courseId', 'name price')
      .populate('groupId', 'name schedules')
      .populate('branchId', 'name code address phone');

    if (student && student.passwordHash) {
      const isStudentPasswordValid = await bcrypt.compare(password, student.passwordHash);
      if (isStudentPasswordValid) {
        const studentToken = createStudentSession({
          id: student._id.toString(),
          phone: student.phone,
          firstName: student.firstName,
          lastName: student.lastName,
          courseId: (student.courseId as any)?._id?.toString() || (student.courseId as any)?.toString(),
          groupId: (student.groupId as any)?._id?.toString() || (student.groupId as any)?.toString(),
          branchId: (student.branchId as any)?._id?.toString() || (student.branchId as any)?.toString(),
          role: 'STUDENT',
        });

        const response = NextResponse.json({
          success: true,
          role: 'STUDENT',
          redirectUrl: '/student',
          token: studentToken,
          student: {
            id: student._id.toString(),
            studentCode: student.studentCode,
            firstName: student.firstName,
            lastName: student.lastName,
            phone: student.phone,
            avatarUrl: student.avatarUrl,
            courseName: (student.courseId as any)?.name || 'IT Kursi',
            groupName: (student.groupId as any)?.name || 'Guruh',
          },
          message: "Muvaffaqiyatli tizimga kirildi",
        });

        // Set student session cookie for browser web portal access
        response.cookies.set({
          name: 'infast_student_session',
          value: studentToken,
          httpOnly: true,
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        return response;
      }
    }

    return NextResponse.json({ error: "Login yoki parol noto'g'ri." }, { status: 401 });
  } catch (error: any) {
    console.error("Unified login error:", error);
    return NextResponse.json({ error: "Xatolik yuz berdi" }, { status: 500 });
  }
}
