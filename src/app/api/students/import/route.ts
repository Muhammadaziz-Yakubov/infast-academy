import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { validateExcelRows, ExcelRowData, generateSampleExcelBuffer } from '@/lib/excel';

export async function GET() {
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

      for (const row of validRowsToImport) {
        const newStudent = await Student.create({
          firstName: row.data.firstName,
          lastName: row.data.lastName,
          phone: row.data.phone,
          parentPhone: row.data.parentPhone || undefined,
          birthDate: row.data.birthDate ? new Date(row.data.birthDate) : undefined,
          courseId: row.courseId,
          groupId: row.groupId,
          joinedDate: row.data.joinedDate ? new Date(row.data.joinedDate) : new Date(),
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
