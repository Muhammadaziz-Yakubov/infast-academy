# INFAST STUDENT APP — FOYDALANISH VA ISHGA TUSHIRISH QO'LLANMASI

Ushbu mobil ilova **InFast IT-Academy CRM** bilan to'liq integratsiyalashgan rasmiy Student Mobile ilovasi hisoblanadi.

---

## 1. TEXNOLOGIYALAR VA TUZILISH

- **Framework:** React Native + Expo (SDK 57)
- **Til:** TypeScript (Strict mode)
- **Xavfsiz Autentifikatsiya:** Expo SecureStore + JWT Bearer token
- **Dizayn tizimi:** InFast to'q sariq (`#F97316`) va toza oq ranglar palitrasi
- **Ikonkalar:** Lucide React Native
- **Backend:** Next.js 14 API + MongoDB/Mongoose (CRM bilan umumiy ma'lumotlar bazasi)

---

## 2. ASOSIY EKRANLAR VA FUNKSIYALAR

1. **Kirish (LoginScreen):**
   - Telefon raqami va parol orqali kirish.
   - Parol ko'rsatish/yashirish imkoniyati.
   - Xavfsiz sessiya (`SecureStore`) va avtomatik qayta tiklanish.

2. **Bosh Sahifa (HomeScreen):**
   - O'quvchi ismi, filiali va guruhi.
   - XCoin, XP bali, Daraja va Reyting kartalari.
   - Bugungi dars holati va umumiy progress diagrammasi (foizda).
   - "Darsni Davom Ettirish" bir bosishdagi tezkor harakat tugmasi.
   - Davomat va to'lov xulosasi.
   - Akademiya e'lonlari.

3. **Ta'lim (CurriculumScreen):**
   - Kurs nomi va umumiy tavsifi.
   - Modullar ro'yxati (har bir modul foizli progressi bilan).
   - Gamifikatsiyalangan darslar xaritasi:
     - ✅ **Tugatilgan** darslar.
     - ⏳ **Ochilgan / Hozirgi** darslar.
     - 🔒 **Qulflangan** darslar (faqat o'qituvchi/admin CRM orqali ochadi).

4. **Dars Jarayoni (LessonDetailScreen):**
   - **1. Nazariya:** Matnli dars qo'llanmasi va dasturlash kod bloklari.
   - **2. Test (9 ta savol):** 3 bosqich x 3 savol vizual xaritasi, 4 ta variant (A, B, C, D), server tekshiruvi ($\ge 8/9$ o'tish bali).
   - **3. Interaktiv Mashg'ulot:** Tushunchalarni ta'riflar bilan birlashtiruvchi juftliklar boshqotirmasi (Match Pairs).
   - **Darsni Yakunlash:** Barcha 3 bosqich muvaffaqiyatli topshirilgach, dars to'liq yakunlanadi va talabaga yakuniy XP beriladi.

5. **Reyting (LeaderboardScreen):**
   - O'quvchining joriy reyting o'rni.
   - Kurs bo'yicha yoki barcha filiallar bo'yicha filtrlash.
   - Top 3 talaba uchun maxsus oltin, kumush va bronza nishonlari.

6. **XCoin Do'koni (ShopScreen):**
   - Talabaning jonli XCoin balansi.
   - Esdalik sovg'alari va dasturchi aksessuarlari katalogi.
   - Serverda tekshiriladigan xavfsiz va atomar xarid qilish tizimi.
   - Buyurtmalar tarixi va holati (PENDING / FULFILLED).

7. **Profil (ProfileScreen):**
   - Shaxsiy ma'lumotlar (ID, telefon, filial, guruh, to'lov sanasi).
   - XP va XCoin balansi.
   - Xavfsiz tizimdan chiqish (Logout).

---

## 3. ISHGA TUSHIRISH BUYRUQLARI

### Backend (CRM API)ni ishga tushirish:
```bash
# infast-academy papkasida:
npm run dev
```

### Student App (Mobil ilova)ni ishga tushirish:
```bash
# student-app papkasida:
cd student-app
npm start
```

- **Android telefon yoki emulyator:** klaviaturada `a` tugmasini bosing yoki Expo Go ilovasi bilan QR kodni skanerlang.
- **Web brauzerda ochish:** klaviaturada `w` tugmasini bosing.
