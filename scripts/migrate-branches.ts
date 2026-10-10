import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Branch } from '../src/models/Branch';
import { User } from '../src/models/User';
import { Student } from '../src/models/Student';
import { Group } from '../src/models/Group';
import { Payment } from '../src/models/Payment';
import { Attendance } from '../src/models/Attendance';
import { Lead } from '../src/models/Lead';
import { MarketingExpense } from '../src/models/MarketingExpense';
import { Notification } from '../src/models/Notification';
import { Graduate } from '../src/models/Graduate';

async function migrateBranches() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('Xatolik: MONGODB_URI environment o\'zgaruvchisi topilmadi!');
    process.exit(1);
  }

  console.log('MongoDB ga ulanilmoqda...');
  await mongoose.connect(MONGODB_URI);
  console.log('MongoDB ga muvaffaqiyatli ulandik.');

  // 1. Filiallarni yaratish / tekshirish
  console.log('\n--- 1. Filiallarni yaratish va tekshirish ---');

  let buloqboshi = await Branch.findOne({ code: 'buloqboshi' });
  if (!buloqboshi) {
    buloqboshi = await Branch.create({
      name: 'Buloqboshi',
      code: 'buloqboshi',
      address: 'Buloqboshi tumani, Markaziy ko\'cha',
      phone: '+998 90 000 00 01',
      status: 'active',
    });
    console.log('✓ Buloqboshi filiali yaratildi:', buloqboshi._id);
  } else {
    console.log('✓ Buloqboshi filiali mavjud:', buloqboshi._id);
  }

  let xojaobod = await Branch.findOne({ code: 'xojaobod' });
  if (!xojaobod) {
    xojaobod = await Branch.create({
      name: 'Xo\'jaobod',
      code: 'xojaobod',
      address: 'Xo\'jaobod tumani, Mustaqillik ko\'chasi',
      phone: '+998 90 000 00 02',
      status: 'active',
    });
    console.log('✓ Xo\'jaobod filiali yaratildi:', xojaobod._id);
  } else {
    console.log('✓ Xo\'jaobod filiali mavjud:', xojaobod._id);
  }

  const defaultBranchId = buloqboshi._id;

  // 2. Guruhlarni migratsiya qilish
  console.log('\n--- 2. Guruhlarga branchId biriktirish ---');
  const groupsWithoutBranch = await Group.find({ $or: [{ branchId: { $exists: false } }, { branchId: null }] });
  console.log(`Filial biriktirilmagan guruhlar soni: ${groupsWithoutBranch.length}`);
  if (groupsWithoutBranch.length > 0) {
    const res = await Group.updateMany(
      { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`✓ ${res.modifiedCount} ta guruh ${buloqboshi.name} filialiga biriktirildi.`);
  }

  // 3. Talabalarni migratsiya qilish
  console.log('\n--- 3. Talabalarga branchId biriktirish ---');
  const studentsWithoutBranch = await Student.find({ $or: [{ branchId: { $exists: false } }, { branchId: null }] });
  console.log(`Filial biriktirilmagan talabalar soni: ${studentsWithoutBranch.length}`);
  for (const student of studentsWithoutBranch) {
    let assignedBranchId = defaultBranchId;
    if (student.groupId) {
      const group = await Group.findById(student.groupId);
      if (group?.branchId) {
        assignedBranchId = group.branchId as mongoose.Types.ObjectId;
      }
    }
    await Student.updateOne({ _id: student._id }, { $set: { branchId: assignedBranchId } });
  }
  console.log(`✓ ${studentsWithoutBranch.length} ta talaba mos filiallarga biriktirildi.`);

  // 4. To'lovlarni migratsiya qilish
  console.log('\n--- 4. To\'lovlarga branchId biriktirish ---');
  const paymentsWithoutBranch = await Payment.find({ $or: [{ branchId: { $exists: false } }, { branchId: null }] });
  console.log(`Filial biriktirilmagan to'lovlar soni: ${paymentsWithoutBranch.length}`);
  for (const payment of paymentsWithoutBranch) {
    let assignedBranchId = defaultBranchId;
    if (payment.studentId) {
      const student = await Student.findById(payment.studentId);
      if (student?.branchId) {
        assignedBranchId = student.branchId as mongoose.Types.ObjectId;
      }
    }
    await Payment.updateOne({ _id: payment._id }, { $set: { branchId: assignedBranchId } });
  }
  console.log(`✓ ${paymentsWithoutBranch.length} ta to'lov mos filiallarga biriktirildi.`);

  // 5. Davomat yozuvlarini migratsiya qilish
  console.log('\n--- 5. Davomat yozuvlariga branchId biriktirish ---');
  const attendanceWithoutBranch = await Attendance.find({ $or: [{ branchId: { $exists: false } }, { branchId: null }] });
  console.log(`Filial biriktirilmagan davomat yozuvlari soni: ${attendanceWithoutBranch.length}`);
  for (const att of attendanceWithoutBranch) {
    let assignedBranchId = defaultBranchId;
    if (att.groupId) {
      const group = await Group.findById(att.groupId);
      if (group?.branchId) {
        assignedBranchId = group.branchId as mongoose.Types.ObjectId;
      }
    }
    await Attendance.updateOne({ _id: att._id }, { $set: { branchId: assignedBranchId } });
  }
  console.log(`✓ ${attendanceWithoutBranch.length} ta davomat yozuvi biriktirildi.`);

  // 6. Lead (murojaat) yozuvlarini migratsiya qilish
  console.log('\n--- 6. Lead yozuvlariga branchId biriktirish ---');
  const leadsWithoutBranch = await Lead.find({ $or: [{ branchId: { $exists: false } }, { branchId: null }] });
  if (leadsWithoutBranch.length > 0) {
    await Lead.updateMany(
      { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`✓ ${leadsWithoutBranch.length} ta lead ${buloqboshi.name} filialiga biriktirildi.`);
  }

  // 7. Xodimlarni (User) migratsiya qilish
  console.log('\n--- 7. Xodimlarga (User) branchId biriktirish ---');
  const usersWithoutBranch = await User.find({ role: 'MANAGER', $or: [{ branchId: { $exists: false } }, { branchId: null }] });
  if (usersWithoutBranch.length > 0) {
    await User.updateMany(
      { role: 'MANAGER', $or: [{ branchId: { $exists: false } }, { branchId: null }] },
      { $set: { branchId: defaultBranchId } }
    );
    console.log(`✓ ${usersWithoutBranch.length} ta menejer ${buloqboshi.name} filialiga biriktirildi.`);
  }

  // 8. Marketing va Bitiruvchilarni migratsiya qilish
  console.log('\n--- 8. Marketing expenses va Bitiruvchilarga branchId biriktirish ---');
  await MarketingExpense.updateMany(
    { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
    { $set: { branchId: defaultBranchId } }
  );
  await Graduate.updateMany(
    { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
    { $set: { branchId: defaultBranchId } }
  );
  await Notification.updateMany(
    { $or: [{ branchId: { $exists: false } }, { branchId: null }] },
    { $set: { branchId: defaultBranchId } }
  );
  console.log('✓ Marketing va Bitiruvchilar yozuvlari yangilandi.');

  console.log('\n========================================');
  console.log(' Filiallar migratsiyasi muvaffaqiyatli yakunlandi!');
  console.log('========================================\n');

  await mongoose.disconnect();
}

migrateBranches().catch((err) => {
  console.error('Migratsiya jarayonida xatolik yuz berdi:', err);
  process.exit(1);
});
