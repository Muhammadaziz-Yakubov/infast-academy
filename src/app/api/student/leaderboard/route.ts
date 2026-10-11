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

    const currentStudent = await Student.findById(session.id)
      .select('branchId groupId courseId status')
      .lean();

    if (!currentStudent) {
      return NextResponse.json({ error: "O'quvchi topilmadi" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    // Scopes: 'group' (Mening guruhim), 'branch' (Mening filialim), 'all' (Hamma filiallar)
    const scope = searchParams.get('scope') || 'group';

    // 1. Fetch matching active students according to requested scope
    const studentQuery: Record<string, any> = {
      status: { $in: ['ACTIVE', 'COMPLETED'] },
    };

    if (scope === 'group' && currentStudent.groupId) {
      studentQuery.groupId = currentStudent.groupId;
    } else if (scope === 'branch' && currentStudent.branchId) {
      studentQuery.branchId = currentStudent.branchId;
    }
    // scope === 'all' includes all branches

    const matchingStudents = await Student.find(studentQuery)
      .select('firstName lastName avatarUrl branchId groupId')
      .populate('branchId', 'name')
      .populate('groupId', 'name')
      .lean();

    const studentIds = matchingStudents.map((s: any) => s._id);

    // 2. Fetch progress records for these students
    const progressList = await StudentProgress.find({
      studentId: { $in: studentIds },
    })
      .select('studentId xp xcoin level')
      .lean();

    const progressMap = new Map<string, { xp: number; xcoin: number; level: number }>();
    progressList.forEach((p: any) => {
      progressMap.set(p.studentId.toString(), {
        xp: p.xp || 0,
        xcoin: p.xcoin || 0,
        level: p.level || 1,
      });
    });

    // 3. Assemble all matching students (every enrolled student in group/branch/all)
    const assembledList = matchingStudents.map((student: any) => {
      const prog = progressMap.get(student._id.toString()) || { xp: 0, xcoin: 0, level: 1 };
      const isCurrentStudent = student._id.toString() === session.id;

      return {
        _id: student._id.toString(),
        studentId: student._id.toString(),
        firstName: student.firstName,
        lastName: student.lastName,
        avatarUrl: student.avatarUrl || null,
        branchName: student.branchId?.name || 'InFast IT-Academy',
        groupName: student.groupId?.name || 'Guruh',
        xp: prog.xp,
        xcoin: prog.xcoin,
        level: prog.level,
        isCurrentStudent,
      };
    });

    // 4. Sort descending by XP, then xcoin
    assembledList.sort((a, b) => {
      if (b.xp !== a.xp) return b.xp - a.xp;
      return b.xcoin - a.xcoin;
    });

    // 5. Assign 1-indexed ranks
    const leaderboard = assembledList.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

    const myRankItem = leaderboard.find((item) => item.isCurrentStudent);
    const myRank = myRankItem ? myRankItem.rank : 1;

    return NextResponse.json({
      success: true,
      scope,
      totalStudents: leaderboard.length,
      myRank,
      leaderboard,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Reytingni olishda xatolik" },
      { status: 500 }
    );
  }
}
