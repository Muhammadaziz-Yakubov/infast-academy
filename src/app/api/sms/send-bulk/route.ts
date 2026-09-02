import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { SmsLog } from '@/models/SmsLog';
import { calculatePaymentPeriods } from '@/lib/calculations';
import { getSession } from '@/lib/auth';
import { sendDevSms, formatDebtMoneyForSms } from '@/lib/devsms';

export async function POST(request: Request) {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await request.json();
    const { studentIds, customTemplate } = body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "Kamida bitta talabani tanlang" }, { status: 400 });
    }

    // Fetch students with populating course
    const rawStudents = await Student.find({ _id: { $in: studentIds } }).populate('courseId', 'price');
    if (rawStudents.length === 0) {
      return NextResponse.json({ error: "Tanlangan talabalar topilmadi" }, { status: 404 });
    }

    // Fetch all payments for selected students
    const payments = await Payment.find({ studentId: { $in: studentIds } });
    const paidMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      paidMap.set(sId, (paidMap.get(sId) || 0) + p.amount);
    });

    const defaultTemplate = "Hurmatli {familiya} {ism}! Sizning qarzingiz {summa} so'm. To'lov qiling bo'lmasa darsga kiritilmaysiz. InFast IT-Academy";
    const templateToUse = (customTemplate && customTemplate.trim()) ? customTemplate.trim() : defaultTemplate;

    const results: any[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const student of rawStudents) {
      const fee = student.monthlyFee || (student.courseId as any)?.price || 0;
      const totalPaid = paidMap.get(student._id.toString()) || 0;
      const paymentInfo = calculatePaymentPeriods(student.joinedDate, fee, student.paymentDueDay || 5, totalPaid);
      const debtAmount = paymentInfo.totalDebt || 0;
      const formattedDebt = formatDebtMoneyForSms(debtAmount);

      // Build student-specific message
      let message = templateToUse
        .replace(/{familiya}/gi, student.lastName || '')
        .replace(/{ism}/gi, student.firstName || '')
        .replace(/{lastName}/g, student.lastName || '')
        .replace(/{firstName}/g, student.firstName || '')
        .replace(/{summa}/gi, formattedDebt)
        .replace(/{qarz}/gi, formattedDebt)
        .replace(/{debt}/gi, formattedDebt);

      // Send SMS via DevSMS API
      const smsRes = await sendDevSms(student.phone, message);

      const isSuccess = smsRes.success;
      if (isSuccess) {
        successCount++;
      } else {
        failedCount++;
      }

      // Log in MongoDB SmsLog
      const smsLog = await SmsLog.create({
        studentId: student._id,
        studentName: `${student.lastName} ${student.firstName}`,
        phone: student.phone,
        message,
        status: isSuccess ? 'SENT' : 'FAILED',
        devsmsId: smsRes.data?.sms_id || smsRes.data?.request_id,
        totalCost: smsRes.data?.total_cost || 0,
        errorDetails: smsRes.error || (!isSuccess ? (smsRes.message || "SMS yuborilmadi") : undefined),
      });

      results.push({
        studentId: student._id,
        studentName: `${student.lastName} ${student.firstName}`,
        phone: student.phone,
        debtAmount,
        formattedDebt,
        message,
        success: isSuccess,
        error: smsRes.error || (isSuccess ? null : smsRes.message),
        logId: smsLog._id,
      });
    }

    return NextResponse.json({
      success: true,
      totalSent: successCount,
      totalFailed: failedCount,
      totalCount: results.length,
      details: results,
      message: `${successCount} ta SMS muvaffaqiyatli yuborildi${failedCount > 0 ? `, ${failedCount} ta SMS yuborishda xatolik` : ''}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "SMS yuborishda xatolik yuz berdi" }, { status: 500 });
  }
}
