import { NextRequest, NextResponse } from 'next/server';
import { otpService } from '@/lib/otp-service';

export async function POST(req: NextRequest) {
  try {
    const { phone, email } = await req.json();

    if (!phone || !email) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุเบอร์โทรศัพท์และอีเมล' } },
        { status: 422 }
      );
    }

    const res = await otpService.sendOtp(phone, email);
    return NextResponse.json({ success: true, data: res });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'ไม่สามารถส่ง OTP ได้' } },
      { status: 500 }
    );
  }
}
