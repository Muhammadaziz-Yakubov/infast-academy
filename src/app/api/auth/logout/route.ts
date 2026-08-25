import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Tizimdan chiqildi" });
  response.cookies.delete('infast_session');
  return response;
}
