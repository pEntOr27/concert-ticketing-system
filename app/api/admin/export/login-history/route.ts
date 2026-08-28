import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { generateLoginHistoryExcel } from '@/lib/excel-exporter';

export async function GET() {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  const history = await prisma.loginHistory.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  const buffer = await generateLoginHistoryExcel(history);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="login_history_${Date.now()}.xlsx"`,
    },
  });
}
