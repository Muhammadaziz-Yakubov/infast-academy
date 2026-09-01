import React from 'react';

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'InFast IT Academy',
    alternateName: ['InFast Academy', 'InFast IT-Ta’lim Markazi'],
    url: 'https://infast.uz',
    logo: 'https://infast.uz/icon',
    description: 'InFast IT-Academy — Frontend, Backend va Cyber Security yo‘nalishlarida real amaliy loyihalar orqali yetuk IT mutaxassisi tayyorlovchi zamonaviy akademiya.',
    telephone: '+998-90-123-45-67',
    priceRange: '$$',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Toshkent shahri, Yunusobod tumani',
        addressLocality: 'Toshkent',
        addressRegion: 'Toshkent shahri',
        postalCode: '100000',
        addressCountry: 'UZ',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Urganch shahri, Al-Xorazmiy ko‘chasi',
        addressLocality: 'Urganch',
        addressRegion: 'Xorazm viloyati',
        postalCode: '220100',
        addressCountry: 'UZ',
      },
    ],
    sameAs: [
      'https://t.me/infast_academy',
      'https://instagram.com/infast_academy',
      'https://youtube.com/@infast_academy',
    ],
  };

  const coursesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'InFast IT Academy Kurslari',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Course',
          name: 'Frontend Development',
          description: 'Zamonaviy interaktiv veb-saytlar va Next.js platformalarini yaratuvchi Frontend mutaxassis kursi.',
          provider: {
            '@type': 'Organization',
            name: 'InFast IT Academy',
            sameAs: 'https://infast.uz',
          },
          courseMode: 'Blended',
          educationalCredentialAwarded: 'InFast IT-Academy Professional Sertifikati',
        },
      },
      {
        '@type': 'ListItem',
        position: 2,
        item: {
          '@type': 'Course',
          name: 'Backend Development',
          description: 'Mukammal ma’lumotlar bazasi, server arxitekturasi va REST API xizmatlarini noldan qurish kursi.',
          provider: {
            '@type': 'Organization',
            name: 'InFast IT Academy',
            sameAs: 'https://infast.uz',
          },
          courseMode: 'Blended',
          educationalCredentialAwarded: 'InFast IT-Academy Professional Sertifikati',
        },
      },
      {
        '@type': 'ListItem',
        position: 3,
        item: {
          '@type': 'Course',
          name: 'Cyber Security (Kiberxavfsizlik)',
          description: 'Kiberxavfsizlik, pentesting va veb-tizimlar zaifliklarini aniqlash hamda tizimlarni himoyalash kursi.',
          provider: {
            '@type': 'Organization',
            name: 'InFast IT Academy',
            sameAs: 'https://infast.uz',
          },
          courseMode: 'Blended',
          educationalCredentialAwarded: 'InFast IT-Academy Professional Sertifikati',
        },
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Kurslar necha oy davom etadi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Asosiy va chuqurlashtirilgan IT kurslarimiz (Frontend, Backend, Cyber Security) 6-11 oy davom etadi. Har bir oy aniq loyihaga yo‘naltirilgan.',
        },
      },
      {
        '@type': 'Question',
        name: 'Darslar qanday tartibda o‘tiladi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Darslar haftada 3 kun 2 soatdan jonli interaktiv formatda o‘tiladi. Undan tashqari har kuni koworking va mentorlar bilan amaliy ish olib boriladi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kursga qatnashish uchun boshlang‘ich bilim kerakmi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yo‘q, kurslarimiz noldan boshlanadi. Kompyuterdan foydalana olish va xohish bo‘lsa yetarli, qolgan barcha ko‘nikmalarni noldan o‘rgatamiz.',
        },
      },
      {
        '@type': 'Question',
        name: 'Necha yoshdan o‘quvchilarni qabul qilasiz?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Akademiyamizga 14 yoshdan yuqori bo‘lgan barcha qiziquvchilar va dasturchi bo‘lishni maqsad qilganlar qabul qilinadi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kursni tamomlagach sertifikat beriladimi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ha, kurs yakunida real loyihalarni muvaffaqiyatli topshirgan va imtihondan o‘tgan o‘quvchilarga INFAST IT-Academy sertifikati taqdim etiladi.',
        },
      },
      {
        '@type': 'Question',
        name: 'Bepul sinov darsi yoki konsultatsiya bormi?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ha! Siz ariza qoldirib, akademiyamizga tashrif buyurishingiz va bepul konsultatsiya hamda 1-sinov darsida qatnashishingiz mumkin.',
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Bosh sahifa',
        item: 'https://infast.uz',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'IT Kurslar',
        item: 'https://infast.uz/#kurslar',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Filiallar',
        item: 'https://infast.uz/#filiallar',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Ariza topshirish',
        item: 'https://infast.uz/#ariza',
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(coursesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
