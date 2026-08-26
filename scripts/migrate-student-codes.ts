import mongoose from 'mongoose';
import { Student } from '../src/models/Student';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/infast-crm";

async function migrateStudentCodes() {
  console.log("🔄 Student Code (INF-1001) Migration Started...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const studentsWithoutCode = await Student.find({
    $or: [{ studentCode: { $exists: false } }, { studentCode: null }, { studentCode: '' }],
  }).sort({ createdAt: 1 });

  console.log(`Found ${studentsWithoutCode.length} students without Student Code.`);

  if (studentsWithoutCode.length === 0) {
    console.log("✅ All students already have Student Codes!");
    await mongoose.disconnect();
    process.exit(0);
  }

  // Find max existing number
  const existingStudents = await Student.find({ studentCode: { $exists: true, $ne: null } });
  let maxNum = 1000;
  for (const s of existingStudents) {
    if (s.studentCode) {
      const match = s.studentCode.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    }
  }

  let count = 0;
  for (const s of studentsWithoutCode) {
    maxNum++;
    const code = `INF-${maxNum}`;
    s.studentCode = code;
    await s.save();
    console.log(`Assigned ${code} to ${s.firstName} ${s.lastName}`);
    count++;
  }

  console.log(`🎉 Successfully assigned Student Codes to ${count} students!`);
  await mongoose.disconnect();
  process.exit(0);
}

migrateStudentCodes().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
