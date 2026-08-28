import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { phone, email, code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกรหัส OTP' } },
        { status: 422 }
      );
    }

    const res = await otpService.verifyOtp(phone || '', email || '', code);

    if (!res.success) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: res.message } },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    if (currentUser) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { phoneVerifiedAt: new Date() },
      });
    }

    return NextResponse.json({ success: true, message: 'ยืนยันรหัส OTP สำเร็จเรียบร้อย' });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดในการตรวจสอบ OTP' } },
      { status: 500 }
    );
  }
}
