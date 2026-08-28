import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

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
    const { status } = body;

    const updatedSeat = await prisma.seat.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      data: updatedSeat,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
