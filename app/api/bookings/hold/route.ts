import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { seatBookingService } from '@/lib/db-wrapper';
import { antiBotService } from '@/lib/anti-bot';
import { recordAuditLog } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบก่อนทำการเลือกที่นั่ง' } },
      { status: 401 }
    );
  }

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  // Anti-Bot Check
  const botCheck = await antiBotService.checkRequest(ip, userAgent, '/api/bookings/hold');
  if (!botCheck.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: botCheck.reason } },
      { status: 429 }
    );
  }

  try {
    const { eventId, seatIds } = await req.json();

    if (!eventId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาเลือกที่นั่งอย่างน้อย 1 ที่นั่ง' } },
        { status: 422 }
      );
    }

    const holdResult = await seatBookingService.holdSeats({
      userId: user.id,
      eventId,
      seatIds,
      holdDurationMinutes: 10,
    });

    await recordAuditLog({
      actorId: user.id,
      action: 'HOLD_SEAT',
      resource: 'Booking',
      resourceId: holdResult.bookingId,
      ipAddress: ip,
      userAgent,
      payloadJson: { seatIds, bookingNumber: holdResult.bookingNumber },
    });

    return NextResponse.json({
      success: true,
      data: holdResult,
    });
  } catch (error: any) {
    if (error && error.code === 'SEAT_ALREADY_HELD') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SEAT_ALREADY_HELD',
            message: error.message || 'ที่นั่งนี้ถูกจองโดยผู้ใช้งานอื่นแล้ว',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BOOKING_FAILED',
          message: error.message || 'ไม่สามารถล็อคที่นั่งได้ กรุณาลองใหม่อีกครั้ง',
        },
      },
      { status: error.status || 500 }
    );
  }
}
