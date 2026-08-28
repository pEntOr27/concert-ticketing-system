import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redisClient } from '@/lib/redis';

export async function GET() {
  let dbStatus = 'disconnected';
  let redisStatus = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = `error: ${(error as Error).message}`;
  }

  try {
    await redisClient.set('health_check', 'ok', 'EX', 5);
    const val = await redisClient.get('health_check');
    if (val === 'ok') redisStatus = 'connected';
  } catch (error) {
    redisStatus = `error: ${(error as Error).message}`;
  }

  const isOk = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: isOk ? 'ok' : 'degraded',
      database: dbStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    },
    { status: isOk ? 200 : 500 }
  );
}
