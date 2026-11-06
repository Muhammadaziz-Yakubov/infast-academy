import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

import { Student } from '../src/models/Student';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/infast-crm';

async function main() {
  const isApply = process.argv.includes('--apply');

  console.log(`[Migration] Connecting to MongoDB...`);
  await mongoose.connect(MONGODB_URI);
  console.log(`[Migration] Connected to database.`);

  const students = await Student.find({
    passwordHash: { $exists: true, $ne: null },
  }).select('_id studentCode phone firstName lastName passwordHash');

  console.log(`[Migration] Found ${students.length} students with stored passwordHash. Checking for weak passwords...`);

  const weakStudents: { id: string; studentCode: string; name: string }[] = [];

  for (const student of students) {
    if (!student.passwordHash) continue;

    const cleanPhoneDigits = (student.phone || '').replace(/\D/g, '');
    const phoneLast6 = cleanPhoneDigits.length >= 6 ? cleanPhoneDigits.slice(-6) : null;

    const weakCandidates: string[] = ['12345678', '123456'];
    if (student.studentCode) {
      weakCandidates.push(student.studentCode);
      weakCandidates.push(student.studentCode.toLowerCase());
      weakCandidates.push(student.studentCode.toUpperCase());
    }
    if (phoneLast6) {
      weakCandidates.push(phoneLast6);
    }

    let isWeak = false;
    for (const candidate of weakCandidates) {
      try {
        if (await bcrypt.compare(candidate, student.passwordHash)) {
          isWeak = true;
          break;
        }
      } catch {
        // Skip invalid hashes
      }
    }

    if (isWeak) {
      weakStudents.push({
        id: student._id.toString(),
        studentCode: student.studentCode || student._id.toString(),
        name: `${student.firstName} ${student.lastName}`,
      });
    }
  }

  if (weakStudents.length === 0) {
    console.log(`[Migration] No students with weak passwords found.`);
    await mongoose.disconnect();
    return;
  }

  console.log(`\n========================================`);
  if (!isApply) {
    console.log(`[DRY-RUN MODE] Weak password scan results:`);
    console.log(`Found ${weakStudents.length} student(s) with weak/default passwords:`);
    weakStudents.forEach((s, idx) => {
      console.log(`  ${idx + 1}. StudentCode: ${s.studentCode} (${s.name})`);
    });
    console.log(`\nNOTE: Passwords are NEVER displayed.`);
    console.log(`To unset passwordHash for these students, run with --apply:`);
    console.log(`  npx tsx scripts/reset-weak-student-passwords.ts --apply\n`);
  } else {
    console.log(`[APPLY MODE] Unsetting passwordHash for ${weakStudents.length} student(s)...`);
    let updatedCount = 0;
    for (const s of weakStudents) {
      await Student.updateOne(
        { _id: s.id },
        { $unset: { passwordHash: 1 } }
      );
      updatedCount++;
      console.log(`  Unset passwordHash for studentCode: ${s.studentCode} (${s.name})`);
    }
    console.log(`\nSuccessfully reset weak passwords for ${updatedCount} student(s).`);
  }
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[Migration Error]:', err);
  process.exit(1);
});
