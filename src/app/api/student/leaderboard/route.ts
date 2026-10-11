import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/models/Student';
import { StudentProgress } from '@/models/StudentProgress';
import { getStudentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const session = getStudentSession(authHeader);

    if (!session) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const scope = searchParams.get('scope') || 'course'; // 'course' or 'all'

    const query: Record<string, any> = {};
    if (scope === 'course' && session.courseId) {
      query.courseId = session.courseId;
    }

    const leaders = await StudentProgress.find(query)
      .populate({
        path: 'studentId',
        select: 'firstName lastName avatarUrl branchId status',
        populate: { path: 'branchId', select: 'name' },
      })
      .sort({ xp: -1, xcoin: -1 })
      .limit(50)
      .lean();

    const leaderboard = leaders
      .filter((entry: any) => entry.studentId && entry.studentId.status === 'ACTIVE')
      .map((entry: any, index: number) => ({
        rank: index + 1,
        studentId: entry.studentId._id,
        firstName: entry.studentId.firstName,
        lastName: entry.studentId.lastName,
        avatarUrl: entry.studentId.avatarUrl,
        branchName: entry.studentId.branchId?.name || 'InFast',
        xp: entry.xp || 0,
        xcoin: entry.xcoin || 0,
        level: entry.level || 1,
        isMe: entry.studentId._id.toString() === session.id,
      }));

    const myRankItem = leaderboard.find((item) => item.isMe);
    const myRank = myRankItem ? myRankItem.rank : (leaderboard.length + 1);

    return NextResponse.json({
      success: true,
      myRank,
      leaderboard,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Reytingni olishda xatolik" }, { status: 500 });
  }
}
