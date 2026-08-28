import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { broadcastConcertUpdate } from '@/lib/socket-server';

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
    const { code, discountType, discountValue, usageLimit, endDate, status } = body;

    const updated = await prisma.promotion.update({
      where: { id },
      data: {
        ...(code && { code: code.toUpperCase() }),
        ...(discountType && { discountType }),
        ...(discountValue && { discountValue: Number(discountValue) }),
        ...(usageLimit && { usageLimit: Number(usageLimit) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(status !== undefined && { status }),
      },
    });

    broadcastConcertUpdate();

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}

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
    await prisma.promotion.delete({ where: { id } });

    broadcastConcertUpdate();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
