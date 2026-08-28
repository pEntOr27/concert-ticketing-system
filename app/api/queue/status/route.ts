import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { redisClient } from '@/lib/redis';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'กรุณาเข้าสู่ระบบ' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณาระบุ eventId' } },
      { status: 422 }
    );
  }

  const userQueueKey = `queue:user:${user.id}:${eventId}`;
  const posStr = await redisClient.get(userQueueKey);

  if (!posStr) {
    return NextResponse.json({
      success: true,
      data: {
        inQueue: false,
        queueNumber: 0,
        peopleAhead: 0,
        estimatedWaitMinutes: 0,
        status: 'READY',
      },
    });
  }

  const pos = parseInt(posStr, 10);
  const peopleAhead = Math.max(0, pos - 1);
  const estMinutes = Math.ceil(peopleAhead * 0.1);

  return NextResponse.json({
    success: true,
    data: {
      inQueue: true,
      queueNumber: pos,
      peopleAhead,
      estimatedWaitMinutes: estMinutes,
      status: peopleAhead === 0 ? 'READY' : 'WAITING',
    },
  });
}
