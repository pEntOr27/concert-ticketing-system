import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' } },
        { status: 403 }
      );
    }

    const { id } = params;

    // Delete associated seats and zone
    await prisma.seat.deleteMany({ where: { zoneId: id } });
    await prisma.eventZone.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' } },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await req.json();
    const { name, price } = body;

    const updated = await prisma.eventZone.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(price && { price: Number(price) }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
