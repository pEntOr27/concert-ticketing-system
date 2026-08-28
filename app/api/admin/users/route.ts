import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { recordAuditLog } from '@/lib/audit-logger';
import { broadcastUserUpdate } from '@/lib/socket-server';

export async function GET(req: NextRequest) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';

  const users = await prisma.user.findMany({
    where: search
      ? {
          OR: [
            { email: { contains: search } },
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {},
    include: {
      userRoles: {
        include: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: users.map((u) => ({
      id: u.id,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      nationality: u.nationality,
      status: u.status,
      faceVerified: !!u.faceVerifiedAt,
      roles: u.userRoles.map((ur) => ur.role.name),
      createdAt: u.createdAt,
    })),
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { firstName, lastName, email, phone, password, role = 'customer' } = body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' } },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'CONFLICT', message: 'อีเมลหรือเบอร์โทรศัพท์นี้ถูกใช้งานแล้ว' } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        passwordHash,
        status: 'ACTIVE',
        faceVerifiedAt: new Date(),
        phoneVerifiedAt: new Date(),
      },
    });

    // Find or create role
    let roleObj = await prisma.role.findUnique({ where: { name: role } });
    if (!roleObj) {
      roleObj = await prisma.role.create({ data: { name: role } });
    }

    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: roleObj.id,
      },
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'CREATE_USER',
      resource: 'User',
      resourceId: user.id,
      ipAddress: ip,
      payloadJson: { email, role },
    });

    broadcastUserUpdate();

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
