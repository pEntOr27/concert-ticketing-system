import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json({ success: true, data: promotions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
