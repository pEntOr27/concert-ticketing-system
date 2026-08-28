import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit-logger';
import { antiBotService } from '@/lib/anti-bot';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('อีเมลไม่ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
  isAdminLogin: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const botCheck = await antiBotService.checkRequest(ip, userAgent, '/api/auth/login');
    if (!botCheck.allowed) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: botCheck.reason } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } },
        { status: 422 }
      );
    }

    const { email, password, isAdminLogin } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      await prisma.loginHistory.create({
        data: {
          emailAttempted: email,
          ipAddress: ip,
          userAgent,
          status: 'FAILED',
          failureReason: 'User not found',
        },
      });

      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } },
        { status: 401 }
      );
    }

    const validPassword = await comparePassword(password, user.passwordHash);

    if (!validPassword) {
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          emailAttempted: email,
          ipAddress: ip,
          userAgent,
          status: 'FAILED',
          failureReason: 'Invalid password',
        },
      });

      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' } },
        { status: 401 }
      );
    }

    const roles = user.userRoles.map((ur) => ur.role.name);

    if (isAdminLogin) {
      const isAdmin = roles.includes('admin') || roles.includes('super_admin');
      if (!isAdmin) {
        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            emailAttempted: email,
            ipAddress: ip,
            userAgent,
            status: 'FAILED',
            failureReason: 'Forbidden: Non-admin attempted admin login',
          },
        });

        return NextResponse.json(
          { success: false, error: { code: 'FORBIDDEN', message: 'บัญชีนี้ไม่มีสิทธิ์เข้าถึงระบบผู้ดูแลระบบ (Admin Panel)' } },
          { status: 403 }
        );
      }
    }

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      roles,
    });

    // Record Login History & Audit Log
    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        emailAttempted: email,
        ipAddress: ip,
        userAgent,
        status: 'SUCCESS',
      },
    });

    await recordAuditLog({
      actorId: user.id,
      action: isAdminLogin ? 'ADMIN_LOGIN' : 'CUSTOMER_LOGIN',
      resource: 'User',
      resourceId: user.id,
      ipAddress: ip,
      userAgent,
    });

    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          roles,
        },
        token,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error detail:', error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: `เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: ${(error as Error).message}` } },
      { status: 500 }
    );
  }
}
