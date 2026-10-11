import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Branch } from '@/models/Branch';
import { generateNextStudentCode } from '@/lib/studentCode';
import { validateExcelRows, ExcelRowData, generateSampleExcelBuffer } from '@/lib/excel';

import { getSession } from '@/lib/auth';

export async function GET() {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Download sample excel template file
  const buffer = generateSampleExcelBuffer();
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Download Sample.xlsx"',
    },
  });
}

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'ADMIN') {
      return NextResponse.json(
        { error: "Super admin talabalarni import qila olmaydi. Bu harakat menejerga topshirilgan." },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const body = await request.json();
    const { action, rows, validRowsToImport } = body;

    if (action === 'validate') {
      if (!Array.isArray(rows)) {
        return NextResponse.json({ error: "Qatorlar formati noto'g'ri" }, { status: 400 });
      }

      const { results, validCount, invalidCount } = await validateExcelRows(rows);

      return NextResponse.json({
        success: true,
        results,
        summary: {
          totalRows: rows.length,
          validRows: validCount,
          invalidRows: invalidCount,
        },
      });
    }

    if (action === 'commit') {
      if (!Array.isArray(validRowsToImport) || validRowsToImport.length === 0) {
        return NextResponse.json({ error: "Import qilish uchun yaroqli qatorlar topilmadi" }, { status: 400 });
      }

      const insertedStudents = [];

      function parseDateSafely(val: any): Date | undefined {
        if (!val) return undefined;
        if (typeof val === 'string' && val.trim() === '') return undefined;
        const d = new Date(val);
        return isNaN(d.getTime()) ? undefined : d;
      }

      let defaultBranchId: any = session.branchId;
      if (!defaultBranchId) {
        const defaultBranch = await Branch.findOne({ status: 'active' });
        defaultBranchId = defaultBranch?._id;
      }

      for (const row of validRowsToImport) {
        let studentBranchId = defaultBranchId;
        if (row.groupId) {
          const group = await Group.findById(row.groupId);
          if (group?.branchId) {
            studentBranchId = group.branchId;
          }
        }

        const studentCode = await generateNextStudentCode();

        const newStudent = await Student.create({
          studentCode,
          firstName: row.data.firstName,
          lastName: row.data.lastName,
          phone: row.data.phone,
          parentPhone: row.data.parentPhone || undefined,
          birthDate: parseDateSafely(row.data.birthDate),
          courseId: row.courseId,
          groupId: row.groupId,
          branchId: studentBranchId,
          joinedDate: parseDateSafely(row.data.joinedDate) || new Date(),
          monthlyFee: row.data.monthlyFee ? Number(row.data.monthlyFee) : undefined,
          paymentDueDay: row.data.paymentDueDay ? Number(row.data.paymentDueDay) : 5,
          status: "ACTIVE",
        });

        insertedStudents.push(newStudent);
      }

      return NextResponse.json({
        success: true,
        message: `${insertedStudents.length} ta talaba muvaffaqiyatli import qilindi`,
        count: insertedStudents.length,
      });
    }

    return NextResponse.json({ error: "Noma'lum amal" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Import qilishda xatolik" }, { status: 500 });
  }
}
