import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit-logger';
import { broadcastConcertUpdate } from '@/lib/socket-server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const whereCondition = status ? { status: status as any } : {};

  const events = await prisma.event.findMany({
    where: whereCondition,
    include: {
      zones: {
        include: {
          seats: true,
        },
      },
    },
    orderBy: { eventDate: 'asc' },
  });

  return NextResponse.json({ success: true, data: events });
}

export async function POST(req: NextRequest) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { name, artist, description, venue, eventDate, startTime = '19:00', endTime = '22:00', posterUrl, capacity = 5000, status = 'ON_SALE' } = body;

    const event = await prisma.event.create({
      data: {
        name,
        artist,
        description,
        venue,
        eventDate: new Date(eventDate),
        startTime,
        endTime,
        posterUrl: posterUrl || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&q=80',
        capacity: Number(capacity),
        status,
      },
    });

    // Auto-create default Zone A and Zone B for new concert
    const zoneA = await prisma.eventZone.create({
      data: {
        eventId: event.id,
        name: 'Zone A (VIP)',
        price: 4500,
        capacity: 40,
        rowPattern: 'A-B',
        seatPattern: '1-20',
      },
    });

    const zoneB = await prisma.eventZone.create({
      data: {
        eventId: event.id,
        name: 'Zone B (Regular)',
        price: 2500,
        capacity: 60,
        rowPattern: 'C-E',
        seatPattern: '1-20',
      },
    });

    // Create seats for Zone A (A1..A20, B1..B20)
    const seatsA = [];
    for (const r of ['A', 'B']) {
      for (let i = 1; i <= 20; i++) {
        seatsA.push({
          zoneId: zoneA.id,
          seatNumber: `${r}${i < 10 ? '0' + i : i}`,
          rowName: r,
          seatIndex: i,
          status: 'AVAILABLE',
        });
      }
    }
    await prisma.seat.createMany({ data: seatsA });

    // Create seats for Zone B (C1..C20, D1..D20, E1..E20)
    const seatsB = [];
    for (const r of ['C', 'D', 'E']) {
      for (let i = 1; i <= 20; i++) {
        seatsB.push({
          zoneId: zoneB.id,
          seatNumber: `${r}${i < 10 ? '0' + i : i}`,
          rowName: r,
          seatIndex: i,
          status: 'AVAILABLE',
        });
      }
    }
    await prisma.seat.createMany({ data: seatsB });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'CREATE_CONCERT',
      resource: 'Event',
      resourceId: event.id,
      ipAddress: ip,
      payloadJson: { name, artist },
    });

    broadcastConcertUpdate();

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } }, { status: 500 });
  }
}
