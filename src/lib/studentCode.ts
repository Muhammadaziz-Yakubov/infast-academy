import { Student } from '@/models/Student';
import { connectToDatabase } from '@/lib/mongodb';

/**
 * Generates the next sequential student code (e.g. INF-1001, INF-1002, ...)
 */
export async function generateNextStudentCode(): Promise<string> {
  await connectToDatabase();

  // Find all students that have studentCode set
  const studentsWithCode = await Student.find(
    { studentCode: { $exists: true, $ne: null } },
    { studentCode: 1 }
  ).lean();

  let maxNum = 1000; // Default baseline so first code is INF-1001

  for (const s of studentsWithCode) {
    if (s.studentCode) {
      // Matches INF-1001 or INF1001 or pure numbers 1001
      const match = s.studentCode.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  const nextNum = maxNum + 1;
  return `INF-${nextNum}`;
}
