import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit-logger';
import { antiBotService } from '@/lib/anti-bot';
import { z } from 'zod';

const registerSchema = z.object({
  firstName: z.string().min(2, 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'),
  lastName: z.string().min(2, 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().regex(/^0[0-9]{9}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง (10 หลัก)'),
  nationality: z.string().default('THAI'),
  password: z.string().min(8, 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร'),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    // Anti-bot check
    const botCheck = await antiBotService.checkRequest(ip, userAgent, '/api/auth/register');
    if (!botCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: botCheck.reason } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 422 }
      );
    }

    const { firstName, lastName, email, phone, nationality, password } = result.data;

    // Check duplicate Email or Phone
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DUPLICATE_ENTRY',
            message: existingUser.email === email ? 'อีเมลนี้ถูกใช้งานในระบบแล้ว' : 'เบอร์โทรศัพท์นี้ถูกใช้งานในระบบแล้ว',
          },
        },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Get Customer Role
    let customerRole = await prisma.role.findUnique({ where: { name: 'customer' } });
    if (!customerRole) {
      customerRole = await prisma.role.create({ data: { name: 'customer' } });
    }

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        nationality,
        passwordHash,
        status: 'ACTIVE',
        userRoles: {
          create: [{ roleId: customerRole.id }],
        },
      },
    });

    await recordAuditLog({
      actorId: newUser.id,
      action: 'REGISTER',
      resource: 'User',
      resourceId: newUser.id,
      ipAddress: ip,
      userAgent,
      payloadJson: { email, phone },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error('Register error detail:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: `เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: ${(error as Error).message}` } },
      { status: 500 }
    );
  }
}
