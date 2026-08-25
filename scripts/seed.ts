import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { Course } from "../src/models/Course";
import { Group } from "../src/models/Group";
import { Student } from "../src/models/Student";
import { Payment } from "../src/models/Payment";
import { Attendance } from "../src/models/Attendance";
import { Exam } from "../src/models/Exam";
import { ExamResult } from "../src/models/ExamResult";
import { Notification } from "../src/models/Notification";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/infast-crm";

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  // Clear existing collections
  await Course.deleteMany({});
  await Group.deleteMany({});
  await Student.deleteMany({});
  await Payment.deleteMany({});
  await Attendance.deleteMany({});
  await Exam.deleteMany({});
  await ExamResult.deleteMany({});
  await Notification.deleteMany({});

  console.log("Cleared old database records.");

  // 1. Create Courses
  const frontendCourse = await Course.create({
    name: "Frontend React",
    price: 800000,
    durationMonths: 6,
    description: "HTML, CSS, JavaScript, React.js, Next.js, Tailwind CSS va TypeScript kursi",
    status: "ACTIVE",
  });

  const backendCourse = await Course.create({
    name: "Backend Node.js",
    price: 900000,
    durationMonths: 6,
    description: "Node.js, Express, MongoDB, REST API va Microservices kursi",
    status: "ACTIVE",
  });

  const pythonCourse = await Course.create({
    name: "Python Data Science",
    price: 850000,
    durationMonths: 7,
    description: "Python, Django, Pandas, NumPy, Machine Learning asoslari",
    status: "ACTIVE",
  });

  console.log("Created Courses.");

  // 2. Create Groups
  const groupFrontend1 = await Group.create({
    name: "Frontend 01",
    courseId: frontendCourse._id,
    room: "Xona 101",
    telegramChatId: "-1001234567890",
    status: "ACTIVE",
    schedules: [
      { dayOfWeek: "Dushanba", startTime: "14:00", endTime: "15:30" },
      { dayOfWeek: "Chorshanba", startTime: "14:00", endTime: "15:30" },
      { dayOfWeek: "Juma", startTime: "14:00", endTime: "15:30" },
    ],
  });

  const groupBackend1 = await Group.create({
    name: "Backend 01",
    courseId: backendCourse._id,
    room: "Xona 102",
    telegramChatId: "-1009876543210",
    status: "ACTIVE",
    schedules: [
      { dayOfWeek: "Seshanba", startTime: "10:30", endTime: "12:00" },
      { dayOfWeek: "Payshanba", startTime: "10:30", endTime: "12:00" },
      { dayOfWeek: "Shanba", startTime: "10:30", endTime: "12:00" },
    ],
  });

  console.log("Created Groups & Schedules.");

  // 4. Create Students (with joinedDate in 2025 and 2026 to test automatic course month calculation)
  const student1 = await Student.create({
    firstName: "Sardor",
    lastName: "Aliyev",
    phone: "+998901234567",
    parentPhone: "+998909876543",
    birthDate: new Date("2003-05-15"),
    courseId: frontendCourse._id,
    groupId: groupFrontend1._id,
    joinedDate: new Date("2025-09-05"), // Elapsed ~12 months => 12-oy
    monthlyFee: 800000,
    paymentDueDay: 5,
    status: "ACTIVE",
  });

  const student2 = await Student.create({
    firstName: "Aziz",
    lastName: "Karimov",
    phone: "+998912345678",
    parentPhone: "+998918765432",
    birthDate: new Date("2004-02-10"),
    courseId: frontendCourse._id,
    groupId: groupFrontend1._id,
    joinedDate: new Date("2026-03-01"), // Elapsed ~6 months => 6-oy
    monthlyFee: 800000,
    paymentDueDay: 1,
    status: "ACTIVE",
  });

  const student3 = await Student.create({
    firstName: "Madina",
    lastName: "Umarova",
    phone: "+998933334455",
    parentPhone: "+998934445566",
    birthDate: new Date("2002-11-25"),
    courseId: backendCourse._id,
    groupId: groupBackend1._id,
    joinedDate: new Date("2026-01-10"),
    monthlyFee: 900000,
    paymentDueDay: 10,
    status: "ACTIVE",
  });

  const student4 = await Student.create({
    firstName: "Shahzod",
    lastName: "Ismoilov",
    phone: "+998977778899",
    parentPhone: "+998978889900",
    birthDate: new Date("2001-07-08"),
    courseId: backendCourse._id,
    groupId: groupBackend1._id,
    joinedDate: new Date("2026-04-15"),
    monthlyFee: 900000,
    paymentDueDay: 15,
    status: "ACTIVE",
  });

  console.log("Created Students.");

  // 5. Create Payments
  await Payment.create({
    studentId: student1._id,
    amount: 800000,
    paymentDate: new Date("2025-09-05"),
    periodStartDate: new Date("2025-09-05"),
    periodEndDate: new Date("2025-10-05"),
    paymentMethod: "CLICK",
    notes: "1-oy to'lovi",
  });

  await Payment.create({
    studentId: student2._id,
    amount: 1600000, // Paid 2 months in advance
    paymentDate: new Date("2026-03-01"),
    periodStartDate: new Date("2026-03-01"),
    periodEndDate: new Date("2026-05-01"),
    paymentMethod: "CARD",
    notes: "1 va 2-oy to'lovlari birga to'landi",
  });

  console.log("Created Payments.");

  // 6. Create Exams & Results
  const exam1 = await Exam.create({
    name: "Frontend React Oraliq Imtihoni",
    courseId: frontendCourse._id,
    groupId: groupFrontend1._id,
    examDate: new Date("2026-08-20"),
    startTime: "14:00",
    endTime: "16:00",
    room: "Xona 101",
    maxScore: 100,
    passingScore: 60,
    description: "HTML/CSS, JS ES6+, React Hooks bo'yicha amaliy imtihon",
    isPublished: true,
    publicExamId: "fe-exam-2026-public-key",
  });

  await ExamResult.create({
    examId: exam1._id,
    studentId: student1._id,
    score: 87,
    status: "PASSED",
  });

  await ExamResult.create({
    examId: exam1._id,
    studentId: student2._id,
    score: 48,
    status: "FAILED",
  });

  console.log("Created Exam & Results.");

  // 7. Create Notifications
  await Notification.create({
    title: "Yangi talaba qo'shildi",
    message: "Madina Umarova Backend 01 guruhiga qo'shildi.",
    type: "SUCCESS",
  });

  await Notification.create({
    title: "Qarzdorlik eslatmasi",
    message: "2 ta talabada to'lov muddati o'tdi.",
    type: "WARNING",
  });

  console.log("Database seeded successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
