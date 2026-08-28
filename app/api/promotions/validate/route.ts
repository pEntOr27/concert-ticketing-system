import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code, totalAmount } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกโค้ดโปรโมชั่น' } },
        { status: 422 }
      );
    }

    const promo = await prisma.promotion.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo || !promo.status) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PROMOTION', message: 'โค้ดส่วนลดไม่ถูกต้องหรือถูกยกเลิกแล้ว' } },
        { status: 400 }
      );
    }

    const now = new Date();
    if (now < promo.startDate || now > promo.endDate) {
      return NextResponse.json(
        { success: false, error: { code: 'PROMOTION_EXPIRED', message: 'โค้ดส่วนลดนี้หมดอายุใช้งานแล้ว' } },
        { status: 400 }
      );
    }

    if (promo.timesUsed >= promo.usageLimit) {
      return NextResponse.json(
        { success: false, error: { code: 'LIMIT_EXCEEDED', message: 'โค้ดส่วนลดนี้ถูกใช้งานครบตามจำนวนที่กำหนดแล้ว' } },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    const baseTotal = Number(totalAmount || 0);

    if (promo.discountType === 'PERCENTAGE') {
      discountAmount = (baseTotal * Number(promo.discountValue)) / 100;
    } else {
      discountAmount = Number(promo.discountValue);
    }

    discountAmount = Math.min(discountAmount, baseTotal);
    const finalAmount = Math.max(0, baseTotal - discountAmount);

    return NextResponse.json({
      success: true,
      data: {
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue),
        discountAmount,
        finalAmount,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดในการตรวจสอบส่วนลด' } },
      { status: 500 }
    );
  }
}
