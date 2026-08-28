import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';

export async function GET() {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  const logs = await prisma.auditLog.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: {
      actor: { select: { email: true, firstName: true, lastName: true } },
    },
  });

  return NextResponse.json({ success: true, data: logs });
}
