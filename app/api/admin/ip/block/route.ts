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
    const { ipAddress, reason, durationHours } = await req.json();

    if (!ipAddress || !reason) {
      return NextResponse.json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุ IP Address และสาเหตุ' } }, { status: 422 });
    }

    const blocked = await antiBotService.blockIp(ipAddress, reason, durationHours || 24);

    const reqIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'BLOCK_IP',
      resource: 'BlockedIp',
      resourceId: blocked.id,
      ipAddress: reqIp,
      payloadJson: { ipAddress, reason },
    });

    return NextResponse.json({ success: true, message: `บล็อก IP ${ipAddress} เรียบร้อยแล้ว`, data: blocked });
  } catch {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: 'บล็อก IP ไม่สำเร็จ' } }, { status: 500 });
  }
}
