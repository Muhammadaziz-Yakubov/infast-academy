import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { getSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

function generateRandom8Digit(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Query filter based on branch if manager
    const query: any = {};
    if (session.role === 'MANAGER' && session.branchId) {
      query.branchId = session.branchId;
    }

    const students = await Student.find(query).select('_id');
    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        count: 0,
        message: "O'quvchilar topilmadi",
      });
    }

    // Process in batches if necessary, bulk write for efficiency
    const bulkOps = await Promise.all(
      students.map(async (st) => {
        const plainPassword = generateRandom8Digit();
        const passwordHash = await bcrypt.hash(plainPassword, 10);
        return {
          updateOne: {
            filter: { _id: st._id },
            update: {
              $set: {
                plainPassword,
                passwordHash,
              },
            },
          },
        };
      })
    );

    const result = await Student.bulkWrite(bulkOps);

    return NextResponse.json({
      success: true,
      count: bulkOps.length,
      modifiedCount: result.modifiedCount,
      message: `Barcha ${bulkOps.length} ta o'quvchi uchun 8 xonali yangi parol muvaffaqiyatli generatsiya qilindi!`,
    });
  } catch (error: any) {
    console.error('Parol generatsiyasida xatolik:', error);
    return NextResponse.json(
      { error: "Parollarni generatsiya qilishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
