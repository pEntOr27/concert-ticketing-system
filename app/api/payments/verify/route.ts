import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { broadcastSeatStateChange } from '@/lib/socket-server';
import { recordAuditLog } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  try {
    const { paymentId, simulateSuccess = true } = await req.json();

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        booking: {
          include: {
            bookingItems: { include: { seat: true } },
            event: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบรายการชำระเงิน' } }, { status: 404 });
    }

    const booking = payment.booking;
    const seatIds = booking.bookingItems.map((bi) => bi.seatId);

    if (simulateSuccess) {
      // Atomic State Machine Transition:
      // Payment: PENDING -> SUCCESS
      // Booking: HELD -> PAID
      // Seats: HELD -> SOLD
      // SeatHold: Deleted
      // Ticket: Issued

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'SUCCESS' },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'PAID' },
        });

        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: 'SOLD' },
        });

        await tx.seatHold.deleteMany({
          where: { bookingId: booking.id },
        });

        // Issue E-Tickets
        for (const item of booking.bookingItems) {
          const ticketCode = `TKT-${booking.eventId.slice(0, 4)}-${item.seat.seatNumber}`;
          const barcode = `8859012${Math.floor(10000 + Math.random() * 90000)}`;

          await tx.ticket.create({
            data: {
              ticketCode,
              bookingId: booking.id,
              seatId: item.seatId,
              userId: user.id,
              qrData: JSON.stringify({
                ticketCode,
                event: booking.event.name,
                seat: item.seat.seatNumber,
                holder: `${user.firstName} ${user.lastName}`,
              }),
              barcode,
              status: 'ISSUED',
            },
          });
        }
      });

      // Broadcast Real-time seat updates to all connected browsers
      broadcastSeatStateChange(
        seatIds.map((id) => ({ seatId: id, status: 'SOLD' }))
      );

      const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
      await recordAuditLog({
        actorId: user.id,
        action: 'PAYMENT_SUCCESS',
        resource: 'Payment',
        resourceId: payment.id,
        ipAddress: ip,
        payloadJson: { bookingId: booking.id, amount: payment.amount },
      });

      return NextResponse.json({
        success: true,
        message: 'ชำระเงินสำเร็จ ออก E-Ticket เรียบร้อยแล้ว',
        data: {
          bookingId: booking.id,
          ticketUrl: `/ticket/${booking.id}`,
        },
      });
    } else {
      // Payment Failed Simulation
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'FAILED' },
        });

        await tx.booking.update({
          where: { id: booking.id },
          data: { status: 'CANCELLED' },
        });

        await tx.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: 'AVAILABLE' },
        });

        await tx.seatHold.deleteMany({
          where: { bookingId: booking.id },
        });
      });

      broadcastSeatStateChange(
        seatIds.map((id) => ({ seatId: id, status: 'AVAILABLE' }))
      );

      return NextResponse.json({
        success: false,
        error: { code: 'PAYMENT_FAILED', message: 'การชำระเงินไม่สำเร็จ คืนสถานะที่นั่งเรียบร้อย' },
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดในการตรวจสอบการชำระเงิน' } }, { status: 500 });
  }
}
