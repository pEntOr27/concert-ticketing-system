import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { isLivenessPassed } = await req.json();

    if (!isLivenessPassed) {
      return NextResponse.json(
        { success: false, error: { code: 'LIVENESS_FAILED', message: 'การตรวจสอบ Liveness ไม่ผ่าน กรุณาลองใหม่อีกครั้ง' } },
        { status: 400 }
      );
    }

    const currentUser = await getCurrentUser();
    if (currentUser) {
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { faceVerifiedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'ยืนยันโครงสร้างใบหน้าสำเร็จเรียบร้อย! (Demo Simulation)',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'เกิดข้อผิดพลาดในการสแกนใบหน้า' } },
      { status: 500 }
    );
  }
}
