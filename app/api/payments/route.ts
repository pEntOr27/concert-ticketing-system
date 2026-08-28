import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  try {
    const { bookingId, paymentMethod, promotionId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookingItems: { include: { seat: true } } },
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบรายการจอง' } }, { status: 404 });
    }

    if (booking.status !== 'HELD') {
      return NextResponse.json({ success: false, error: { code: 'INVALID_STATUS', message: 'รายการจองนี้ไม่สามารถชำระเงินได้' } }, { status: 400 });
    }

    let finalAmount = Number(booking.totalAmount);
    let discountAmount = 0;

    if (promotionId) {
      const promo = await prisma.promotion.findUnique({ where: { id: promotionId } });
      if (promo && promo.status && promo.timesUsed < promo.usageLimit) {
        if (promo.discountType === 'PERCENTAGE') {
          discountAmount = (finalAmount * Number(promo.discountValue)) / 100;
        } else {
          discountAmount = Number(promo.discountValue);
        }
        finalAmount = Math.max(0, finalAmount - discountAmount);

        // Update promo usage
        await prisma.promotion.update({
          where: { id: promo.id },
          data: { timesUsed: { increment: 1 } },
        });
      }
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Generate PromptPay QR Code payload
    const promptPayData = `00020101021229370016A000000677010111011300668911122225802TH5303764540${finalAmount}5908Concert6304`;
    const qrDataUrl = await QRCode.toDataURL(promptPayData);

    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        paymentMethod: paymentMethod || 'PROMPTPAY',
        amount: finalAmount,
        status: 'PENDING',
        transactionId,
        qrPayload: qrDataUrl,
      },
    });

    // Update booking final amount
    await prisma.booking.update({
      where: { id: booking.id },
      data: {
        discountAmount,
        finalAmount,
        promotionId: promotionId || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        transactionId,
        amount: finalAmount,
        qrDataUrl,
        paymentMethod: payment.paymentMethod,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'สร้างรายการชำระเงินไม่สำเร็จ' } }, { status: 500 });
  }
}
