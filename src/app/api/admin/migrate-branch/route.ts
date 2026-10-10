import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Branch } from '@/models/Branch';
import { Student } from '@/models/Student';
import { Group } from '@/models/Group';
import { Payment } from '@/models/Payment';
import { Attendance } from '@/models/Attendance';
import { Exam } from '@/models/Exam';
import { Lead } from '@/models/Lead';
import { MarketingCampaign } from '@/models/MarketingCampaign';
import { MarketingExpense } from '@/models/MarketingExpense';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Faqat Super Admin ma\'lumot ko\'chirish funksiyasidan foydalana oladi' }, { status: 403 });
    }

    await connectToDatabase();

    const branches = await Branch.find({}).sort({ createdAt: -1 });

    const branchSummaries = await Promise.all(
      branches.map(async (b) => {
        const filter = { branchId: b._id };
        const students = await Student.countDocuments(filter);
        const groups = await Group.countDocuments(filter);
        const payments = await Payment.countDocuments(filter);
        const attendance = await Attendance.countDocuments(filter);
        const exams = await Exam.countDocuments(filter);
        const leads = await Lead.countDocuments(filter);
        const campaigns = await MarketingCampaign.countDocuments(filter);
        const expenses = await MarketingExpense.countDocuments(filter);

        return {
          id: b._id.toString(),
          name: b.name,
          code: b.code,
          status: b.status,
          counts: {
            students,
            groups,
            payments,
            attendance,
            exams,
            leads,
            campaigns,
            expenses,
            total: students + groups + payments + attendance + exams + leads + campaigns + expenses,
          },
        };
      })
    );

    // Unassigned orphan records count
    const unassignedFilter = { $or: [{ branchId: null }, { branchId: { $exists: false } }] };
    const unassignedCounts = {
      students: await Student.countDocuments(unassignedFilter),
      groups: await Group.countDocuments(unassignedFilter),
      payments: await Payment.countDocuments(unassignedFilter),
      attendance: await Attendance.countDocuments(unassignedFilter),
      exams: await Exam.countDocuments(unassignedFilter),
      leads: await Lead.countDocuments(unassignedFilter),
      campaigns: await MarketingCampaign.countDocuments(unassignedFilter),
      expenses: await MarketingExpense.countDocuments(unassignedFilter),
    };
    const unassignedTotal =
      unassignedCounts.students +
      unassignedCounts.groups +
      unassignedCounts.payments +
      unassignedCounts.attendance +
      unassignedCounts.exams +
      unassignedCounts.leads +
      unassignedCounts.campaigns +
      unassignedCounts.expenses;

    return NextResponse.json({
      success: true,
      branches: branchSummaries,
      unassigned: {
        id: 'UNASSIGNED',
        name: 'Biriktirilmagan / Eski ma\'lumotlar',
        counts: { ...unassignedCounts, total: unassignedTotal },
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Faqat Super Admin ma\'lumot ko\'chirish funksiyasidan foydalana oladi' }, { status: 403 });
    }

    await connectToDatabase();
    const body = await req.json();

    const { sourceBranchId, targetBranchId, categories, dryRun = true } = body;

    if (!sourceBranchId || !targetBranchId) {
      return NextResponse.json({ error: 'Manba va Maqsad filiallari tanlanishi shart' }, { status: 400 });
    }

    if (sourceBranchId === targetBranchId) {
      return NextResponse.json({ error: 'Manba va maqsad filiali bir xil bo\'lishi mumkin emas' }, { status: 400 });
    }

    const targetBranch = await Branch.findById(targetBranchId);
    if (!targetBranch) {
      return NextResponse.json({ error: 'Maqsad filiali topilmadi' }, { status: 400 });
    }

    let sourceFilter: any = {};
    let sourceBranchName = 'Biriktirilmagan eski ma\'lumotlar';

    if (sourceBranchId === 'UNASSIGNED') {
      sourceFilter = { $or: [{ branchId: null }, { branchId: { $exists: false } }] };
    } else {
      const sourceBranch = await Branch.findById(sourceBranchId);
      if (!sourceBranch) {
        return NextResponse.json({ error: 'Manba filiali topilmadi' }, { status: 400 });
      }
      sourceBranchName = sourceBranch.name;
      sourceFilter = { branchId: sourceBranch._id };
    }

    const selectedCategories: string[] = Array.isArray(categories) && categories.length > 0
      ? categories
      : ['students', 'groups', 'payments', 'attendance', 'exams', 'leads', 'campaigns', 'expenses'];

    // 1. Dry Run / Pre-check stats calculation
    const sourceCounts: Record<string, number> = {};
    const warnings: string[] = [];

    if (selectedCategories.includes('students')) {
      sourceCounts.students = await Student.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('groups')) {
      sourceCounts.groups = await Group.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('payments')) {
      sourceCounts.payments = await Payment.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('attendance')) {
      sourceCounts.attendance = await Attendance.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('exams')) {
      sourceCounts.exams = await Exam.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('leads')) {
      sourceCounts.leads = await Lead.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('campaigns')) {
      sourceCounts.campaigns = await MarketingCampaign.countDocuments(sourceFilter);
    }
    if (selectedCategories.includes('expenses')) {
      sourceCounts.expenses = await MarketingExpense.countDocuments(sourceFilter);
    }

    // Check potential linkage warnings
    if (selectedCategories.includes('payments')) {
      const orphanPayments = await Payment.countDocuments({
        ...sourceFilter,
        studentId: { $exists: false },
      });
      if (orphanPayments > 0) {
        warnings.push(`${orphanPayments} ta to'lov hech qaysi o'quvchiga biriktirilmagan`);
      }
    }

    if (selectedCategories.includes('attendance')) {
      const orphanAttendance = await Attendance.countDocuments({
        ...sourceFilter,
        groupId: { $exists: false },
      });
      if (orphanAttendance > 0) {
        warnings.push(`${orphanAttendance} ta davomat yozuvi hech qaysi guruhga biriktirilmagan`);
      }
    }

    const totalSourceRecords = Object.values(sourceCounts).reduce((a, b) => a + b, 0);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        mode: 'DRY_RUN',
        sourceBranchName,
        targetBranchName: targetBranch.name,
        sourceCounts,
        totalSourceRecords,
        warnings,
        message: 'Oldindan tekshiruv (Dry-run) muvaffaqiyatli yakunlandi. Hech qanday ma\'lumot o\'zgartirilmadi.',
      });
    }

    // 2. Actual Execution Mode
    const migrationResults: Record<string, number> = {};

    if (selectedCategories.includes('students') && sourceCounts.students > 0) {
      const res = await Student.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.students = res.modifiedCount;
    }

    if (selectedCategories.includes('groups') && sourceCounts.groups > 0) {
      const res = await Group.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.groups = res.modifiedCount;
    }

    if (selectedCategories.includes('payments') && sourceCounts.payments > 0) {
      const res = await Payment.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.payments = res.modifiedCount;
    }

    if (selectedCategories.includes('attendance') && sourceCounts.attendance > 0) {
      const res = await Attendance.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.attendance = res.modifiedCount;
    }

    if (selectedCategories.includes('exams') && sourceCounts.exams > 0) {
      const res = await Exam.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.exams = res.modifiedCount;
    }

    if (selectedCategories.includes('leads') && sourceCounts.leads > 0) {
      const res = await Lead.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.leads = res.modifiedCount;
    }

    if (selectedCategories.includes('campaigns') && sourceCounts.campaigns > 0) {
      const res = await MarketingCampaign.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.campaigns = res.modifiedCount;
    }

    if (selectedCategories.includes('expenses') && sourceCounts.expenses > 0) {
      const res = await MarketingExpense.updateMany(sourceFilter, { $set: { branchId: targetBranch._id } });
      migrationResults.expenses = res.modifiedCount;
    }

    const totalMigrated = Object.values(migrationResults).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      mode: 'EXECUTION',
      sourceBranchName,
      targetBranchName: targetBranch.name,
      migrationResults,
      totalMigrated,
      warnings,
      message: `Jami ${totalMigrated} ta yozuv ${sourceBranchName} manbasidan ${targetBranch.name} filialiga muvaffaqiyatli ko'chirildi.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Migratsiyada xatolik yuz berdi' }, { status: 500 });
  }
}
