import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      event: { select: { id: true, name: true } },
      bookingItems: { include: { seat: { include: { zone: true } } } },
      payments: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: bookings });
}
