import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  // params.id can be bookingId or ticketId
  const booking = await prisma.booking.findFirst({
    where: {
      OR: [{ id: params.id }, { bookingNumber: params.id }],
    },
    include: {
      event: true,
      user: true,
      tickets: {
        include: {
          seat: { include: { zone: true } },
        },
      },
      payments: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบตั๋วคอนเสิร์ต' } }, { status: 404 });
  }

  // Generate QR Code image for each ticket
  const ticketsWithQr = await Promise.all(
    booking.tickets.map(async (t) => {
      const qrDataUrl = await QRCode.toDataURL(t.qrData);
      return {
        ...t,
        qrDataUrl,
      };
    })
  );

  return NextResponse.json({
    success: true,
    data: {
      bookingNumber: booking.bookingNumber,
      eventName: booking.event.name,
      artist: booking.event.artist,
      venue: booking.event.venue,
      eventDate: booking.event.eventDate,
      startTime: booking.event.startTime,
      posterUrl: booking.event.posterUrl,
      customerName: `${booking.user.firstName} ${booking.user.lastName}`,
      customerEmail: booking.user.email,
      customerPhone: booking.user.phone,
      tickets: ticketsWithQr,
    },
  });
}
