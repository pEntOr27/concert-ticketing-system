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
    const { role } = body;

    if (!role) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุ Role' } }, { status: 400 });
    }

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

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'CHANGE_USER_ROLE',
      resource: 'UserRole',
      resourceId: id,
      ipAddress: ip,
      payloadJson: { newRole: role },
    });

    broadcastUserUpdate();

    return NextResponse.json({ success: true, message: 'เปลี่ยนสิทธิ์การใช้งานสำเร็จ' });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } }, { status: 500 });
  }
}
