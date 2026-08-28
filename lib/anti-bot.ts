import { prisma } from './prisma';
import { redisClient } from './redis';

export interface AntiBotCheckResult {
  allowed: boolean;
  reason?: string;
  isBot?: boolean;
}

export class AntiBotService {
  private rateLimitWindowSeconds = 60;
  private maxRequestsPerMinute = 100;

  async checkRequest(ipAddress: string, userAgent?: string, endpoint?: string): Promise<AntiBotCheckResult> {
    // 1. Check IP Blocklist in DB / Cache
    const blocked = await prisma.blockedIp.findFirst({
      where: {
        ipAddress,
        status: 'ACTIVE',
      },
    });

    if (blocked) {
      if (blocked.expiresAt && blocked.expiresAt < new Date()) {
        await prisma.blockedIp.update({
          where: { id: blocked.id },
          data: { status: 'RELEASED' },
        });
      } else {
        return { allowed: false, reason: `IP is blocked: ${blocked.reason}` };
      }
    }

    // 2. Headless / Bot Detection via User-Agent and automation headers
    const ua = (userAgent || '').toLowerCase();
    const isBot =
      ua.includes('headless') ||
      ua.includes('phantomjs') ||
      ua.includes('selenium') ||
      ua.includes('puppeteer') ||
      ua.includes('python-requests') ||
      ua.includes('curl') ||
      ua.includes('postman');

    if (isBot && endpoint?.includes('/bookings/hold')) {
      await prisma.securityEvent.create({
        data: {
          ipAddress,
          eventType: 'SUSPICIOUS_BOT_AUTOMATION',
          reason: 'Headless / Bot User-Agent detected during seat hold request',
          userAgent,
          endpoint,
        },
      });

      return { allowed: false, reason: 'Suspicious request pattern detected (Anti-Bot Protection)', isBot: true };
    }

    // 3. Rate Limiting Sliding Window (Redis)
    const rateKey = `rate_limit:${ipAddress}:${endpoint || 'all'}`;
    const currentCount = await redisClient.incr(rateKey);

    if (currentCount === 1) {
      await redisClient.expire(rateKey, this.rateLimitWindowSeconds);
    }

    if (currentCount > this.maxRequestsPerMinute) {
      await prisma.securityEvent.create({
        data: {
          ipAddress,
          eventType: 'RATE_LIMIT_EXCEEDED',
          reason: `Exceeded ${this.maxRequestsPerMinute} req/min limit (${currentCount} requests)`,
          userAgent,
          endpoint,
        },
      });

      return { allowed: false, reason: 'Rate limit exceeded. Please wait a minute.' };
    }

    return { allowed: true };
  }

  async blockIp(ipAddress: string, reason: string, durationHours: number = 24) {
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    return prisma.blockedIp.upsert({
      where: { ipAddress },
      update: { reason, status: 'ACTIVE', expiresAt },
      create: { ipAddress, reason, status: 'ACTIVE', expiresAt },
    });
  }

  async unblockIp(ipAddress: string) {
    return prisma.blockedIp.updateMany({
      where: { ipAddress },
      data: { status: 'RELEASED' },
    });
  }
}

export const antiBotService = new AntiBotService();
