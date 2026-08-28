import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { broadcastConcertUpdate } from '@/lib/socket-server';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { code, discountType, discountValue, usageLimit = 500, endDate } = body;

    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' } },
        { status: 400 }
      );
    }

    const promo = await prisma.promotion.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue: Number(discountValue),
        usageLimit: Number(usageLimit),
        startDate: new Date(),
        endDate: endDate ? new Date(endDate) : new Date('2026-12-31'),
        status: true,
      },
    });

    broadcastConcertUpdate();

    return NextResponse.json({ success: true, data: promo }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
