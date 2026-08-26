import mongoose from 'mongoose';
import { Student } from '../src/models/Student';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/infast-crm";

async function assignUniqueCodes() {
  console.log("🔄 Re-assigning unique Student Codes to all students...");
  await mongoose.connect(MONGODB_URI);

  const students = await Student.find({}).sort({ createdAt: 1 });
  console.log(`Found ${students.length} total students.`);

  // Generate a set of unique 4-digit codes starting from 1001 or random unique ranges
  // Let's use clean sequential & distinct 4-digit numbers starting at 1001: 1001, 1002, 1003... or distinct codes
  const usedCodes = new Set<string>();

  // Baseline start number
  let baseNumber = 1001;

  for (const s of students) {
    let code = `INF-${baseNumber}`;
    while (usedCodes.has(code)) {
      baseNumber++;
      code = `INF-${baseNumber}`;
    }

    s.studentCode = code;
    await s.save();
    usedCodes.add(code);
    console.log(`Assigned unique code ${code} to ${s.firstName} ${s.lastName}`);
    baseNumber++;
  }

  console.log(`✅ Successfully assigned distinct codes to all ${students.length} students!`);
  await mongoose.disconnect();
  process.exit(0);
}

assignUniqueCodes().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
