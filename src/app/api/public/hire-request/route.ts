import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Lead } from '@/models/Lead';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();

    const { companyName, contactPerson, phone, email, roleNeeded, studentId, studentName, notes } = body;

    if (!phone || !phone.trim()) {
      return NextResponse.json({ error: "Aloqa telefon raqami kiritilishi shart" }, { status: 400 });
    }

    const leadFullName = contactPerson
      ? `${contactPerson}${companyName ? ` (${companyName})` : ''}`
      : (companyName || "Ish beruvchi");

    const noteDetails = [
      `[ISHGA TAKLIF / RECRUITER REQUEST]`,
      companyName ? `Kompaniya: ${companyName}` : null,
      roleNeeded ? `Kerakli yo'nalish: ${roleNeeded}` : null,
      studentName ? `Tanlangan talaba: ${studentName} (ID: ${studentId || '-'})` : null,
      notes ? `Izoh: ${notes}` : null,
    ].filter(Boolean).join('\n');

    const lead = await Lead.create({
      fullName: leadFullName,
      phone: phone.trim(),
      email: email ? email.trim() : undefined,
      status: 'YANGI',
      utmSource: 'portfolio_hire_request',
      notes: noteDetails,
    });

    // Send Telegram notification if BOT_TOKEN is present
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID || process.env.TELEGRAM_ADMIN_CHAT_ID;

    if (botToken && chatId) {
      const messageText = `💼 *YANGI ISHGA TAKLIF (RECRUITER REQUEST)*\n\n` +
        `👤 *Ism/Kompaniya:* ${leadFullName}\n` +
        `📞 *Tel:* ${phone}\n` +
        (email ? `📧 *Email:* ${email}\n` : '') +
        (roleNeeded ? `🎯 *Yo'nalish:* ${roleNeeded}\n` : '') +
        (studentName ? `👨‍💻 *Talaba:* ${studentName}\n` : '') +
        (notes ? `📝 *Izoh:* ${notes}\n` : '');

      try {
        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: messageText,
            parse_mode: 'Markdown',
          }),
        });
      } catch (tgErr) {
        console.error("Telegram notification error:", tgErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "So'rovingiz muvaffaqiyatli qabul qilindi. Tez orada akademiya HR bo'limi siz bilan bog'lanadi!",
      leadId: lead._id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "So'rovni yuborishda xatolik" }, { status: 500 });
  }
}
