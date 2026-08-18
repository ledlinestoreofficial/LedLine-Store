import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    store: 'LED LINE™',
    timestamp: new Date().toISOString(),
    framework: 'Next.js App Router',
  });
}
