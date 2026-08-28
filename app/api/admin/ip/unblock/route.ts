import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { antiBotService } from '@/lib/anti-bot';
import { recordAuditLog } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const { ipAddress } = await req.json();

    if (!ipAddress) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุ IP Address' } }, { status: 422 });
    }

    await antiBotService.unblockIp(ipAddress);

    const reqIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'UNBLOCK_IP',
      resource: 'BlockedIp',
      ipAddress: reqIp,
      payloadJson: { ipAddress },
    });

    return NextResponse.json({ success: true, message: `ปลดบล็อก IP ${ipAddress} เรียบร้อยแล้ว` });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'ปลดบล็อก IP ไม่สำเร็จ' } }, { status: 500 });
  }
}
