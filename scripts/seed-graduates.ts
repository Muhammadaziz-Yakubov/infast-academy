import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { Graduate } from '../src/models/Graduate';
import { formatGraduateId, formatAwardId } from '../src/lib/certificateUtils';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/infast-crm';

const SAMPLE_GRADUATES = [
  {
    firstName: 'Muhammad',
    lastName: 'Aliyev',
    middleName: 'Aliyevich',
    birthDate: '12.04.2003',
    phone: '+998 90 123 45 67',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Best Full-Stack Developer',
    issuedDate: '02.10.2026',
    status: 'active',
  },
  {
    firstName: 'Javohir',
    lastName: 'Karimov',
    middleName: 'Rustam o‘g‘li',
    birthDate: '24.09.2002',
    phone: '+998 91 234 56 78',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Fastest Progress',
    issuedDate: '02.10.2026',
    status: 'active',
  },
  {
    firstName: 'Sardorbek',
    lastName: 'Rahimov',
    middleName: 'Ilhomjon o‘g‘li',
    birthDate: '05.11.2001',
    phone: '+998 93 345 67 89',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Best Problem Solver',
    issuedDate: '02.10.2026',
    status: 'active',
  },
  {
    firstName: 'Madinabonu',
    lastName: 'Ismoilova',
    middleName: 'Sherzod qizi',
    birthDate: '18.02.2004',
    phone: '+998 94 456 78 90',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Best Frontend Developer',
    issuedDate: '02.10.2026',
    status: 'active',
  },
  {
    firstName: 'Boburmirzo',
    lastName: 'Toshmatov',
    middleName: 'Akbar o‘g‘li',
    birthDate: '30.06.2000',
    phone: '+998 97 567 89 01',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Best Backend Developer',
    issuedDate: '02.10.2026',
    status: 'active',
  },
  {
    firstName: 'Diyorbek',
    lastName: 'Xolmirzayev',
    middleName: 'Ulug‘bek o‘g‘li',
    birthDate: '14.08.2003',
    phone: '+998 99 678 90 12',
    track: 'Full-Stack Development',
    courseName: 'Full-Stack Development',
    duration: '15 oy',
    startDate: '01.07.2025',
    endDate: '02.10.2026',
    mentor: 'M. Yakubov',
    director: 'N. Yakubova',
    nomination: 'Most Consistent',
    issuedDate: '02.10.2026',
    status: 'active',
  },
];

async function seed() {
  try {
    console.log('Connecting to database:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB!');

    // Check existing graduates count
    const existingCount = await Graduate.countDocuments();
    if (existingCount > 0) {
      console.log(`Bazada allaqachon ${existingCount} ta bitiruvchi mavjud.`);
    }

    for (let i = 0; i < SAMPLE_GRADUATES.length; i++) {
      const g = SAMPLE_GRADUATES[i];
      const seq = i + 1;
      const graduateId = formatGraduateId(seq, 2026);
      const certificateId = graduateId;
      const awardId = formatAwardId(seq, 2026);

      const fullNameParts = [g.lastName, g.firstName, g.middleName].filter(Boolean);
      const fullName = fullNameParts.join(' ');

      const existing = await Graduate.findOne({ graduateId });
      if (!existing) {
        await Graduate.create({
          ...g,
          graduateId,
          certificateId,
          awardId,
          fullName,
        });
        console.log(`Bitiruvchi qo'shildi: ${fullName} (${graduateId}, ${awardId})`);
      } else {
        console.log(`Bitiruvchi mavjud: ${fullName} (${graduateId})`);
      }
    }

    console.log('Bitiruvchilar muvaffaqiyatli yuklandi!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
