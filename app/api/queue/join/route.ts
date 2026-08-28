import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { redisClient } from '@/lib/redis';
import { antiBotService } from '@/lib/anti-bot';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบก่อนเข้าคิวจองตั๋ว' } },
      { status: 401 }
    );
  }

  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const userAgent = req.headers.get('user-agent') || '';

  const botCheck = await antiBotService.checkRequest(ip, userAgent, '/api/queue/join');
  if (!botCheck.allowed) {
    return NextResponse.json(
      { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: botCheck.reason } },
      { status: 429 }
    );
  }

  const { eventId } = await req.json();
  if (!eventId) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุ ID คอนเสิร์ต' } },
      { status: 422 }
    );
  }

  const queueKey = `queue:event:${eventId}`;
  const userQueueKey = `queue:user:${user.id}:${eventId}`;

  // Check if user already in queue
  const existingPosition = await redisClient.get(userQueueKey);
  if (existingPosition) {
    const queueLength = await redisClient.llen(queueKey);
    const pos = parseInt(existingPosition, 10);

    return NextResponse.json({
      success: true,
      data: {
        queueNumber: pos,
        peopleAhead: Math.max(0, pos - 1),
        estimatedWaitMinutes: Math.ceil(pos * 0.1), // ~6s per position
        status: pos <= 5 ? 'READY' : 'WAITING',
      },
    });
  }

  // Push user to Redis FIFO Queue
  const pos = await redisClient.rpush(queueKey, user.id);
  await redisClient.set(userQueueKey, pos.toString(), 'EX', 3600); // 1 hour token

  return NextResponse.json({
    success: true,
    data: {
      queueNumber: pos,
      peopleAhead: Math.max(0, pos - 1),
      estimatedWaitMinutes: Math.ceil(pos * 0.1),
      status: pos <= 5 ? 'READY' : 'WAITING',
    },
  });
}
