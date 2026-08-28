import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } }, { status: 401 });
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      event: true,
      bookingItems: {
        include: {
          seat: {
            include: { zone: true },
          },
        },
      },
      promotion: true,
      payments: true,
      tickets: true,
    },
  });

  if (!booking) {
    return NextResponse.json({ success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบรายการจอง' } }, { status: 404 });
  }

  // Ensure owner or admin
  const isOwner = booking.userId === user.id;
  const isAdmin = user.roles.includes('admin') || user.roles.includes('super_admin');

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'ไม่มีสิทธิ์เข้าถึงรายการจองนี้' } }, { status: 403 });
  }

  return NextResponse.json({ success: true, data: booking });
}
