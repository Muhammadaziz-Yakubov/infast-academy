import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { LandingPage } from '@/models/LandingPage';
import { Lead } from '@/models/Lead';
import { Student } from '@/models/Student';
import { Payment } from '@/models/Payment';
import { getSession, requireAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const landings = await LandingPage.find({})
      .populate('campaignId', 'name')
      .populate('courseId', 'name price')
      .sort({ createdAt: -1 });

    const landingIds = landings.map((l) => l._id);
    const [leads, students] = await Promise.all([
      Lead.find({ landingPageId: { $in: landingIds } }),
      Student.find({}),
    ]);

    const studentIds = students.map((s) => s._id);
    const payments = await Payment.find({ studentId: { $in: studentIds } });

    const studentRevenueMap = new Map<string, number>();
    payments.forEach((p) => {
      const sId = p.studentId.toString();
      studentRevenueMap.set(sId, (studentRevenueMap.get(sId) || 0) + (p.amount || 0));
    });

    const landingList = landings.map((l) => {
      const lIdStr = l._id.toString();

      const landingLeads = leads.filter((ld) => ld.landingPageId && ld.landingPageId.toString() === lIdStr);
      const leadsCount = landingLeads.length;

      const convertedStudents = landingLeads
        .filter((ld) => ld.convertedStudentId)
        .map((ld) => ld.convertedStudentId?.toString());

      const studentsCount = convertedStudents.length;

      let revenue = 0;
      convertedStudents.forEach((sId) => {
        if (sId) revenue += studentRevenueMap.get(sId) || 0;
      });

      const conversion = l.visitorsCount > 0 ? Math.round((leadsCount / l.visitorsCount) * 1000) / 10 : 0;

      return {
        ...l.toObject(),
        leadsCount,
        studentsCount,
        revenue,
        conversion,
      };
    });

    return NextResponse.json({ success: true, landings: landingList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Xatolik yuz berdi' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, errorResponse } = requireAdminSession();
    if (errorResponse) return errorResponse;

    await connectToDatabase();
    const body = await req.json();

    const { name, slug, url, campaignId, courseId, status } = body;

    if (!name || !slug || !url) {
      return NextResponse.json({ error: "Nomi, slug va URL majburiy" }, { status: 400 });
    }

    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9\-]/g, '');
    const existing = await LandingPage.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json({ error: "Bunday slug'li landing sahifa mavjud" }, { status: 400 });
    }

    const landing = await LandingPage.create({
      name: name.trim(),
      slug: cleanSlug,
      url: url.trim(),
      campaignId: campaignId || undefined,
      courseId: courseId || undefined,
      status: status || 'FAOL',
    });

    return NextResponse.json({ success: true, landing }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Landing sahifa yaratishda xatolik' }, { status: 500 });
  }
}
