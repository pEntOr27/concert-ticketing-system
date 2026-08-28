import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit-logger';
import { broadcastUserUpdate } from '@/lib/socket-server';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { firstName, lastName, email, phone, status, role } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(status && { status }),
      },
    });

    if (role) {
      let roleObj = await prisma.role.findUnique({ where: { name: role } });
      if (!roleObj) {
        roleObj = await prisma.role.create({ data: { name: role } });
      }

      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: roleObj.id,
        },
      });
    }

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'UPDATE_USER',
      resource: 'User',
      resourceId: id,
      ipAddress: ip,
      payloadJson: { role, status },
    });

    broadcastUserUpdate();

    return NextResponse.json({ success: true, data: updatedUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const { id } = params;

    // Delete user roles, sessions, tickets, holds, bookings, user
    await prisma.userRole.deleteMany({ where: { userId: id } });
    await prisma.session.deleteMany({ where: { userId: id } });
    await prisma.ticket.deleteMany({ where: { userId: id } });
    await prisma.seatHold.deleteMany({ where: { userId: id } });
    await prisma.booking.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'DELETE_USER',
      resource: 'User',
      resourceId: id,
      ipAddress: ip,
    });

    broadcastUserUpdate();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } }, { status: 500 });
  }
}
