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
    const { eventId, name, price, startRow = 'F', endRow = 'H', seatsPerRow = 20 } = body;

    if (!eventId || !name || !price) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'กรุณากรอกข้อมูลให้ครบถ้วน' } },
        { status: 400 }
      );
    }

    const startCharCode = startRow.charCodeAt(0);
    const endCharCode = endRow.charCodeAt(0);
    const numRows = Math.max(1, endCharCode - startCharCode + 1);
    const capacity = numRows * Number(seatsPerRow);
    const rowPattern = `${startRow}-${endRow}`;
    const seatPattern = `1-${seatsPerRow}`;

    // Create Zone
    const zone = await prisma.eventZone.create({
      data: {
        eventId,
        name,
        price: Number(price),
        capacity,
        rowPattern,
        seatPattern,
      },
    });

    // Create Seats for this zone automatically
    const seatsToCreate = [];
    for (let r = startCharCode; r <= endCharCode; r++) {
      const rowName = String.fromCharCode(r);
      for (let i = 1; i <= Number(seatsPerRow); i++) {
        const seatNumber = `${rowName}${i < 10 ? '0' + i : i}`;
        seatsToCreate.push({
          zoneId: zone.id,
          seatNumber,
          rowName,
          seatIndex: i,
          status: 'AVAILABLE',
        });
      }
    }

    await prisma.seat.createMany({
      data: seatsToCreate,
    });

    return NextResponse.json({
      success: true,
      data: zone,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: (error as Error).message } },
      { status: 500 }
    );
  }
}
