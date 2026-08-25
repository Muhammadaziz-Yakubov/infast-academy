import * as XLSX from 'xlsx';
import { Course } from '@/models/Course';
import { Group } from '@/models/Group';
import { Student } from '@/models/Student';
import { connectToDatabase } from './mongodb';
import { calculateCourseMonth, calculatePaymentPeriods } from './calculations';

export interface ExcelRowData {
  firstName: string;
  lastName: string;
  phone: string;
  parentPhone?: string;
  birthDate?: string;
  course: string;
  group: string;
  joinedDate?: string;
  monthlyFee?: number;
  paymentDueDay?: number;
}

export interface ValidatedExcelRow {
  rowNumber: number;
  data: ExcelRowData;
  courseExists: boolean;
  groupExists: boolean;
  courseId?: string;
  groupId?: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Validates parsed Excel rows against actual MongoDB database records
 */
export async function validateExcelRows(rows: ExcelRowData[]): Promise<{
  results: ValidatedExcelRow[];
  validCount: number;
  invalidCount: number;
}> {
  await connectToDatabase();

  const courses = await Course.find({});
  const groups = await Group.find({});

  const courseMap = new Map(courses.map(c => [c.name.trim().toLowerCase(), c]));
  const groupMap = new Map(groups.map(g => [g.name.trim().toLowerCase(), g]));

  const results: ValidatedExcelRow[] = [];
  let validCount = 0;
  let invalidCount = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const courseNameClean = (row.course || '').trim().toLowerCase();
    const groupNameClean = (row.group || '').trim().toLowerCase();

    const matchedCourse = courseMap.get(courseNameClean);
    const matchedGroup = groupMap.get(groupNameClean);

    const courseExists = !!matchedCourse;
    const groupExists = !!matchedGroup;

    let isValid = courseExists && groupExists && !!row.firstName && !!row.lastName && !!row.phone;
    let errorMsgArr: string[] = [];

    if (!row.firstName || !row.lastName) {
      errorMsgArr.push("Talabaning ismi va familiyasi kiritilmagan");
    }
    if (!row.phone) {
      errorMsgArr.push("Telefon raqami kiritilmagan");
    }
    if (!courseExists) {
      errorMsgArr.push(`Student: ${row.firstName || ''} ${row.lastName || ''}\nCourse: ${row.course || ''}\nKurs topilmadi. Iltimos, kurs nomini tekshiring.`);
    }
    if (!groupExists) {
      errorMsgArr.push(`Student: ${row.firstName || ''} ${row.lastName || ''}\nGroup: ${row.group || ''}\nGuruh topilmadi. Iltimos, guruh nomini tekshiring.`);
    }

    if (isValid) {
      validCount++;
    } else {
      invalidCount++;
    }

    results.push({
      rowNumber: i + 2, // Excel 1-indexed header is row 1
      data: row,
      courseExists,
      groupExists,
      courseId: matchedCourse?._id.toString(),
      groupId: matchedGroup?._id.toString(),
      isValid,
      errorMessage: errorMsgArr.join(' | '),
    });
  }

  return { results, validCount, invalidCount };
}

/**
 * Generates sample Excel binary buffer for downloading template
 */
export function generateSampleExcelBuffer(): Buffer {
  const sampleData = [
    {
      "Ism": "Ali",
      "Familiya": "Valiyev",
      "Telefon": "+998901234567",
      "Ota-ona telefoni": "+998909876543",
      "Tug'ilgan sana": "2002-05-15",
      "Kurs": "Frontend React",
      "Guruh": "Frontend 01",
      "Qo'shilgan sana": "2025-09-05",
      "Oylik to'lov": 800000,
      "To'lov kuni": 5
    },
    {
      "Ism": "Sardor",
      "Familiya": "Aliyev",
      "Telefon": "+998912345678",
      "Ota-ona telefoni": "+998918765432",
      "Tug'ilgan sana": "2003-08-20",
      "Kurs": "Backend Node.js",
      "Guruh": "Backend 01",
      "Qo'shilgan sana": "2025-10-10",
      "Oylik to'lov": 900000,
      "To'lov kuni": 10
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Namuna");

  const buf = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buf;
}

/**
 * Generates export Excel for students list
 */
export function generateStudentsExportBuffer(students: any[]): Buffer {
  const exportRows = students.map((s) => {
    const monthInfo = calculateCourseMonth(s.joinedDate);
    const fee = s.monthlyFee || s.courseId?.price || 0;
    const paymentInfo = calculatePaymentPeriods(s.joinedDate, fee, s.paymentDueDay || 5, s.totalPaid || 0);

    return {
      "Ism Familiya": `${s.firstName} ${s.lastName}`,
      "Telefon": s.phone,
      "Ota-ona telefoni": s.parentPhone || "-",
      "Kurs": s.courseId?.name || "-",
      "Guruh": s.groupId?.name || "-",
      "Joriy Oy": monthInfo.label,
      "Oylik To'lov": fee,
      "To'lov Holati": paymentInfo.paymentStatus === 'PAID' ? "To'langan" : paymentInfo.paymentStatus === 'OVERDUE' ? "Qarzdor" : "Kutilmoqda",
      "Qarzdorlik Summasi": paymentInfo.totalDebt,
      "Holati": s.status === 'ACTIVE' ? "Faol" : s.status === 'PAUSED' ? "Muzlatilgan" : s.status === 'LEFT' ? "Tark etgan" : "Tugatgan",
      "Qo'shilgan Sana": new Date(s.joinedDate).toLocaleDateString('uz-UZ'),
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Talabalar");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}
