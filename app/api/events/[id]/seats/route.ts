import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const eventId = params.id;

  const zones = await prisma.eventZone.findMany({
    where: { eventId },
    include: {
      seats: {
        orderBy: [{ rowName: 'asc' }, { seatIndex: 'asc' }],
      },
    },
  });

  return NextResponse.json({
    success: true,
    data: zones.map((zone) => ({
      id: zone.id,
      name: zone.name,
      price: Number(zone.price),
      seats: zone.seats.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber,
        rowName: s.rowName,
        seatIndex: s.seatIndex,
        status: s.status,
      })),
    })),
  });
}
