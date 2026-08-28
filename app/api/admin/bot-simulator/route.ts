import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const isAdmin = user?.roles?.includes('admin') || user?.roles?.includes('super_admin');
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'คุณไม่มีสิทธิ์ดำเนินการนี้' } },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { mode, ipAddress = '103.22.180.45', burstRate = 500 } = body;

    if (mode === 'bot') {
      // Create suspicious security events
      const botUserAgents = [
        'HeadlessChrome/120.0.0.0 (Automation/Selenium)',
        'Python-requests/2.31.0 (Script Bot)',
        'Puppeteer/19.8.0 (Scalper Bot)',
      ];
      const selectedUa = botUserAgents[Math.floor(Math.random() * botUserAgents.length)];

      const secEvent = await prisma.securityEvent.create({
        data: {
          ipAddress,
          eventType: 'SUSPICIOUS_BOT_AUTOMATION',
          reason: `High Burst Traffic (${burstRate} TPS) / Bot User-Agent Detected`,
          userAgent: selectedUa,
          endpoint: '/api/bookings/hold',
        },
      });

      // Also block IP
      await prisma.blockedIp.upsert({
        where: { ipAddress },
        update: { reason: 'Automated Scalper Bot Attack Blocked by AI', status: 'ACTIVE' },
        create: { ipAddress, reason: 'Automated Scalper Bot Attack Blocked by AI', status: 'ACTIVE' },
      });

      return NextResponse.json({
        success: true,
        data: {
          detected: true,
          threatScore: 98.4,
          action: 'BLOCKED_AND_LOGGED',
          event: secEvent,
        },
      });
    } else {
      // Simulate Legitimate Human Traffic
      const humanSecEvent = await prisma.securityEvent.create({
        data: {
          ipAddress: '127.0.0.1',
          eventType: 'HUMAN_VERIFIED',
          reason: 'Liveness Face Scan & CAPTCHA Passed (Legitimate Request)',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0',
          endpoint: '/api/bookings/hold',
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          detected: false,
          threatScore: 1.2,
          action: 'ALLOWED',
          event: humanSecEvent,
        },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
