import { prisma } from './prisma';

export interface IOtpService {
  sendOtp(phone: string, email: string): Promise<{ success: boolean; message: string; demoCode?: string }>;
  verifyOtp(phone: string, email: string, code: string): Promise<{ success: boolean; message: string }>;
}

export class OtpService implements IOtpService {
  private demoOtpCode = process.env.DEMO_OTP_CODE || '123456';

  async sendOtp(phone: string, email: string): Promise<{ success: boolean; message: string; demoCode?: string }> {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    await prisma.otpVerification.create({
      data: {
        phone,
        email,
        otpCode: this.demoOtpCode,
        isVerified: false,
        expiresAt,
      },
    });

    return {
      success: true,
      message: `OTP sent successfully. Demo OTP code is ${this.demoOtpCode}`,
      demoCode: this.demoOtpCode,
    };
  }

  async verifyOtp(phone: string, email: string, code: string): Promise<{ success: boolean; message: string }> {
    // Standard Demo Check or Database check
    if (code === this.demoOtpCode) {
      // Mark latest record as verified
      const record = await prisma.otpVerification.findFirst({
        where: { phone, email, isVerified: false },
        orderBy: { createdAt: 'desc' },
      });

      if (record) {
        await prisma.otpVerification.update({
          where: { id: record.id },
          data: { isVerified: true },
        });
      }

      return { success: true, message: 'OTP verification successful' };
    }

    return { success: false, message: 'Invalid OTP code. Please enter 123456 for demo.' };
  }
}

export const otpService = new OtpService();
