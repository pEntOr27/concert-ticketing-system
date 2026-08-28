import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { recordAuditLog } from '@/lib/audit-logger';
import { broadcastConcertUpdate } from '@/lib/socket-server';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        zones: {
          include: {
            seats: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'ไม่พบข้อมูลคอนเสิร์ต' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: event });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const { id } = params;
    const body = await req.json();
    const { name, artist, description, venue, eventDate, startTime, endTime, posterUrl, capacity, status } = body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(artist && { artist }),
        ...(description && { description }),
        ...(venue && { venue }),
        ...(eventDate && { eventDate: new Date(eventDate) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(posterUrl && { posterUrl }),
        ...(capacity && { capacity: Number(capacity) }),
        ...(status && { status }),
      },
    });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'UPDATE_CONCERT',
      resource: 'Event',
      resourceId: id,
      ipAddress: ip,
      payloadJson: { name, status },
    });

    broadcastConcertUpdate();

    return NextResponse.json({ success: true, data: updatedEvent });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireRole(['admin', 'super_admin']);
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: { code: auth.error, message: 'ไม่มีสิทธิ์เข้าถึง' } }, { status: auth.status });
  }

  try {
    const { id } = params;

    // Delete associated bookings, seats, zones, events
    const zones = await prisma.eventZone.findMany({ where: { eventId: id } });
    const zoneIds = zones.map((z) => z.id);

    await prisma.ticket.deleteMany({ where: { seat: { zoneId: { in: zoneIds } } } });
    await prisma.seatHold.deleteMany({ where: { seat: { zoneId: { in: zoneIds } } } });
    await prisma.bookingItem.deleteMany({ where: { seat: { zoneId: { in: zoneIds } } } });
    await prisma.booking.deleteMany({ where: { eventId: id } });
    await prisma.seat.deleteMany({ where: { zoneId: { in: zoneIds } } });
    await prisma.eventZone.deleteMany({ where: { eventId: id } });
    await prisma.event.delete({ where: { id } });

    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    await recordAuditLog({
      actorId: auth.user?.id,
      action: 'DELETE_CONCERT',
      resource: 'Event',
      resourceId: id,
      ipAddress: ip,
    });

    broadcastConcertUpdate();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } }, { status: 500 });
  }
}
