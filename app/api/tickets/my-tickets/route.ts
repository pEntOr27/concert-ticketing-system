import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import QRCode from 'qrcode';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบเพื่อดูตั๋วของคุณ' } },
      { status: 401 }
    );
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: user.id,
      status: 'PAID',
    },
    include: {
      event: true,
      tickets: {
        include: {
          seat: { include: { zone: true } },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Attach QR code image data URL to tickets
  const bookingsWithQr = await Promise.all(
    bookings.map(async (b) => {
      const ticketsWithQr = await Promise.all(
        b.tickets.map(async (t) => {
          const qrDataUrl = await QRCode.toDataURL(t.qrData);
          return {
            ...t,
            qrDataUrl,
          };
        })
      );
      return {
        ...b,
        tickets: ticketsWithQr,
      };
    })
  );

  return NextResponse.json({
    success: true,
    data: bookingsWithQr,
  });
}
